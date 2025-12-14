import { cosineSimilarity } from './embeddings';
import { calculateConfidenceInterval, calculateQualityScore } from './statistics';
import type { ScoredRequirement } from './types';

interface RequirementWithEmbedding {
  id: string;
  text: string;
  priority: string;
  embedding: number[];
}

interface Document {
  id: string;
  text: string;
  score?: number;
}

export async function scoreRequirements(
  requirements: RequirementWithEmbedding[],
  documents: Document[],
  threshold: number
): Promise<ScoredRequirement[]> {
  return requirements.map((req) => {
    // Calculate similarity to all documents
    const similarities = documents.map(doc => 
      calculateMockSimilarity(req.text, doc.text)
    );
    
    const maxSimilarity = Math.max(...similarities);
    const avgSimilarity = similarities.reduce((a, b) => a + b, 0) / similarities.length;
    
    // Calculate confidence interval for score
    const confidenceInterval = calculateConfidenceInterval(
      similarities.map(s => s * 100)
    );
    
    const score = Math.round(maxSimilarity * 100);
    const status = score >= 70 ? 'met' : score >= 40 ? 'partial' : 'gap';

    return {
      id: req.id,
      text: req.text,
      score,
      status,
      matchedDocuments: documents
        .filter(d => calculateMockSimilarity(req.text, d.text) >= threshold)
        .map(d => d.id),
      priority: req.priority as 'high' | 'medium' | 'low',
      confidence: {
        interval: confidenceInterval,
        quality: calculateQualityScore(similarities.map(s => s * 100)),
      },
      explanation: generateExplanation(score, confidenceInterval, req.priority),
    };
  });
}

function generateExplanation(
  score: number,
  confidence: { lower: number; upper: number },
  priority: string
): string {
  const range = `${confidence.lower.toFixed(0)}-${confidence.upper.toFixed(0)}%`;
  
  if (score >= 70) {
    return `Strong match (${score}%, 95% CI: ${range}). ${priority === 'high' ? 'Critical requirement met.' : 'Requirement satisfied.'}`;
  } else if (score >= 40) {
    return `Partial match (${score}%, 95% CI: ${range}). ${priority === 'high' ? 'May need clarification.' : 'Consider addressing.'}`;
  } else {
    return `Weak match (${score}%, 95% CI: ${range}). ${priority === 'high' ? 'HIGH RISK: Address immediately.' : 'Gap identified.'}`;
  }
}

function calculateMockSimilarity(text1: string, text2: string): number {
  // Simple keyword-based similarity for MVP
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}
