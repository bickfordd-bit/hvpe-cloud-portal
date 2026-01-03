"use client";

import { createContext, useContext, useMemo, ReactNode } from "react";
import { useCanon } from "./canonStore";

type ValuationData = {
  multiplier: number | null;
};

const ValuationContext = createContext<ValuationData>({ multiplier: null });

export function ValuationProvider({ children }: { children: ReactNode }) {
  const canon = useCanon();

  const multiplier = useMemo(() => {
    const last = [...canon].reverse().find((e) => e.type === "valuation");
    return last ? last.multiplier : null;
  }, [canon]);

  return (
    <ValuationContext.Provider value={{ multiplier }}>
      {children}
    </ValuationContext.Provider>
  );
}

export function useValuation() {
  return useContext(ValuationContext);
}
