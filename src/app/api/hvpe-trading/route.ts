import { NextResponse } from 'next/server';

import {
  defaultTradingEngineData,
  type TradingEngineData,
  type TradingEngineState,
  type TradingPosition,
  type RiskMode,
} from '@/lib/tradingEngineData';

type WealthPosition = {
  symbol: string;
  side: 'long' | 'short';
  qty: number;
  entry_price?: number;
  current_price?: number;
  pnl?: number;
};

type WealthResponse = {
  portfolio_value: number;
  change_today_pct: number;
  change_today_abs: number;
  risk_mode?: string;
  positions?: WealthPosition[];
};

const BASE_URL = (process.env.HVPE_PORTAL_API_BASE_URL ?? 'http://localhost:8000').replace(
  /\/$/,
  ''
);

function mapRiskMode(raw?: string): RiskMode {
  const mode = raw?.toLowerCase() ?? '';
  if (mode === 'acceleration' || mode === 'aggressive') {
    return 'aggressive';
  }
  if (mode === 'steady' || mode === 'balanced') {
    return 'balanced';
  }
  if (mode === 'preserve' || mode === 'conservative') {
    return 'conservative';
  }
  return 'aggressive';
}

function mapPosition(position: WealthPosition): TradingPosition {
  return {
    symbol: position.symbol,
    qty: position.qty,
    side: position.side,
    avgPrice: position.entry_price ?? 0,
    lastPrice: position.current_price ?? 0,
    unrealized: position.pnl ?? 0,
    today: position.pnl ?? 0,
  };
}

export async function GET() {
  const fallback = structuredClone(defaultTradingEngineData) as TradingEngineData;

  try {
    const res = await fetch(`${BASE_URL}/wealth`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      console.warn('hvpe-trading API could not fetch wealth data', res.status, res.statusText);
      return NextResponse.json(fallback);
    }

    const payload = (await res.json()) as WealthResponse;
    const positions = payload.positions ? payload.positions.map(mapPosition) : fallback.positions;

    const engineState: TradingEngineState = {
      running: true,
      risk: mapRiskMode(payload.risk_mode),
      toggles: fallback.engineState.toggles,
    };

    const response: TradingEngineData = {
      engineState,
      positions,
      orders: fallback.orders,
      trades: fallback.trades,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('hvpe-trading API failed', error);
    return NextResponse.json(fallback);
  }
}
