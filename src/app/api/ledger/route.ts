/**
 * Ledger Query API
 * 
 * Read-only access to execution ledger
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryLedgerDisplay } from '@/lib/ledger';
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

    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const intentType = searchParams.get('intentType') || undefined;
    const outcome = (searchParams.get('outcome') as any) || undefined;

    const query = { startDate, endDate, intentType, outcome, limit };
    logger.info('Ledger query (display)', { query });

    const entries = queryLedgerDisplay(query);

    return NextResponse.json({
      entries,
      total: entries.length,
      hasMore: false,
    });
  } catch (error: any) {
    logger.error('Ledger query failed', { error: error.message });
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
}

