"use client";

import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from "react";

export type PersonaMode =
  | "trader"
  | "founder"
  | "investor"
  | "engineer"
  | "intelligence";

type PersonaContextValue = {
  persona: PersonaMode;
  setPersona: (mode: PersonaMode) => void;
};

const PersonaContext = createContext<PersonaContextValue | undefined>(
  undefined
);

export function PersonaProvider({ children }: { children: React.ReactNode }) {
  const [persona, setPersonaState] = useState<PersonaMode>("trader");

  const setPersona = useCallback((mode: PersonaMode) => {
    setPersonaState(mode);
    // future: persist to localStorage, analytics, etc.
  }, []);

  const value = useMemo(
    () => ({
      persona,
      setPersona,
    }),
    [persona, setPersona]
  );

  return (
    <PersonaContext.Provider value={value}>{children}</PersonaContext.Provider>
  );
}

export function usePersona(): PersonaContextValue {
  const ctx = useContext(PersonaContext);
  if (!ctx) {
    throw new Error("usePersona must be used within a PersonaProvider");
  }
  return ctx;
}
