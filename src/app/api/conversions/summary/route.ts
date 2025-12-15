import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse } from '@/lib/apiResponse';

/**
 * GET /api/conversions/summary
 * Stub endpoint returning static conversion summary data
 * Accepts optional 'range' query parameter (default: '90d')
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const range = searchParams.get('range') || '90d';

  // Static conversion summary shape for dashboard rendering
  const summary = {
    range,
    totalConversions: 42,
    conversionRate: 0.23,
    averageT2V: 15.7,
    topSources: [
      { source: 'direct', count: 18, rate: 0.42 },
      { source: 'referral', count: 12, rate: 0.31 },
      { source: 'organic', count: 8, rate: 0.19 },
      { source: 'paid', count: 4, rate: 0.08 },
    ],
    recentConversions: [
      {
        id: 'conv_1',
        accountId: 'demo',
        source: 'direct',
        t2vDays: 12,
        convertedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'conv_2',
        accountId: 'demo',
        source: 'referral',
        t2vDays: 18,
        convertedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'conv_3',
        accountId: 'demo',
        source: 'organic',
        t2vDays: 21,
        convertedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  };

  return createSuccessResponse(summary);
}
