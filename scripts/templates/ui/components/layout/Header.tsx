"use client";

import { usePersona } from "@/components/providers/PersonaProvider";
import { hvpeTheme } from "@/lib/hvpeTheme";
import { StatusPill } from "@/components/shared/StatusPill";
import { PersonaSelector } from "@/components/shared/PersonaSelector";

export function Header() {
  const { persona } = usePersona();

  return (
    <header className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Brand + Channel */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/40">
            <span className="text-xs font-semibold tracking-widest">HV</span>
          </div>
          <div className="leading-tight">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">HVPE Cloud Portal</span>
              <span className="text-xs text-neutral-400">
                Bickford Technologies
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 border border-red-500/60 px-2 py-0.5 text-[10px] font-medium text-red-300">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
                LIVE
              </span>
              <span className="text-[10px] text-neutral-500">
                env: <span className="text-neutral-300">LIVE-ALPACA</span>
              </span>
            </div>
          </div>
        </div>

        {/* Center: Engine Status */}
        <div className="hidden md:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-neutral-400">Engine</span>
            <span className="font-semibold text-neutral-100">Apex Mode</span>
            <span className="text-neutral-500">|</span>
            <span className="text-neutral-400">Loop</span>
            <span className="text-neutral-100">Active</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800">
            <span className="text-neutral-400">Arbitrator</span>
            <span className="font-semibold text-emerald-300">0.93</span>
            <span className="text-neutral-500">IQ</span>
          </div>
        </div>

        {/* Right: Persona + Quick actions */}
        <div className="flex items-center gap-3">
          <PersonaSelector />
          <span className="hidden sm:inline text-[11px] text-neutral-400">
            Mode:{" "}
            <span className="capitalize text-neutral-100 font-semibold">
              {persona}
            </span>
          </span>

          <button className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 transition">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-neutral-200 font-medium">Docs</span>
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] border border-blue-500/70 bg-blue-600/20 hover:bg-blue-600/30 text-blue-100 font-medium transition">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: hvpeTheme.colors.accent }}
            />
            <span>API Keys</span>
          </button>
          <StatusPill status="running" />
        </div>
      </div>
    </header>
  );
}
