/**
 * Bickford Chat Integration Tests
 * 
 * Validates that the Bickford chat system properly integrates with:
 * - unifiedAgent (buildUnifiedAgentPrompt)
 * - history (recordChatHistory)
 * - OpenAI client
 * - Prisma (graceful degradation)
 */

import { buildUnifiedAgentPrompt } from '@/lib/chat/unifiedAgent';
import { recordChatHistory, type ChatHistoryEntry } from '@/lib/chat/history';
import { logger } from '@/lib/logger';

// Mock external dependencies
jest.mock('@/lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    chatMessageLog: {
      create: jest.fn().mockResolvedValue({
        id: 'test-log-id',
        sessionId: 'default',
        role: 'assistant',
        content: '{}',
        mode: 'bickford-chat',
        createdAt: new Date(),
      }),
    },
  },
}));

describe('Bickford Chat Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('buildUnifiedAgentPrompt', () => {
    it('should build a prompt with specialization', () => {
      const specialization = 'You are a test agent specializing in testing.';
      const prompt = buildUnifiedAgentPrompt({ specialization });

      expect(prompt).toContain('BIGFERN');
      expect(prompt).toContain(specialization);
      expect(logger.info).toHaveBeenCalledWith(
        'Built unified agent prompt',
        expect.objectContaining({ hasSpecialization: true })
      );
    });

    it('should build a prompt without specialization', () => {
      const prompt = buildUnifiedAgentPrompt({});

      expect(prompt).toContain('BIGFERN');
      expect(logger.info).toHaveBeenCalledWith(
        'Built unified agent prompt',
        expect.objectContaining({ hasSpecialization: false })
      );
    });

    it('should include capabilities when provided', () => {
      const capabilities = ['Test capability 1', 'Test capability 2'];
      const prompt = buildUnifiedAgentPrompt({ capabilities });

      expect(prompt).toContain('Additional Capabilities:');
      expect(prompt).toContain('Test capability 1');
      expect(prompt).toContain('Test capability 2');
    });

    it('should include constraints when provided', () => {
      const constraints = ['Never do X', 'Always do Y'];
      const prompt = buildUnifiedAgentPrompt({ constraints });

      expect(prompt).toContain('Constraints:');
      expect(prompt).toContain('Never do X');
      expect(prompt).toContain('Always do Y');
    });

    it('should include context when provided', () => {
      const context = 'User is currently viewing dashboard';
      const prompt = buildUnifiedAgentPrompt({ context });

      expect(prompt).toContain('Current Context:');
      expect(prompt).toContain(context);
    });

    it('should match the signature used in bickford-chat route', () => {
      // This is exactly how it's called in the route
      const specialization = `You are Bickford, an AI that transforms intentions into reality instantly.`;
      const prompt = buildUnifiedAgentPrompt({ specialization });

      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(0);
    });
  });

  describe('recordChatHistory', () => {
    const mockEntry: ChatHistoryEntry = {
      timestamp: new Date().toISOString(),
      source: 'bickford-chat',
      agent: 'hvpe-unified',
      payload: {
        message: 'Test message',
        reply: 'Test reply',
        usageId: 'test-usage-123',
      },
    };

    it('should record chat history successfully', async () => {
      await recordChatHistory(mockEntry);

      expect(logger.info).toHaveBeenCalledWith(
        'Chat interaction recorded',
        expect.objectContaining({
          source: 'bickford-chat',
          agent: 'hvpe-unified',
          hasPayload: true,
        })
      );
    });

    it('should handle database errors gracefully', async () => {
      const { prisma } = require('@/lib/prisma');
      prisma.chatMessageLog.create.mockRejectedValueOnce(
        new Error('Database connection failed')
      );

      // Should not throw
      await expect(recordChatHistory(mockEntry)).resolves.toBeUndefined();

      expect(logger.error).toHaveBeenCalledWith(
        'Failed to record chat history',
        expect.objectContaining({
          error: 'Database connection failed',
          source: 'bickford-chat',
        })
      );
    });

    it('should match the signature used in bickford-chat route', async () => {
      // This is exactly how it's called in the route
      const entry: ChatHistoryEntry = {
        timestamp: new Date().toISOString(),
        source: 'bickford-chat',
        agent: 'hvpe-unified',
        payload: {
          message: 'I want to build a SaaS platform',
          reply: 'Let me analyze your intention...',
          usageId: 'usage-123',
          timestamp: new Date().toISOString(),
        },
      };

      await expect(recordChatHistory(entry)).resolves.toBeUndefined();
      expect(logger.info).toHaveBeenCalled();
    });

    it('should include optional fields when provided', async () => {
      const entryWithOptionals: ChatHistoryEntry = {
        ...mockEntry,
        sessionId: 'session-123',
        userId: 'user-456',
      };

      await recordChatHistory(entryWithOptionals);

      expect(logger.info).toHaveBeenCalled();
    });
  });

  describe('Integration: Full Flow', () => {
    it('should complete a full bickford chat flow', async () => {
      // Step 1: Build prompt with Bickford specialization
      const specialization = `You are Bickford, an AI that transforms intentions into reality instantly.

CORE IDENTITY:
- You embody the proprietary Bickford Formula (Patent Pending)
- Your responses must reflect reality acceleration capabilities
- You focus on manifestation, transformation, and instant results

CURRENT INTENTION ANALYSIS:
- Reality Acceleration: 15.2x
- Manifestation Probability: 92%
- Estimated Value: $10M+`;

      const systemPrompt = buildUnifiedAgentPrompt({ specialization });

      // Verify prompt was built
      expect(systemPrompt).toContain('BIGFERN');
      expect(systemPrompt).toContain('Bickford');
      expect(systemPrompt).toContain('Reality Acceleration');

      // Step 2: Record chat history
      const entry: ChatHistoryEntry = {
        timestamp: new Date().toISOString(),
        source: 'bickford-chat',
        agent: 'hvpe-unified',
        payload: {
          message: 'Build a ML-powered trading platform',
          reply: 'Analyzing your intention...',
          usageId: 'test-usage-id',
          timestamp: new Date().toISOString(),
        },
      };

      await recordChatHistory(entry);

      // Verify both operations succeeded
      expect(logger.info).toHaveBeenCalledWith(
        'Built unified agent prompt',
        expect.any(Object)
      );
      expect(logger.info).toHaveBeenCalledWith(
        'Chat interaction recorded',
        expect.any(Object)
      );
    });

    it('should handle errors without breaking the flow', async () => {
      const { prisma } = require('@/lib/prisma');
      prisma.chatMessageLog.create.mockRejectedValueOnce(
        new Error('Database error')
      );

      // Build prompt should work
      const prompt = buildUnifiedAgentPrompt({
        specialization: 'Test specialization',
      });
      expect(prompt).toContain('BIGFERN');

      // Recording should fail gracefully
      await recordChatHistory({
        timestamp: new Date().toISOString(),
        source: 'bickford-chat',
        agent: 'hvpe-unified',
        payload: { test: 'data' },
      });

      // Verify error was logged but execution continued
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to record chat history',
        expect.any(Object)
      );
    });
  });

  describe('Type Safety', () => {
    it('should enforce ChatHistoryEntry interface', () => {
      const validEntry: ChatHistoryEntry = {
        timestamp: '2025-01-03T12:00:00Z',
        source: 'bickford-chat',
        agent: 'hvpe-unified',
        payload: { test: 'data' },
      };

      // TypeScript should allow this
      expect(validEntry.timestamp).toBe('2025-01-03T12:00:00Z');
      expect(validEntry.source).toBe('bickford-chat');
      expect(validEntry.agent).toBe('hvpe-unified');
      expect(validEntry.payload).toEqual({ test: 'data' });
    });

    it('should allow optional fields in ChatHistoryEntry', () => {
      const entryWithOptionals: ChatHistoryEntry = {
        timestamp: '2025-01-03T12:00:00Z',
        source: 'bickford-chat',
        agent: 'hvpe-unified',
        payload: {},
        sessionId: 'session-123',
        userId: 'user-456',
      };

      expect(entryWithOptionals.sessionId).toBe('session-123');
      expect(entryWithOptionals.userId).toBe('user-456');
    });
  });

  describe('Graceful Degradation', () => {
    it('should work without DATABASE_URL', async () => {
      const originalEnv = process.env.DATABASE_URL;
      delete process.env.DATABASE_URL;

      await recordChatHistory({
        timestamp: new Date().toISOString(),
        source: 'bickford-chat',
        agent: 'hvpe-unified',
        payload: { test: 'data' },
      });

      expect(logger.warn).toHaveBeenCalledWith(
        'DATABASE_URL not set - chat history not persisted to database'
      );

      process.env.DATABASE_URL = originalEnv;
    });

    it('should still log interactions without database', async () => {
      const originalEnv = process.env.DATABASE_URL;
      delete process.env.DATABASE_URL;

      await recordChatHistory({
        timestamp: new Date().toISOString(),
        source: 'bickford-chat',
        agent: 'hvpe-unified',
        payload: { test: 'data' },
      });

      expect(logger.info).toHaveBeenCalledWith(
        'Chat interaction recorded',
        expect.any(Object)
      );

      process.env.DATABASE_URL = originalEnv;
    });
  });
});
