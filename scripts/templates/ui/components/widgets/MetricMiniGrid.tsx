"use client";

import { Card } from "@/components/ui/Card";

const METRICS = [
  { label: "Daily P/L", value: "+$1,742.32", accent: "text-emerald-400" },
  { label: "Equity", value: "$101,742.32", accent: "text-neutral-100" },
  { label: "Cash Available", value: "$32,117.89", accent: "text-neutral-100" },
  { label: "Positions", value: "14", accent: "text-neutral-100" },
  { label: "Win Rate (30d)", value: "67%", accent: "text-emerald-400" },
  { label: "ROI (30d)", value: "14.2%", accent: "text-emerald-400" },
  { label: "Sharpe (simulated)", value: "2.3", accent: "text-neutral-100" },
  { label: "Risk Level", value: "Aggressive", accent: "text-orange-300" },
];

export function MetricMiniGrid() {
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
        {METRICS.map((m) => (
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
