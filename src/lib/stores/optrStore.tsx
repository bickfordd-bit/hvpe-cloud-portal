/**
 * OPTR Store
 * React context for OPTR metrics (TTV, progress)
 */

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useCanon } from "./canonStore";

interface OPTRContextValue {
  ttv: number | null;
  progress: number;
}

const OPTRContext = createContext<OPTRContextValue>({ ttv: null, progress: 0 });

export function OPTRProvider({ children }: { children: ReactNode }) {
  const canon = useCanon();
  const [ttv, setTTV] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);

  // Derive state from canon changes
  useEffect(() => {
    const updateMetrics = () => {
      const last = [...canon].reverse().find((e) => e.type === "intent");
      if (last) {
        setTTV(last.ttv);
        setProgress(last.progress);
      }
    };

    updateMetrics();
  }, [canon]);

  return (
    <OPTRContext.Provider value={{ ttv, progress }}>
      {children}
    </OPTRContext.Provider>
  );
}

export function useOPTR() {
  return useContext(OPTRContext);
}
