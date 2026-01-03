import OpenAI from 'openai';
import { logger } from '../logger';

/**
 * Generate embeddings for text using OpenAI API
 *
 * @param text - Text to embed
 * @param apiKey - OpenAI API key
 * @returns Embedding vector (1536 dimensions for text-embedding-3-small)
 */
export async function generateEmbeddings(text: string, apiKey: string): Promise<number[]> {
  const openai = new OpenAI({ apiKey });

  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text.slice(0, 8000), // Limit to ~8K tokens
    });

    return response.data[0].embedding;
  } catch (error: unknown) {
    logger.error('OpenAI embeddings failed', { error, text: text.slice(0, 100) });
    throw new Error(`Failed to generate embeddings: ${error}`);
  }
}

/**
 * Generate embeddings for multiple texts in batch
 * OpenAI supports up to 2048 inputs per request
 *
 * @param texts - Array of texts to embed
 * @param apiKey - OpenAI API key
 * @returns Array of embedding vectors
 */
export async function generateEmbeddingsBatch(
  texts: string[],
  apiKey: string
): Promise<number[][]> {
  try {
    const openai = new OpenAI({ apiKey });
    const BATCH_SIZE = 2048;
    const allEmbeddings: number[][] = [];

    // Process in batches
    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const batch = texts.slice(i, i + BATCH_SIZE);

      logger.debug('Generating batch embeddings', {
        batchSize: batch.length,
        totalTexts: texts.length,
        batchIndex: i / BATCH_SIZE + 1,
      });

      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: batch,
      });

      allEmbeddings.push(...response.data.map((d) => d.embedding));
    }

    logger.info('Batch embeddings generated', {
      totalTexts: texts.length,
      batches: Math.ceil(texts.length / BATCH_SIZE),
    });

    return allEmbeddings;
  } catch (error: unknown) {
    logger.error('Batch embeddings generation failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Calculate cosine similarity between two vectors
 *
 * @param a - First vector
 * @param b - Second vector
 * @returns Cosine similarity value
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
