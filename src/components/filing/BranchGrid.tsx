/**
 * Branch Grid Component
 * Displays 4 workflow branches with live highlighting
 */

"use client";

import { useCanon } from "@/lib/stores/canonStore";

const BRANCHES = [
  { id: "dod-pilot", label: "DoD Pilot" },
  { id: "aws-sim", label: "AWS Sim" },
  { id: "product-ui", label: "Product UI" },
  { id: "investor", label: "Investor Walkthrough" },
];

export function BranchGrid() {
  const canon = useCanon();
  const activeRoute = canon.at(-1)?.route;

  return (
    <div className="grid grid-cols-4 gap-4 p-6">
      {BRANCHES.map((branch) => (
        <div
          key={branch.id}
          className={`
            border rounded-lg p-6 h-48 transition-all duration-300
            ${
              activeRoute === branch.id
                ? "border-green-500 bg-green-900/10"
                : "border-gray-700 bg-gray-900/50"
            }
          `}
        >
          <h3 className="font-semibold text-gray-200">{branch.label}</h3>
        </div>
      ))}
    </div>
  );
}
