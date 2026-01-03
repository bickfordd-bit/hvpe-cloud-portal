/**
 * Ledger Query API
 *
 * Read-only access to execution ledger
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryLedger, getLedgerStats, verifyLedgerIntegrity } from '@/lib/ledger';
import { LedgerQueryRequest, LedgerQueryResponse } from '@/lib/types';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/ledger
 *
 * Query ledger entries with optional filters
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const query: LedgerQueryRequest = {
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      intentType: (searchParams.get('intentType') as unknown) || undefined,
      outcome: (searchParams.get('outcome') as unknown) || undefined,
      limit: parseInt(searchParams.get('limit') || '50'),
    };

    logger.info('Ledger query', { query });

    const entries = queryLedger(query);
    const hasMore = entries.length >= (query.limit || 50);

    const response: LedgerQueryResponse = {
      entries,
      total: entries.length,
      hasMore,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    logger.error('Ledger query failed', { error: error.message });
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ledger/stats
 *
 * Get ledger statistics
 */
export async function POST(req: NextRequest) {
  const { pathname } = new URL(req.url);

  if (pathname.endsWith('/stats')) {
    try {
      const stats = getLedgerStats();
      return NextResponse.json(stats);
    } catch (error: unknown) {
      logger.error('Ledger stats failed', { error: error.message });
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 500 }
      );
    }
  }

  if (pathname.endsWith('/verify')) {
    try {
      const result = verifyLedgerIntegrity();
      return NextResponse.json(result);
    } catch (error: unknown) {
      logger.error('Ledger verification failed', { error: error.message });
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    {
      error: 'Unknown endpoint',
    },
    { status: 404 }
  );
}
