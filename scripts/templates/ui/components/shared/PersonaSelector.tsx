"use client";

import { usePersona, PersonaMode } from "@/components/providers/PersonaProvider";
import { cn } from "@/lib/utils";

const options: { label: string; value: PersonaMode }[] = [
  { label: "Trader", value: "trader" },
  { label: "Founder", value: "founder" },
  { label: "Investor", value: "investor" },
  { label: "Engineer", value: "engineer" },
  { label: "Intelligence", value: "intelligence" },
];

export function PersonaSelector() {
  const { persona, setPersona } = usePersona();

  return (
    <div className="inline-flex items-center rounded-full bg-neutral-900 border border-neutral-700 px-1 py-0.5">
      {options.map((opt) => {
        const active = opt.value === persona;
        return (
          <button
            key={opt.value}
            onClick={() => setPersona(opt.value)}
            className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-medium transition",
              active
                ? "bg-blue-600 text-white shadow-[0_0_16px_rgba(37,99,235,0.7)]"
                : "text-neutral-400 hover:text-neutral-100"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
