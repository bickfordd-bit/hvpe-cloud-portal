/**
 * Canon Store
 * React context for subscribing to real-time canon events
 */

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { subscribeCanonEvents } from "@/lib/runtime/realtime";
import type { CanonEvent } from "@/types/filing";

const CanonContext = createContext<CanonEvent[]>([]);

export function CanonProvider({ children }: { children: ReactNode }) {
  const [canon, setCanon] = useState<CanonEvent[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeCanonEvents((event) => {
      setCanon((c) => [...c, event]);
    });
    return unsubscribe;
  }, []);

  return (
    <CanonContext.Provider value={canon}>{children}</CanonContext.Provider>
  );
}

export function useCanon() {
  return useContext(CanonContext);
}
