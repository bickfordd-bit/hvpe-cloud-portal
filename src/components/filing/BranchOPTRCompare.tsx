"use client";

import { useBranchOPTR } from "@/lib/stores/branchOPTRStore";

const BRANCH_LABELS: Record<string, string> = {
  "dod-pilot": "DoD Pilot",
  "aws-sim": "AWS Sim",
  "product-ui": "Product UI",
  investor: "Investor",
};

export function BranchOPTRCompare() {
  const branches = useBranchOPTR();
  const entries = Object.entries(branches);

  if (entries.length === 0) {
    return (
      <div className="p-4 text-sm text-gray-600">
        No branch data yet. Submit intents to see comparison.
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-900/50 border border-gray-800 rounded-lg">
      <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">
        Branch Performance
      </h3>
      <div className="space-y-2">
        {entries.map(([id, data]) => (
          <div
            key={id}
            className="grid grid-cols-[120px_60px_1fr] gap-2 items-center text-sm"
          >
            <span className="text-gray-300">{BRANCH_LABELS[id] || id}</span>
            <span className="text-gray-400 font-mono">
              {data.ttv.toFixed(0)}ms
            </span>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${Math.min(data.progress * 100, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
