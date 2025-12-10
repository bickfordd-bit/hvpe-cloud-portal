"use client";

import { EngineStatusPanel } from "@/components/widgets/EngineStatusPanel";
import { BillionaireTracker } from "@/components/widgets/BillionaireTracker";
import { MoneyVelocityGauge } from "@/components/widgets/MoneyVelocityGauge";
import { SupraHeatmap } from "@/components/widgets/SupraHeatmap";
import { MetricMiniGrid } from "@/components/widgets/MetricMiniGrid";

export function DashboardPage() {
  return (
    <div className="space-y-4">
      {/* Top row: Engine + Velocity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <EngineStatusPanel />
        </div>
        <MoneyVelocityGauge />
      </div>

      {/* Middle row: Metrics */}
      <MetricMiniGrid />

      {/* Bottom row: Billionaire tracker + supra heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <BillionaireTracker />
        </div>
        <SupraHeatmap />
      </div>
    </div>
  );
}
