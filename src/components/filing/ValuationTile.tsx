"use client";

import { useValuation } from "@/lib/stores/valuationStore";

export function ValuationTile() {
  const { multiplier } = useValuation();

  return (
    <div className="w-36 p-2 bg-gray-900 border border-gray-700 rounded-lg">
      <div className="text-xs text-gray-500 uppercase">Execution Multiple</div>
      <div className="text-xl font-bold text-gray-200">
        {multiplier ? `${multiplier}×` : "—"}
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {multiplier && multiplier > 1 ? "Accelerating" : "Baseline"}
      </div>
    </div>
  );
}
