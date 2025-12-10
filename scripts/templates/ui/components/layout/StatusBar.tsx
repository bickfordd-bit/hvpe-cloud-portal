"use client";

import { usePersona } from "@/components/providers/PersonaProvider";

export function StatusBar() {
  const { persona } = usePersona();

  return (
    <footer className="border-t border-neutral-800 bg-neutral-950/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-2 text-[11px] flex items-center justify-between gap-3 text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>
            HVPE Engine: <span className="text-neutral-200">Stable</span>
          </span>
          <span className="text-neutral-600">|</span>
          <span>
            Last cycle: <span className="text-neutral-200">248ms</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span>Persona:</span>
          <span className="capitalize text-neutral-200 font-medium">
            {persona}
          </span>
          <span className="text-neutral-600 hidden sm:inline">
            | UI tuned for velocity & clarity
          </span>
        </div>
      </div>
    </footer>
  );
}
