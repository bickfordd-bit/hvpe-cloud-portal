// Timestamp: 2025-12-19T11:02:00-05:00
// Bickford API: Ledger query and mode status endpoints

import { NextRequest, NextResponse } from 'next/server';
import { loadBickfordMode, isBickfordMode } from '@/lib/bickford/runtime';
import { queryLedger, writeLedgerEntry, verifyLedgerIntegrity } from '@/lib/bickford/ledger';
import { apiSuccess, apiError } from '@/lib/apiResponse';
import { logger } from '@/lib/logger';

/**
 * GET /api/bickford - Get Bickford mode status
 */
export async function GET(req: NextRequest) {
  try {
    const mode = loadBickfordMode();
    
    return NextResponse.json(apiSuccess({
      active: isBickfordMode(),
      mode: mode || null,
      ts: new Date().toISOString(),
    }));
  } catch (error: any) {
    logger.error('Bickford status check failed', { error: error.message });
    return NextResponse.json(apiError(error), { status: 500 });
  }
}

/**
 * POST /api/bickford - Write ledger entry
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate required fields
    if (!body.ts || !body.kind || !body.subject || body.payload === undefined) {
      return NextResponse.json(
        apiError(new Error('Missing required fields: ts, kind, subject, payload')),
        { status: 400 }
      );
    }

    const entryId = await writeLedgerEntry({
      ts: body.ts,
      kind: body.kind,
      subject: body.subject,
      payload: body.payload,
      parentId: body.parentId,
    });

    return NextResponse.json(apiSuccess({
      entryId,
      ts: body.ts,
    }), { status: 201 });
  } catch (error: any) {
    logger.error('Ledger write failed', { error: error.message });
    return NextResponse.json(apiError(error), { status: 500 });
  }
}
