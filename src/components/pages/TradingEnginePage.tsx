"use client";

import { EngineControlsPanel } from "@/components/widgets/EngineControlsPanel";
import { LivePositionsTable } from "@/components/widgets/LivePositionsTable";
import { OrdersPanel } from "@/components/widgets/OrdersPanel";
import { TradeTimeline } from "@/components/widgets/TradeTimeline";
import { MarketOverviewStrip } from "@/components/widgets/MarketOverviewStrip";
import { useHvpeTrading } from "@/hooks/useHvpeTrading";

export function TradingEnginePage() {
  const { data, loading, error } = useHvpeTrading();

  return (
    <div className="space-y-4">
      {loading && (
        <div className="rounded-xl border border-blue-500/40 bg-blue-500/10 p-4 text-sm text-blue-100">
          Refreshing trading engine telemetry...
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-100">
          Unable to load live trading data. Showing cached snapshot.
        </div>
      )}

      {/* Strip: market & environment */}
      <MarketOverviewStrip />

      {/* Row 1: controls + positions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-1">
          <EngineControlsPanel engineState={data.engineState} />
        </div>
        <div className="xl:col-span-2">
          <LivePositionsTable positions={data.positions} />
        </div>
      </div>

      {/* Row 2: orders + trades */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-1">
          <OrdersPanel orders={data.orders} />
        </div>
        <div className="xl:col-span-2">
          <TradeTimeline trades={data.trades} />
        </div>
      </div>
    </div>
  );
}
