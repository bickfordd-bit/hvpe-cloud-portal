"use client";

import { Card } from "@/components/ui/Card";
import type { VelocitySnapshot } from "@/lib/hvpeDashboardData";

export function MoneyVelocityGauge({
  snapshot,
}: {
  snapshot: VelocitySnapshot;
}) {
  const { velocity, horizon, mode, compounding, oversight } = snapshot;

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs uppercase tracking-[0.16em] text-neutral-500">
            Money Velocity
          </div>
          <div className="mt-1 text-[11px] text-neutral-400">
            Instantaneous compounding across all active engines.
          </div>
        </div>
        <div className="text-right">
      <div className="text-[11px] text-neutral-500">Dynasty Horizon</div>
      <div className="text-sm font-semibold text-emerald-300">{horizon}</div>
        </div>
      </div>

      <div className="relative mt-2 mb-3 h-24 flex items-center justify-center">
        <div className="h-24 w-24 rounded-full border border-neutral-800 bg-neutral-950 shadow-[0_0_30px_rgba(0,0,0,0.8)] flex items-center justify-center">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-600 via-cyan-400 to-emerald-400 flex items-center justify-center shadow-[0_0_40px_rgba(34,197,235,0.9)]">
            <div className="text-center text-[11px] text-black font-semibold">
              {(velocity * 100).toFixed(1)}%
              <div className="text-[9px] font-normal">Velocity</div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-[11px] text-neutral-400 space-y-1">
        <div>
          Current mode:{" "}
          <span className="text-neutral-100 font-medium">{mode}</span>
        </div>
        <div>
          Compounding:{" "}
          <span
            className={`font-medium ${
              compounding ? "text-emerald-300" : "text-neutral-500"
            }`}
          >
            {compounding ? "ON" : "OFF"}
          </span>{" "}
          | Supra oversight:{" "}
          <span
            className={`font-medium ${
              oversight ? "text-emerald-300" : "text-neutral-500"
            }`}
          >
            {oversight ? "ENABLED" : "PAUSED"}
          </span>
        </div>
      </div>
    </Card>
  );
}
