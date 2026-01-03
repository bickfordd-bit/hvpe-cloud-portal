import type {
  DEFeaturesWorkbook,
  FeatureMatchResult,
  DEFeatureAnalysisResult,
  ChoiceIndex,
  FeatureId,
} from './types';
import { DEFeaturesParser } from './parser';
import { logger } from '@/lib/logger';
import { generateEmbeddings, generateEmbeddingsBatch } from '@/lib/optr/embeddings';
import { keyManager } from '@/lib/ai/keyManager';

/**
 * Semantic matcher for requirements → DE features
 * Uses vector similarity on embeddings
 */
export class DEFeaturesMatcher {
  private workbook: DEFeaturesWorkbook;
  private featureEmbeddings: Map<string, number[]> = new Map();

  constructor(workbook: DEFeaturesWorkbook) {
    this.workbook = workbook;
  }

  /**
   * Pre-compute embeddings for all features and choices
   */
  async initialize(): Promise<void> {
    logger.info('Computing DE feature embeddings');

    // Get API key securely
    const apiKey = keyManager.getKey();

    // Check rate limits before proceeding
    const rateLimitStatus = keyManager.getRateLimitStatus();
    if (rateLimitStatus.shouldThrottle) {
      logger.warn('Rate limit threshold reached, throttling embedding generation');
      // Wait 60 seconds for window to reset
      await new Promise((resolve) => setTimeout(resolve, 60000));
    }

    const textsToEmbed: string[] = [];
    const keys: string[] = [];

    // Embed each feature description
    for (const feature of this.workbook.features) {
      textsToEmbed.push(feature.description);
      keys.push(`feature_${feature.id}`);
    }

    // Embed each choice (only non-null)
    for (const [key, value] of this.workbook.choices.entries()) {
      if (value) {
        textsToEmbed.push(value);
        keys.push(`choice_${key}`);
      }
    }

    // Generate embeddings in batch
    const embeddings: number[][] = await generateEmbeddingsBatch(textsToEmbed, apiKey);

    // Track usage
    const tokensUsed = textsToEmbed.reduce((sum, text) => sum + Math.ceil(text.length / 4), 0);
    keyManager.trackUsage(tokensUsed);

    // Store in map
    for (let i = 0; i < keys.length; i++) {
      this.featureEmbeddings.set(keys[i], embeddings[i]);
    }

    logger.info('Embeddings computed', {
      count: embeddings.length,
      tokensUsed,
      rateLimitStatus: keyManager.getRateLimitStatus(),
    });
  }

  /**
   * Match requirements to DE features
   */
  async matchRequirements(requirements: string[], topK: number = 5): Promise<FeatureMatchResult[]> {
    logger.info('Matching requirements to DE features', {
      requirementCount: requirements.length,
    });

    // Get API key securely
    const apiKey = keyManager.getKey();

    // Check rate limits
    const rateLimitStatus = keyManager.getRateLimitStatus();
    if (rateLimitStatus.shouldThrottle) {
      throw new Error('Rate limit exceeded. Please try again in 60 seconds.');
    }

    // Generate embeddings for requirements
    const reqEmbeddings: number[][] = await generateEmbeddingsBatch(requirements, apiKey);

    // Track usage
    const tokensUsed = requirements.reduce((sum, req) => sum + Math.ceil(req.length / 4), 0);
    keyManager.trackUsage(tokensUsed);

    const results: FeatureMatchResult[] = [];

    // For each requirement, find best matching features
    for (let i = 0; i < requirements.length; i++) {
      const reqEmb = reqEmbeddings[i];
      const req = requirements[i];

      // Compute similarity to all features
      const featureScores = this.workbook.features.map((feature) => {
        const featEmb = this.featureEmbeddings.get(`feature_${feature.id}`);
        if (!featEmb) return { feature, score: 0 };

        const score = this.cosineSimilarity(reqEmb, featEmb);
        return { feature, score };
      });

      // Sort by score descending
      featureScores.sort((a, b) => b.score - a.score);

      // Take top K
      const topFeatures = featureScores.slice(0, topK);

      // For each top feature, find best choices
      for (const { feature, score } of topFeatures) {
        const matchedChoices = this.findBestChoices(feature.id, reqEmb, topK);
        const standards = DEFeaturesParser.getStandards(this.workbook, feature.id);
        const metrics = DEFeaturesParser.getMetrics(this.workbook, feature.id);

        results.push({
          feature,
          relevanceScore: score,
          matchedChoices,
          applicableStandards: standards,
          relatedMetrics: metrics,
        });
      }
    }

    // Deduplicate by feature ID (keep highest score)
    const deduped = new Map<string, FeatureMatchResult>();
    for (const result of results) {
      const existing = deduped.get(result.feature.id);
      if (!existing || result.relevanceScore > existing.relevanceScore) {
        deduped.set(result.feature.id, result);
      }
    }

    return Array.from(deduped.values()).sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Find best matching choices for a feature
   */
  private findBestChoices(
    featureId: string,
    reqEmbedding: number[],
    topK: number
  ): FeatureMatchResult['matchedChoices'] {
    const choiceScores: Array<{
      choiceIndex: ChoiceIndex;
      choiceText: string;
      score: number;
    }> = [];

    for (let j = 1; j <= 13; j++) {
      const choiceIndex = j as ChoiceIndex;
      const key = `${featureId}_c${choiceIndex}`;
      const choiceText = this.workbook.choices.get(key);

      if (!choiceText) continue;

      const choiceEmb = this.featureEmbeddings.get(`choice_${key}`);
      if (!choiceEmb) continue;

      const score = this.cosineSimilarity(reqEmbedding, choiceEmb);
      choiceScores.push({ choiceIndex, choiceText, score });
    }

    // Sort and take top K
    choiceScores.sort((a, b) => b.score - a.score);

    return choiceScores.slice(0, topK).map((c) => ({
      choiceIndex: c.choiceIndex,
      choiceText: c.choiceText,
      contractLanguage: DEFeaturesParser.getContractLanguage(
        this.workbook,
        featureId as FeatureId,
        c.choiceIndex
      ),
      score: c.score,
    }));
  }

  /**
   * Analyze complete opportunity against DE features
   */
  async analyzeOpportunity(
    opportunityId: string,
    requirements: string[]
  ): Promise<DEFeatureAnalysisResult> {
    const matchedFeatures = await this.matchRequirements(requirements, 10);

    // Calculate coverage score (% of requirements with good matches)
    const wellMatched = matchedFeatures.filter((m) => m.relevanceScore > 0.7).length;
    const coverageScore = (wellMatched / requirements.length) * 100;

    // Identify gaps (requirements with no good matches)
    const gaps = requirements
      .map((req, idx) => {
        const bestMatch = matchedFeatures.find(
          (m) => m.relevanceScore > 0.5 && idx < matchedFeatures.length
        );

        if (!bestMatch) {
          return {
            requirement: req,
            reason: 'No matching DE features found (score < 0.5)',
            suggestedFeatures: matchedFeatures.slice(0, 3).map((m) => m.feature.id),
          };
        }

        return null;
      })
      .filter((g): g is NonNullable<typeof g> => g !== null);

    return {
      opportunityId,
      extractedRequirements: requirements,
      matchedFeatures,
      coverageScore,
      gaps,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
