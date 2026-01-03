"use client";

import { useCanon } from "@/lib/stores/canonStore";

export function KnowledgeTile() {
  const canon = useCanon();

  // Count intent events as knowledge accumulated
  const knowledgeCount = canon.filter((e) => e.type === "intent").length;

  return (
    <div className="w-36 p-2 bg-gray-900 border border-gray-700 rounded-lg">
      <div className="text-xs text-gray-500 uppercase">Knowledge</div>
      <div className="text-xl font-bold text-gray-200">{knowledgeCount}</div>
      <div className="text-xs text-gray-500 mt-1">Intents Processed</div>
    </div>
  );
}
