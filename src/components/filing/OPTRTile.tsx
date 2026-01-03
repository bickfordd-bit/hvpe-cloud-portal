"use client";

import { useOPTR } from "@/lib/stores/optrStore";

export function OPTRTile() {
  const { ttv, progress } = useOPTR();

  return (
    <div className="w-36 p-2 bg-gray-900 border border-gray-700 rounded-lg">
      <div className="text-xs text-gray-500 uppercase">TTV</div>
      <div className="text-xl font-bold text-gray-200">
        {ttv ? `${ttv.toFixed(0)}ms` : "—"}
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {progress ? `${(progress * 100).toFixed(0)}% Complete` : "No Data"}
      </div>
    </div>
  );
}
