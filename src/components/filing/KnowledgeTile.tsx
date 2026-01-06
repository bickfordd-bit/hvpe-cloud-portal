/**
 * Knowledge Tile Component
 * Visual growth indicator with pulse animation
 */

"use client";

import { useCanon } from "@/lib/stores/canonStore";
import { useState } from "react";

export function KnowledgeTile() {
  const canon = useCanon();
  const [pulse, setPulse] = useState(false);
  const [prevLength, setPrevLength] = useState(0);

  // Trigger pulse animation when canon grows
  if (canon.length > prevLength) {
    setPrevLength(canon.length);
    if (!pulse) {
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
    }
  }

  const score = Math.min(30 + canon.length * 10, 100);

  return (
    <div
      className={`w-14 h-14 rounded-lg bg-gray-900 border border-gray-700 flex items-center justify-center transition-all duration-300 ${
        pulse ? "scale-110 shadow-lg shadow-green-500/50" : ""
      }`}
    >
      <span className="text-lg font-bold text-gray-200">{score}</span>
    </div>
  );
}
