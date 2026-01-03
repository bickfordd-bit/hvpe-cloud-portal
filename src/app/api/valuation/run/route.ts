import { NextRequest, NextResponse } from 'next/server';
import { ValuationEngine } from '@/lib/valuation/ValuationEngine';
import { defaultDashboardData } from '@/lib/hvpeDashboardData';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const inputs =
      body?.inputs || ValuationEngine.getDefaultInputs(defaultDashboardData.billionaires.people);

    const result = await ValuationEngine.runValuation(inputs);

    return NextResponse.json({
      valuation: result,
      timestamp: new Date().toISOString(),
      company: 'Bickford Technologies',
    });
  } catch (error: unknown) {
    console.error('Valuation error:', error);
    return NextResponse.json(
      {
        message: `Failed to run valuation: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const inputs = ValuationEngine.getDefaultInputs(defaultDashboardData.billionaires.people);
    const result = await ValuationEngine.runValuation(inputs);
    const sensitivity = ValuationEngine.runSensitivityAnalysis(inputs);

    return NextResponse.json({
      valuation: result,
      sensitivityAnalysis: sensitivity,
      timestamp: new Date().toISOString(),
      company: 'Bickford Technologies',
    });
  } catch (error: unknown) {
    console.error('Valuation fetch error:', error);
    return NextResponse.json(
      {
        message: `Failed to fetch valuation: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      { status: 500 }
    );
  }
}
