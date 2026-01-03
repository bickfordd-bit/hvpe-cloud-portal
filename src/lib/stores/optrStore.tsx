"use client";

import { createContext, useContext, useMemo, ReactNode } from "react";
import { useCanon } from "./canonStore";

type OPTRData = {
  ttv: number | null;
  progress: number | null;
};

const OPTRContext = createContext<OPTRData>({ ttv: null, progress: null });

export function OPTRProvider({ children }: { children: ReactNode }) {
  const canon = useCanon();

  const data = useMemo(() => {
    // Find the most recent branch-optr event to get global metrics
    const branchEvents = canon.filter((e) => e.type === "branch-optr");
    if (branchEvents.length > 0) {
      const latest = branchEvents[branchEvents.length - 1];
      return {
        ttv: latest.ttv,
        progress: latest.progress,
      };
    }
    return { ttv: null, progress: null };
  }, [canon]);

  return <OPTRContext.Provider value={data}>{children}</OPTRContext.Provider>;
}

export function useOPTR() {
  return useContext(OPTRContext);
}
