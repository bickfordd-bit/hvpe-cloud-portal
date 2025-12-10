"use client";

import { Card } from "@/components/ui/Card";
import type { HeatmapData } from "@/lib/hvpeDashboardData";

export function SupraHeatmap({ heatmap }: { heatmap: HeatmapData }) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs uppercase tracking-[0.16em] text-neutral-500">
            Supra-Intelligence Activity
          </div>
          <div className="mt-1 text-[11px] text-neutral-400">
            Heatmap of cognitive load across intelligence layers.
          </div>
        </div>
        <div className="text-[11px] text-neutral-500">
          Spike detection:{" "}
          <span className="text-emerald-300 font-medium">
            {heatmap.spikeDetection}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1.5 text-[10px]">
        {heatmap.cells.map((row, i) =>
          row.map((label, j) => {
            const intensity =
              (i + j + 1) / (heatmap.cells.length + row.length + 1);
            const bg = `rgba(59,130,246,${0.15 + intensity * 0.4})`;
            const shadow = `0 0 ${10 + intensity * 20}px rgba(59,130,246,${
              0.2 + intensity * 0.5
            })`;

            return (
              <div
                key={`${label}-${i}-${j}`}
                className="rounded-md border border-blue-500/40 flex items-center justify-center text-center px-1.5 py-2"
                style={{
                  backgroundColor: bg,
                  boxShadow: shadow,
                }}
              >
                <span className="text-[10px] text-blue-50 font-medium">
                  {label}
                </span>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
