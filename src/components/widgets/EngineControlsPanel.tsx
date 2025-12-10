"use client";

import { useState } from "react";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { TradingEngineState } from "@/lib/tradingEngineData";

type RiskMode = "conservative" | "balanced" | "aggressive";

type EngineControlsPanelProps = {
  engineState?: TradingEngineState;
};

export function EngineControlsPanel({ engineState }: EngineControlsPanelProps) {
  const [running, setRunning] = useState(engineState?.running ?? true);
  const [risk, setRisk] = useState<RiskMode>(engineState?.risk ?? "aggressive");
  const toggles = engineState?.toggles ?? {
    compounding: true,
    supraOversight: true,
    packetArbitration: true,
    optionsFlow: true,
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs uppercase tracking-[0.16em] text-neutral-500">
            Trading Engine Control
          </div>
          <div className="mt-1 text-[11px] text-neutral-400">
            Live control of HVPE Apex loop & risk envelope.
          </div>
        </div>
        <button
          onClick={() => setRunning((value) => !value)}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] border transition",
            running
              ? "border-red-500/70 bg-red-500/15 text-red-100 hover:bg-red-500/25"
              : "border-emerald-500/70 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/20"
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              running ? "bg-red-400 animate-pulse" : "bg-emerald-400"
            )}
          />
          <span>{running ? "Pause Engine" : "Start Engine"}</span>
        </button>
      </div>

      <div className="space-y-3 text-[11px]">
        <div>
          <div className="text-neutral-400 mb-1.5">Risk Profile</div>
          <div className="inline-flex gap-1 rounded-full bg-neutral-900 border border-neutral-700 p-0.5">
            <RiskPill
              label="Conservative"
              active={risk === "conservative"}
              onClick={() => setRisk("conservative")}
            />
            <RiskPill
              label="Balanced"
              active={risk === "balanced"}
              onClick={() => setRisk("balanced")}
            />
            <RiskPill
              label="Aggressive"
              active={risk === "aggressive"}
              onClick={() => setRisk("aggressive")}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Compounding", on: toggles.compounding },
            { label: "Supra Oversight", on: toggles.supraOversight },
            { label: "Packet Arbitration", on: toggles.packetArbitration },
            { label: "Options Flow", on: toggles.optionsFlow },
          ].map((row) => (
            <ToggleRow key={row.label} label={row.label} on={row.on} />
          ))}
        </div>

        <div className="pt-2 border-t border-neutral-800 text-neutral-400">
          Engine is{" "}
          <span className="text-neutral-100 font-medium">
            {running ? "LIVE" : "PAUSED"}
          </span>{" "}
          in{" "}
          <span className="font-medium capitalize text-orange-300">
            {risk} mode
          </span>
          . Actual wiring should map these control states into HVPE Core.
        </div>
      </div>
    </Card>
  );
}

function RiskPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-2 py-1 rounded-full text-[10px] font-medium transition",
        active
          ? "bg-blue-600 text-white shadow-[0_0_16px_rgba(37,99,235,0.7)]"
          : "text-neutral-400 hover:text-neutral-100"
      )}
    >
      {label}
    </button>
  );
}

function ToggleRow({ label, on }: { label: string; on: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-neutral-400">{label}</span>
      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-neutral-700 bg-neutral-900">
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            on ? "bg-emerald-400" : "bg-neutral-500"
          )}
        />
        <span className="text-[10px] text-neutral-300">{on ? "ON" : "OFF"}</span>
      </div>
    </div>
  );
}
