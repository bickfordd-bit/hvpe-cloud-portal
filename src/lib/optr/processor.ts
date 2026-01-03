import { generateEmbeddings } from './embeddings';
import { scoreRequirements } from './scoring';
import { logger } from '../logger';
import type { OPTRState, RunResult, Trace, ScoredRequirement } from './types';
import { prisma } from '../prisma';

export interface ProcessorConfig {
  maxConcurrentEmbeddings?: number;
  similarityThreshold?: number;
  topK?: number;
}

const DEFAULT_CONFIG: ProcessorConfig = {
  maxConcurrentEmbeddings: 10,
  similarityThreshold: 0.7,
  topK: 5,
};

export async function processOpportunity(
  opportunityId: string,
  config: ProcessorConfig = {}
): Promise<RunResult> {
  const startTime = Date.now();
  const traces: Trace[] = [];
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  try {
    // Stage 1: Fetch opportunity
    traces.push(createTrace('ingestion', 'started', 'Fetching opportunity from database'));
    const opportunity = await fetchOpportunity(opportunityId);
    traces.push(createTrace('ingestion', 'completed', `Loaded opportunity: ${opportunity.title}`));

    // Stage 2: Generate embeddings
    traces.push(createTrace('embeddings', 'started', 'Generating embeddings for requirements'));
    const requirements = await generateRequirementEmbeddings(
      opportunity.requirements,
      mergedConfig.maxConcurrentEmbeddings!
    );
    traces.push(
      createTrace('embeddings', 'completed', `Generated ${requirements.length} embeddings`)
    );

    // Stage 3: Retrieve relevant documents (stub for now - will add vector DB later)
    traces.push(createTrace('retrieval', 'started', 'Searching for matching documents'));
    const documents = await retrieveDocuments(requirements, mergedConfig.topK!);
    traces.push(
      createTrace('retrieval', 'completed', `Found ${documents.length} relevant documents`)
    );

    // Stage 4: Score requirements
    traces.push(createTrace('scoring', 'started', 'Scoring requirements against documents'));
    const scoredRequirements = await scoreRequirements(
      requirements,
      documents,
      mergedConfig.similarityThreshold!
    );
    traces.push(
      createTrace('scoring', 'completed', `Scored ${scoredRequirements.length} requirements`)
    );

    // Stage 5: Calculate aggregate metrics
    const avgScore =
      scoredRequirements.reduce((sum, r) => sum + r.score, 0) / scoredRequirements.length;
    const coverage =
      scoredRequirements.filter((r) => r.score >= 70).length / scoredRequirements.length;

    traces.push(
      createTrace(
        'aggregation',
        'completed',
        `Average score: ${avgScore.toFixed(1)}%, Coverage: ${(coverage * 100).toFixed(1)}%`
      )
    );

    const result: RunResult = {
      success: true,
      opportunityId,
      traces,
      summary: {
        totalRequirements: requirements.length,
        averageScore: Math.round(avgScore),
        coverage: Math.round(coverage * 100),
        executionTimeMs: Date.now() - startTime,
      },
      requirements: scoredRequirements,
    };

    logger.info('OPTR pipeline completed', {
      opportunityId,
      executionTimeMs: result.summary.executionTimeMs,
      averageScore: result.summary.averageScore,
    });

    return result;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('OPTR pipeline failed', { opportunityId, error: errorMessage });

    traces.push(createTrace('error', 'failed', `Pipeline failed: ${errorMessage}`));

    return {
      success: false,
      opportunityId,
      traces,
      error: errorMessage,
      summary: {
        totalRequirements: 0,
        averageScore: 0,
        coverage: 0,
        executionTimeMs: Date.now() - startTime,
      },
      requirements: [],
    };
  }
}

async function fetchOpportunity(opportunityId: string) {
  const opportunity = await prisma.opportunity.findUnique({
    where: { id: opportunityId },
    include: { requirements: true },
  });

  if (!opportunity) {
    throw new Error(`Opportunity ${opportunityId} not found`);
  }

  return {
    id: opportunity.id,
    title: opportunity.title,
    description: opportunity.description || '',
    requirements: opportunity.requirements.map(
      (r: { id: string; text: string; priority: string }) => ({
        id: r.id,
        text: r.text,
        priority: r.priority as 'high' | 'medium' | 'low',
      })
    ),
  };
}

async function generateRequirementEmbeddings(
  requirements: Array<{ id: string; text: string; priority: string }>,
  maxConcurrent: number
) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.HVPE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const results = [];
  for (let i = 0; i < requirements.length; i += maxConcurrent) {
    const batch = requirements.slice(i, i + maxConcurrent);
    const embeddings = await Promise.all(
      batch.map(async (req) => ({
        ...req,
        embedding: await generateEmbeddings(req.text, apiKey),
      }))
    );
    results.push(...embeddings);
  }

  return results;
}

async function retrieveDocuments(
  requirements: Array<{ id: string; text: string; embedding: number[] }>,
  topK: number
) {
  // TODO: Replace with real vector DB (Pinecone/pgvector)
  // For MVP, return mock documents based on keyword matching
  const mockDocs = [
    { id: 'doc1', text: 'Cloud infrastructure services with AWS and Azure', score: 0.85 },
    { id: 'doc2', text: 'Security compliance and SOC2 certification', score: 0.78 },
    { id: 'doc3', text: 'API integration and microservices architecture', score: 0.72 },
  ];

  return mockDocs.slice(0, topK);
}

function createTrace(
  stage: string,
  status: 'started' | 'completed' | 'failed',
  message: string
): Trace {
  return {
    timestamp: new Date().toISOString(),
    stage,
    status,
    message,
  };
}

// Alias for backwards compatibility
export const runOptr = processOpportunity;
