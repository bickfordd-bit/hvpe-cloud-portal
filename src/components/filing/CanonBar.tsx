/**
 * Canon Bar Component
 * Shows last 5 canon events (not full log)
 */

"use client";

import { useCanon } from "@/lib/stores/canonStore";

export function CanonBar() {
  const canon = useCanon().slice(-5);

  return (
    <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-800">
      {canon.map((event, idx) => (
        <span
          key={idx}
          className={`px-2 py-1 rounded text-xs font-mono ${
            event.decision === "ALLOW"
              ? "bg-green-900/30 text-green-400"
              : "bg-red-900/30 text-red-400"
          }`}
        >
          {event.decision}
        </span>
      ))}
      {canon.length === 0 && (
        <span className="text-gray-600 text-sm">No events yet</span>
      )}
    </div>
  );
}
