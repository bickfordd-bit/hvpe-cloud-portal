"use client";

import { EngineStatusPanel } from "@/components/widgets/EngineStatusPanel";
import { BillionaireTracker } from "@/components/widgets/BillionaireTracker";
import { MoneyVelocityGauge } from "@/components/widgets/MoneyVelocityGauge";
import { SupraHeatmap } from "@/components/widgets/SupraHeatmap";
import { MetricMiniGrid } from "@/components/widgets/MetricMiniGrid";
import { defaultDashboardData } from "@/lib/hvpeDashboardData";

export function DashboardPage() {
  return (
    <div className="space-y-4">
      {/* Top row: Engine + Velocity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <EngineStatusPanel data={defaultDashboardData.engineStatus} />
        </div>
        <MoneyVelocityGauge snapshot={defaultDashboardData.velocity} />
      </div>

      {/* Middle row: Metrics */}
      <MetricMiniGrid metrics={defaultDashboardData.metricTiles} />

      {/* Bottom row: Billionaire tracker + supra heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <BillionaireTracker
            description={defaultDashboardData.billionaires.description}
            people={defaultDashboardData.billionaires.people}
          />
        </div>
        <SupraHeatmap heatmap={defaultDashboardData.heatmap} />
      </div>
    </div>
  );
}
