"use client";

import { Card } from "@/components/ui/Card";

export function EngineStatusPanel() {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="text-xs uppercase tracking-[0.16em] text-neutral-500">
            HVPE Engine
          </div>
          <div className="mt-1 flex items-center gap-2">
            <h2 className="text-lg font-semibold text-neutral-50">
              Apex Trading Loop
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-600/15 border border-blue-500/60 text-blue-100">
              Closed Loop Active
            </span>
          </div>
        </div>
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] border border-emerald-500/60 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-100 transition">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Running</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <Metric label="Loop Latency" value="248 ms" trend="+12ms" />
        <Metric label="Signals / min" value="186" trend="+23" />
        <Metric label="Active Packets" value="7" trend="+2" />
        <Metric label="Arbitrator IQ" value="0.93" trend="+0.04" />
      </div>

      <div className="mt-4 text-[11px] text-neutral-400 leading-relaxed">
        Engine is executing live packets in{" "}
        <span className="text-neutral-200 font-medium">aggressive</span> risk
        mode with full arbitration and compounding enabled. Supra-layer is
        monitoring external data feeds for anomalies and adjusting velocity in
        real time.
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
