"use client";

import { EngineStatusData } from "@/lib/hvpeDashboardData";
import { Card } from "@/components/ui/Card";

export function EngineStatusPanel({ data }: { data: EngineStatusData }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="text-xs uppercase tracking-[0.16em] text-neutral-500">
            {data.tag}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <h2 className="text-lg font-semibold text-neutral-50">
              {data.systemName}
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-600/15 border border-blue-500/60 text-blue-100">
              {data.statusIndicator}
            </span>
          </div>
        </div>
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] border border-emerald-500/60 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-100 transition">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{data.actionLabel}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        {data.metrics.map((metric) => (
          <Metric
            key={metric.label}
            label={metric.label}
            value={metric.value}
            trend={metric.trend}
          />
        ))}
      </div>

      <div className="mt-4 text-[11px] text-neutral-400 leading-relaxed">
        {data.description}
      </div>
    </Card>
  );
}

function Metric({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend: string;
}) {
  const positive = trend.startsWith("+");
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-950/70 px-3 py-2">
      <div className="text-[11px] text-neutral-500">{label}</div>
      <div className="mt-1 flex items-baseline justify-between gap-2">
        <div className="text-sm font-semibold text-neutral-50">{value}</div>
        {trend && (
          <div
            className={`text-[10px] ${
              positive ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}
