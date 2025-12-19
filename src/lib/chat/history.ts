/**
 * Chat History Recording
 * Persists all chat interactions for audit, analytics, and training
 */

import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

export interface ChatHistoryEntry {
  timestamp: string;
  source: string; // 'hvpe-chat', 'bickford-chat', etc.
  agent: string; // 'bigfern-unified', 'optr', etc.
  payload: any; // Mode, messages, reply, etc.
  sessionId?: string;
  userId?: string;
}

/**
 * Record a chat interaction to database and logs
 */
export async function recordChatHistory(entry: ChatHistoryEntry): Promise<void> {
  try {
    // Log to structured logs
    logger.info('Chat interaction recorded', {
      source: entry.source,
      agent: entry.agent,
      timestamp: entry.timestamp,
      hasPayload: !!entry.payload,
    });

    // Skip database if not configured (graceful degradation)
    if (!process.env.DATABASE_URL) {
      logger.warn('DATABASE_URL not set - chat history not persisted to database');
      return;
    }

    // Persist to database
    await prisma.chatMessageLog.create({
      data: {
        sessionId: entry.sessionId || 'default',
        role: 'assistant',
        content: JSON.stringify(entry.payload),
        mode: entry.source,
        createdAt: new Date(entry.timestamp),
      },
    });

    logger.debug('Chat history persisted to database', { source: entry.source });
  } catch (error: any) {
    // Don't fail the request if history recording fails
    logger.error('Failed to record chat history', {
      error: error.message,
      source: entry.source,
    });
  }
}

/**
 * Query chat history for a session
 */
export async function getChatHistory(
  sessionId: string,
  limit: number = 50
): Promise<any[]> {
  if (!process.env.DATABASE_URL) {
    logger.warn('DATABASE_URL not set - returning empty chat history');
    return [];
  }

  try {
    const history = await prisma.chatMessageLog.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return history.map((entry) => ({
      id: entry.id,
      timestamp: entry.createdAt.toISOString(),
      role: entry.role,
      content: entry.content,
      mode: entry.mode,
    }));
  } catch (error: any) {
    logger.error('Failed to query chat history', {
      error: error.message,
      sessionId,
    });
    return [];
  }
}

/**
 * Archive old chat sessions
 */
export async function archiveChatHistory(beforeDate: Date): Promise<number> {
  if (!process.env.DATABASE_URL) {
    return 0;
  }

  try {
    const result = await prisma.chatMessageLog.deleteMany({
      where: {
        createdAt: {
          lt: beforeDate,
        },
      },
    });

    logger.info('Chat history archived', {
      count: result.count,
      beforeDate: beforeDate.toISOString(),
    });

    return result.count;
  } catch (error: any) {
    logger.error('Failed to archive chat history', {
      error: error.message,
      beforeDate: beforeDate.toISOString(),
    });
    return 0;
  }
}
