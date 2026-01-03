/**
 * OPTR Processor Tests
 */

import { cosine, dot, norm } from '../t2v';
import { processOpportunity } from '../processor';
import { logger } from '@/lib/logger';
import type { ProcessorConfig } from '../processor';

// Mock logger to avoid console spam in tests
jest.mock('@/lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));
jest.mock('openai');

describe('OPTR Math Functions', () => {
  describe('dot product', () => {
    it('should calculate dot product correctly', () => {
      const a = [1, 2, 3];
      const b = [4, 5, 6];
      const result = dot(a, b);
      expect(result).toBe(32); // 1*4 + 2*5 + 3*6 = 32
    });

    it('should handle zero vectors', () => {
      const a = [0, 0, 0];
      const b = [1, 2, 3];
      expect(dot(a, b)).toBe(0);
    });
  });

  describe('norm', () => {
    it('should calculate vector norm correctly', () => {
      const a = [3, 4];
      expect(norm(a)).toBe(5); // √(3² + 4²) = 5
    });

    it('should handle unit vectors', () => {
      const a = [1, 0, 0];
      expect(norm(a)).toBe(1);
    });
  });

  describe('cosine similarity', () => {
    it('should return 1 for identical vectors', () => {
      const a = [1, 2, 3];
      const b = [1, 2, 3];
      expect(cosine(a, b)).toBeCloseTo(1, 5);
    });

    it('should return 0 for orthogonal vectors', () => {
      const a = [1, 0];
      const b = [0, 1];
      expect(cosine(a, b)).toBeCloseTo(0, 5);
    });

    it('should handle zero vectors', () => {
      const a = [0, 0, 0];
      const b = [1, 2, 3];
      expect(cosine(a, b)).toBe(0);
    });

    it('should return correct similarity for known vectors', () => {
      const a = [1, 2, 3];
      const b = [2, 4, 6];
      expect(cosine(a, b)).toBeCloseTo(1, 5); // Parallel vectors
    });
  });
});

describe('OPTR Processor', () => {
  const mockOpportunityId = 'test-opp-123';
  const mockConfig: ProcessorConfig = {
    maxConcurrentEmbeddings: 5,
    similarityThreshold: 0.7,
    topK: 5,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully process an opportunity', async () => {
    const result = await processOpportunity(mockOpportunityId, mockConfig);

    expect(result.success).toBe(true);
    expect(result.opportunityId).toBe(mockOpportunityId);
    expect(result.traces.length).toBeGreaterThan(0);
    expect(logger.info).toHaveBeenCalledWith(
      'OPTR pipeline completed',
      expect.objectContaining({ opportunityId: mockOpportunityId })
    );
  });

  it('should create traces for all pipeline stages', async () => {
    const result = await processOpportunity(mockOpportunityId, mockConfig);

    const stages = result.traces.filter((t) => t.status === 'completed').map((t) => t.stage);

    expect(stages).toContain('ingestion');
    expect(stages).toContain('embeddings');
    expect(stages).toContain('retrieval');
    expect(stages).toContain('scoring');
  });

  it('should return scored requirements', async () => {
    const result = await processOpportunity(mockOpportunityId, mockConfig);

    expect(result.requirements).toBeDefined();
    expect(result.requirements?.length).toBeGreaterThanOrEqual(0);
    if (result.requirements && result.requirements.length > 0) {
      expect(result.requirements[0]).toHaveProperty('score');
      expect(result.requirements[0]).toHaveProperty('status');
    }
  });

  it('should include summary with execution time', async () => {
    const result = await processOpportunity(mockOpportunityId, mockConfig);

    expect(result.summary).toBeDefined();
    expect(result.summary.executionTimeMs).toBeGreaterThan(0);
    expect(result.summary.totalRequirements).toBeGreaterThanOrEqual(0);
  });

  it('should handle errors gracefully', async () => {
    // Mock an error by passing invalid opportunity ID
    const invalidOppId = 'non-existent-opp';

    const result = await processOpportunity(invalidOppId, mockConfig);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(logger.error).toHaveBeenCalled();

    const errorTrace = result.traces.find((t) => t.status === 'failed');
    expect(errorTrace).toBeDefined();
  });

  it('should log processing completion', async () => {
    await processOpportunity(mockOpportunityId, mockConfig);

    expect(logger.info).toHaveBeenCalledWith(
      'OPTR pipeline completed',
      expect.objectContaining({
        opportunityId: mockOpportunityId,
        totalDuration: expect.any(Number),
      })
    );
  });
});
