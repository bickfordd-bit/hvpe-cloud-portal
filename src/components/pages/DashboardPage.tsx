"use client";

import { useHvpeDashboard } from "@/hooks/useHvpeDashboard";
import ChatDock from "@/components/chat/ChatDock";
import { EngineStatusPanel } from "@/components/widgets/EngineStatusPanel";
import { BillionaireTracker } from "@/components/widgets/BillionaireTracker";
import { MoneyVelocityGauge } from "@/components/widgets/MoneyVelocityGauge";
import { SupraHeatmap } from "@/components/widgets/SupraHeatmap";
import { MetricMiniGrid } from "@/components/widgets/MetricMiniGrid";

export function DashboardPage() {
  const { data, loading, error } = useHvpeDashboard();

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-4">
        {loading && (
          <div className="rounded-xl border border-blue-500/40 bg-blue-500/10 p-4 text-sm text-blue-100">
            Refreshing engine telemetry...
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-100">
            Unable to load live data. Showing cached snapshot.
          </div>
        )}

        {/* Top row: Engine + Velocity */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <EngineStatusPanel data={data.engineStatus} />
          </div>
          <MoneyVelocityGauge snapshot={data.velocity} />
        </div>

        {/* Middle row: Metrics */}
        <MetricMiniGrid metrics={data.metricTiles} />

        {/* Bottom row: Billionaire tracker + supra heatmap */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <BillionaireTracker
              description={data.billionaires.description}
              people={data.billionaires.people}
            />
          </div>
          <SupraHeatmap heatmap={data.heatmap} />
        </div>
      </div>

      <div className="h-full">
        <ChatDock />
      </div>
    </div>
  );
}
