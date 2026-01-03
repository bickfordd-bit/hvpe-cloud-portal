import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/codex/sync
 * 
 * TEMPORARILY DISABLED - Codex sync being refactored
 * Returns 503 Service Unavailable until refactor is complete
 * 
 * The Codex sync system needs to be refactored to work with Next.js:
 * - Replace SvelteKit imports ($lib/*) with Next.js paths (@/lib/*)
 * - Implement missing exports: verifyCodexSecret, syncCodexChanges, previewCodexChanges
 * - Update Supabase integration for Next.js environment
 * 
 * See src/lib/codex/sync.ts and docs/TODO_CODEX_REFACTOR.md for details.
 */
export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'Codex sync temporarily disabled',
      message: 'This endpoint is being refactored to work with Next.js. See src/lib/codex/sync.ts for details.',
      status: 'disabled',
      todo: 'See docs/TODO_CODEX_REFACTOR.md for refactor plan',
    },
    { status: 503 }
  );
}

/**
 * GET /api/codex/sync
 * Status endpoint - returns disabled state during refactor
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'disabled',
    message: 'Codex sync temporarily disabled - refactor in progress',
    endpoint: '/api/codex/sync',
    reason: 'SvelteKit imports incompatible with Next.js - refactoring required',
    todo: 'See docs/TODO_CODEX_REFACTOR.md for details',
    methods: ['GET', 'POST'],
    availableWhen: 'After Next.js refactor is complete',
  });
}
