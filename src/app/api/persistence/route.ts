import { NextRequest, NextResponse } from 'next/server';
import { apiSuccess, apiError } from '@/lib/apiResponse';
import { persistForever, retrieve, query, verifyIntegrity } from '@/lib/persistence/infinite';

/**
 * POST /api/persistence
 * Write data with infinite persistence (4 redundant layers)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { kind, subject, payload, metadata } = body;

    if (!kind || !subject || !payload) {
      return NextResponse.json(
        apiError(new Error('Missing required fields: kind, subject, payload')),
        { status: 400 }
      );
    }

    const proof = await persistForever({
      kind,
      subject,
      payload,
      metadata,
    });

    return NextResponse.json(
      apiSuccess({
        message: 'Data persisted across all layers',
        proof,
      })
    );
  } catch (error: unknown) {
    return NextResponse.json(apiError(error), { status: 500 });
  }
}

/**
 * GET /api/persistence?id=xxx
 * Retrieve from any available layer
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const id = searchParams.get('id');
  const kind = searchParams.get('kind');
  const subject = searchParams.get('subject');
  const verify = searchParams.get('verify') === 'true';

  try {
    // Single record retrieval
    if (id) {
      if (verify) {
        const integrity = await verifyIntegrity(id);
        return NextResponse.json(apiSuccess(integrity));
      }

      const data = await retrieve(id);
      if (!data) {
        return NextResponse.json(apiError(new Error('Not found')), { status: 404 });
      }
      return NextResponse.json(apiSuccess(data));
    }

    // Query
    const results = await query({
      kind: kind || undefined,
      subject: subject || undefined,
      limit: 100,
    });

    return NextResponse.json(apiSuccess(results));
  } catch (error: unknown) {
    return NextResponse.json(apiError(error), { status: 500 });
  }
}
