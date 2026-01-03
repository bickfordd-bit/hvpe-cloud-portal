"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { getCanonEvents, type CanonEvent } from "@/lib/runtime/handleIntent";

const CanonContext = createContext<CanonEvent[]>([]);

export function CanonProvider({ children }: { children: ReactNode }) {
  const [canon, setCanon] = useState<CanonEvent[]>([]);

  useEffect(() => {
    // Poll for canon events every 100ms
    const interval = setInterval(() => {
      const events = getCanonEvents();
      setCanon(events);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <CanonContext.Provider value={canon}>{children}</CanonContext.Provider>
  );
}

export function useCanon() {
  return useContext(CanonContext);
}
