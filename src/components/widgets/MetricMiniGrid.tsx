"use client";

import { Card } from "@/components/ui/Card";
import type { MetricTile } from "@/lib/hvpeDashboardData";

export function MetricMiniGrid({ metrics }: { metrics: MetricTile[] }) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs uppercase tracking-[0.16em] text-neutral-500">
          Core Performance Metrics
        </div>
        <div className="text-[11px] text-neutral-500">
          Simulated values – wire to live once ready
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="rounded-lg border border-neutral-800 bg-neutral-950/80 px-3 py-2"
          >
            <div className="text-[11px] text-neutral-500">{m.label}</div>
            <div className={`mt-1 text-sm font-semibold ${m.accent}`}>
              {m.value}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
