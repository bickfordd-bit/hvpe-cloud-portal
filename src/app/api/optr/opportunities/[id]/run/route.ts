import { NextRequest, NextResponse } from 'next/server';
import { processOpportunity } from '@/lib/optr/processor';
import { apiSuccess, apiError } from '@/lib/apiResponse';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import type { Requirement } from '@/lib/optr/types';

export async function POST(req: NextRequest) {
  const id = req.nextUrl.pathname.split('/').slice(-2, -1)[0] || '';
  logger.info('OPTR run endpoint called', { opportunityId: id });

  // Fetch opportunity state from database
  // TODO: Implement actual DB query when schema is ready
  const state = {
    id,
    status: 'pending' as const,
    requirements: [],
  };

  try {
    // Route may accept optional requirements in the request body to be used
    // during scoring. Otherwise processor will use defaults.
    let body: { requirements?: Requirement[] } | null = null;
    try {
      body = await req.json().catch(() => null);
    } catch {
      body = null;
    }

    // Process opportunity through OPTR pipeline
    const result = await processOpportunity(id, body?.requirements as unknown);

    logger.info('OPTR run endpoint completed', {
      opportunityId: id,
      success: result.success,
      duration: result.summary?.executionTimeMs,
    });

    return NextResponse.json(apiSuccess(result));
  } catch (error: unknown) {
    logger.error('OPTR run endpoint failed', {
      opportunityId: id,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(apiError(error as Error), { status: 500 });
  }
}
