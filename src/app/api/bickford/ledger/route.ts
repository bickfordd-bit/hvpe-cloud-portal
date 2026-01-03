// Timestamp: 2025-12-19T11:02:00-05:00
// Bickford Ledger Query API

import { NextRequest, NextResponse } from 'next/server';
import { queryLedger } from '@/lib/bickford/ledger';
import { apiSuccess, apiError } from '@/lib/apiResponse';
import { logger } from '@/lib/logger';

/**
 * GET /api/bickford/ledger - Query ledger entries
 * Query params:
 *   - kind: filter by decision kind
 *   - subject: filter by subject (contains)
 *   - after: ISO timestamp, entries after this time
 *   - before: ISO timestamp, entries before this time
 *   - limit: max results (default 100)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    const results = await queryLedger({
      kind: searchParams.get('kind') || undefined,
      subject: searchParams.get('subject') || undefined,
      after: searchParams.get('after') || undefined,
      before: searchParams.get('before') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100,
    });

    // Parse payloadJson for response
    const entries = results.map((entry) => ({
      id: entry.id,
      ts: entry.ts,
      kind: entry.kind,
      subject: entry.subject,
      payload: JSON.parse(entry.payloadJson),
      hash: entry.hash,
      parentId: entry.parentId,
      createdAt: entry.createdAt,
    }));

    return NextResponse.json(
      apiSuccess({
        entries,
        count: entries.length,
        ts: new Date().toISOString(),
      })
    );
  } catch (error: unknown) {
    logger.error('Ledger query failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(apiError(error), { status: 500 });
  }
}
