"use client";

import { createContext, useContext, useMemo, ReactNode } from "react";
import { useCanon } from "./canonStore";

type BranchData = {
  ttv: number;
  progress: number;
  timestamp: number;
};

type BranchesData = Record<string, BranchData>;

const BranchOPTRContext = createContext<BranchesData>({});

export function BranchOPTRProvider({ children }: { children: ReactNode }) {
  const canon = useCanon();

  const branches = useMemo(() => {
    const newBranches: BranchesData = {};

    canon
      .filter((e) => e.type === "branch-optr")
      .forEach((e) => {
        newBranches[e.branchId as string] = {
          ttv: e.ttv as number,
          progress: e.progress as number,
          timestamp: e.timestamp as number,
        };
      });

    return newBranches;
  }, [canon]);

  return (
    <BranchOPTRContext.Provider value={branches}>
      {children}
    </BranchOPTRContext.Provider>
  );
}

export function useBranchOPTR() {
  return useContext(BranchOPTRContext);
}
