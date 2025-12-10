"use client";

import { cn } from "@/lib/utils";

type Status = "running" | "live" | "error" | "learning" | "idle";

const statusMap: Record<
  Status,
  { label: string; dot: string; bg: string; text: string; border: string }
> = {
  running: {
    label: "Running",
    dot: "bg-emerald-400",
    bg: "bg-emerald-500/10",
    text: "text-emerald-200",
    border: "border-emerald-500/50",
  },
  live: {
    label: "Live Trading",
    dot: "bg-red-400",
    bg: "bg-red-500/10",
    text: "text-red-200",
    border: "border-red-500/50",
  },
  error: {
    label: "Error",
    dot: "bg-red-500",
    bg: "bg-red-500/15",
    text: "text-red-200",
    border: "border-red-600/60",
  },
  learning: {
    label: "Learning",
    dot: "bg-blue-400",
    bg: "bg-blue-500/10",
    text: "text-blue-200",
    border: "border-blue-500/50",
  },
  idle: {
    label: "Idle",
    dot: "bg-neutral-400",
    bg: "bg-neutral-700/20",
    text: "text-neutral-200",
    border: "border-neutral-600/60",
  },
};

export function StatusPill({ status }: { status: Status }) {
  const cfg = statusMap[status];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px]",
        cfg.bg,
        cfg.text,
        cfg.border
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", cfg.dot)} />
      <span>{cfg.label}</span>
    </div>
  );
}
