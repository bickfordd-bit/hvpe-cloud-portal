"use client";

import { useBranchOPTR } from "@/lib/stores/branchOPTRStore";

const BRANCH_INFO: Record<string, { label: string; color: string }> = {
  "dod-pilot": { label: "DoD Pilot", color: "bg-blue-600" },
  "aws-sim": { label: "AWS Sim", color: "bg-green-600" },
  "product-ui": { label: "Product UI", color: "bg-purple-600" },
  investor: { label: "Investor", color: "bg-orange-600" },
};

export function BranchGrid() {
  const branches = useBranchOPTR();
  const allBranches = Object.keys(BRANCH_INFO);

  return (
    <div className="grid grid-cols-2 gap-3">
      {allBranches.map((branchId) => {
        const info = BRANCH_INFO[branchId];
        const data = branches[branchId];
        const isActive = !!data;

        return (
          <div
            key={branchId}
            className={`p-4 rounded-lg border ${
              isActive
                ? "bg-gray-900/50 border-gray-700"
                : "bg-gray-950/50 border-gray-800"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`w-3 h-3 rounded-full ${isActive ? info.color : "bg-gray-700"}`}
              />
              <span
                className={`font-medium text-sm ${isActive ? "text-gray-200" : "text-gray-600"}`}
              >
                {info.label}
              </span>
            </div>
            {isActive && (
              <div className="text-xs text-gray-500">
                Progress: {(data.progress * 100).toFixed(0)}%
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
