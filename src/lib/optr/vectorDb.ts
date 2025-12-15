import { logger } from '@/lib/logger';

export interface ScoredDocument {
  id: string;
  score: number;
  text: string;
  metadata: Record<string, unknown>;
}

export interface VectorStore {
  upsert(id: string, embedding: number[], metadata: object): Promise<void>;
  query(embedding: number[], topK: number): Promise<ScoredDocument[]>;
  delete(id: string): Promise<void>;
}

/**
 * Placeholder vector store implementation
 * TODO: Implement with pgvector, Pinecone, or Weaviate
 */
export class InMemoryVectorStore implements VectorStore {
  private vectors: Map<string, { embedding: number[]; metadata: object }> = new Map();

  async upsert(id: string, embedding: number[], metadata: object): Promise<void> {
    logger.debug('Vector upsert', { id, dimensions: embedding.length });
    this.vectors.set(id, { embedding, metadata });
  }

  async query(embedding: number[], topK: number): Promise<ScoredDocument[]> {
    logger.debug('Vector query', { dimensions: embedding.length, topK });

    // Compute cosine similarity for all vectors
    const results: ScoredDocument[] = [];

    for (const [id, data] of this.vectors.entries()) {
      const score = this.cosineSimilarity(embedding, data.embedding);
      results.push({
        id,
        score,
        text: (data.metadata as { text?: string }).text || '',
        metadata: data.metadata as Record<string, unknown>,
      });
    }

    // Sort by score descending and return top K
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  async delete(id: string): Promise<void> {
    logger.debug('Vector delete', { id });
    this.vectors.delete(id);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
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
}

export const vectorStore = new InMemoryVectorStore();
