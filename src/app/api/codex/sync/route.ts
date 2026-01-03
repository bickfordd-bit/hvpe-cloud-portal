import { NextRequest, NextResponse } from 'next/server';
import { apiSuccess, apiError } from '@/lib/apiResponse';
import { logger } from '@/lib/logger';
import {
  verifyCodexSecret,
  syncCodexChanges,
  previewCodexChanges,
  type CodexTask,
} from '@/lib/codex/sync';

/**
 * POST /api/codex/sync
 * Receives task completion from Codex and automatically applies changes
 */
export async function POST(req: NextRequest) {
  try {
    // Verify webhook secret
    const secret = req.headers.get('x-codex-secret');
    if (!secret || !verifyCodexSecret(secret)) {
      logger.warn('Codex sync: unauthorized attempt', {
        ip: req.headers.get('x-forwarded-for'),
      });
      return NextResponse.json(apiError(new Error('Unauthorized')), { status: 401 });
    }

    const body = await req.json();
    const task: CodexTask = body;

    // Validate task
    if (!task.taskId || !task.description || !Array.isArray(task.changes)) {
      return NextResponse.json(
        apiError(new Error('Invalid task format: missing taskId, description, or changes')),
        { status: 400 }
      );
    }

    logger.info('Codex sync request received', {
      taskId: task.taskId,
      description: task.description,
      changes: task.changes.length,
    });

    // Check for preview-only mode
    const previewOnly = req.nextUrl.searchParams.get('preview') === 'true';
    if (previewOnly) {
      const preview = await previewCodexChanges(task);
      return NextResponse.json(
        apiSuccess({
          mode: 'preview',
          preview,
          task,
        })
      );
    }

    // Apply changes
    const result = await syncCodexChanges(task);

    if (!result.success) {
      return NextResponse.json(apiError(new Error(result.error || 'Sync failed')), { status: 500 });
    }

    return NextResponse.json(
      apiSuccess({
        message: 'Codex changes synced successfully',
        ...result,
      })
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Codex sync endpoint error', { error: errorMessage });
    return NextResponse.json(apiError(error), { status: 500 });
  }
}

/**
 * GET /api/codex/sync
 * Health check and status
 */
export async function GET(req: NextRequest) {
  const isConfigured = !!process.env.CODEX_WEBHOOK_SECRET;

  return NextResponse.json(
    apiSuccess({
      status: 'online',
      configured: isConfigured,
      endpoint: '/api/codex/sync',
      methods: ['GET', 'POST'],
      authentication: 'x-codex-secret header required',
      usage: {
        sync: 'POST with CodexTask body',
        preview: 'POST with ?preview=true query param',
      },
    })
  );
}
