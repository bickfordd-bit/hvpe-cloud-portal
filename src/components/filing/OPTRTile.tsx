/**
 * OPTR Tile Component
 * Displays TTV metric and progress bar
 */

"use client";

import { useOPTR } from "@/lib/stores/optrStore";

export function OPTRTile() {
  const { ttv, progress } = useOPTR();

  return (
    <div className="w-32 p-2 bg-gray-900 border border-gray-700 rounded-lg">
      <div className="text-xs text-gray-500 uppercase">OPTR</div>
      <div className="text-lg font-bold text-gray-200">
        {ttv === null ? "—" : ttv.toFixed(2)}
      </div>
      <div className="h-1 bg-gray-800 rounded-full mt-2">
        <div
          className="h-full bg-green-500 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(progress * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}
