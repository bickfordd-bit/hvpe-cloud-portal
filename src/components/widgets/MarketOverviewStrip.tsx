"use client";

import { Card } from "@/components/ui/Card";

export function MarketOverviewStrip() {
  return (
    <Card className="py-3">
      <div className="flex flex-wrap items-center justify-between gap-3 text-[11px]">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="uppercase tracking-[0.16em] text-neutral-500">
            Market Status
          </span>
          <span className="text-neutral-200 font-medium">Open</span>
          <span className="text-neutral-600">|</span>
          <span className="text-neutral-400">
            Session: <span className="text-neutral-200">Regular</span>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Ticker label="SPY" value="+0.84%" />
          <Ticker label="QQQ" value="+1.22%" />
          <Ticker label="IWM" value="+0.31%" />
          <Ticker label="VIX" value="-3.4%" negative />
        </div>

        <div className="flex items-center gap-2 text-neutral-400">
          <span>HVPE Mode:</span>
          <span className="text-orange-300 font-medium">Aggressive</span>
          <span className="text-neutral-600">|</span>
          <span>
            Compounding: <span className="text-emerald-300 font-medium">ON</span>
          </span>
        </div>
      </div>
    </Card>
  );
}

function Ticker({
  label,
  value,
  negative = false,
}: {
  label: string;
  value: string;
  negative?: boolean;
}) {
  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-neutral-900 border border-neutral-700">
      <span className="text-[10px] font-semibold text-neutral-200">{label}</span>
      <span
        className={`text-[10px] font-medium ${
          negative ? "text-red-400" : "text-emerald-400"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
