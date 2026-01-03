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
import type { CanonEvent } from "@/types/filing";

const CanonContext = createContext<CanonEvent[]>([]);

export function CanonProvider({ children }: { children: ReactNode }) {
  const [canon, setCanon] = useState<CanonEvent[]>([]);

  useEffect(() => {
    // Listen for custom events dispatched from the filing page
    const handleCanonEvent = (event: Event) => {
      const customEvent = event as CustomEvent<CanonEvent>;
      setCanon((c) => [...c, customEvent.detail]);
    };

    window.addEventListener("canon-event", handleCanonEvent);

    return () => {
      window.removeEventListener("canon-event", handleCanonEvent);
    };
  }, []);

  return (
    <CanonContext.Provider value={canon}>{children}</CanonContext.Provider>
  );
}

export function useCanon() {
  return useContext(CanonContext);
}
