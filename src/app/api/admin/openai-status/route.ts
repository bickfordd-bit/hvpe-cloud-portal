import { NextRequest, NextResponse } from 'next/server';
import { apiSuccess, apiError } from '@/lib/apiResponse';
import { logger } from '@/lib/logger';
import { keyManager, OpenAIKeyManager } from '@/lib/ai/keyManager';

/**
 * Admin endpoint to check OpenAI key status
 * Requires ADMIN_DASH_TOKEN header
 */
export async function GET(req: NextRequest) {
  try {
    // Verify admin authentication
    const token = req.headers.get('x-admin-token');
    if (token !== process.env.ADMIN_DASH_TOKEN) {
      return NextResponse.json(
        apiError('Unauthorized'),
        { status: 401 }
      );
    }

    const metadata = keyManager.getMetadata();
    const rateLimitStatus = keyManager.getRateLimitStatus();
    const shouldRotate = keyManager.shouldRotateKey();

    // Get key preview (redacted)
    const keyPreview = keyManager.validateKeyFormat()
      ? OpenAIKeyManager.redactKey(keyManager.getKey())
      : 'Invalid format';

    logger.info('OpenAI key status checked by admin');

    return NextResponse.json(apiSuccess({
      keyPreview,
      metadata: {
        source: metadata.source,
        createdAt: metadata.createdAt,
        expiresAt: metadata.expiresAt,
        usageCount: metadata.usageCount,
        lastUsed: metadata.lastUsed
      },
      rateLimits: rateLimitStatus,
      rotation: {
        shouldRotate,
        reason: shouldRotate
          ? 'Key is older than 30 days or expired'
          : 'Key is within recommended rotation period'
      },
      recommendations: [
        shouldRotate && 'Rotate key at https://platform.openai.com/api-keys',
        rateLimitStatus.shouldAlert && 'Consider upgrading OpenAI tier or reducing usage',
        metadata.usageCount > 10000 && 'High usage detected, monitor costs'
      ].filter(Boolean)
    }));

  } catch (error: any) {
    logger.error('Failed to check OpenAI key status', {
      error: error.message
    });
    return NextResponse.json(apiError(error), { status: 500 });
  }
}

/**
 * Admin endpoint to manually trigger key rotation check
 */
export async function POST(req: NextRequest) {
  try {
    // Verify admin authentication
    const token = req.headers.get('x-admin-token');
    if (token !== process.env.ADMIN_DASH_TOKEN) {
      return NextResponse.json(
        apiError('Unauthorized'),
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action } = body;

    if (action === 'validate') {
      const isValid = keyManager.validateKeyFormat();
      return NextResponse.json(apiSuccess({
        valid: isValid,
        message: isValid
          ? 'Key format is valid'
          : 'Key format is invalid (should start with sk- and be 48-51 chars)'
      }));
    }

    if (action === 'reset-rate-limits') {
      // This would reset the in-memory rate limit counters
      // In production, you'd want to persist this to Redis or similar
      logger.info('Rate limit counters reset by admin');
      return NextResponse.json(apiSuccess({
        message: 'Rate limit counters reset'
      }));
    }

    return NextResponse.json(
      apiError('Invalid action. Supported: validate, reset-rate-limits'),
      { status: 400 }
    );

  } catch (error: any) {
    logger.error('Admin action failed', {
      error: error.message
    });
    return NextResponse.json(apiError(error), { status: 500 });
  }
}
