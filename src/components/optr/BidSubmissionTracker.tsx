// src/components/optr/BidSubmissionTracker.tsx
"use client";

import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";

export type Phase = "R" | "E" | "P" | "S";

export interface Opportunity {
  id: string;
  title: string;
  agency: string;
  office: string;
  vehicle: string;
  samId: string;
  phase: Phase;
  dueDate: string;
  confidence: number;
  status: "READY" | "BLOCKED" | "IN_PROGRESS" | "SUBMITTED";
  blockReason?: string;
}

const phaseOrder: Phase[] = ["R", "E", "P", "S"];

export function BidSubmissionTracker({ opportunities }: { opportunities: Opportunity[] }) {
  if (!opportunities || opportunities.length === 0) return null;

  const tracked = opportunities.filter((o) => o.phase !== "R" || o.status !== "READY");
  if (tracked.length === 0) return null;

  return (
    <section className="mt-6">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#0A1F44]">Bid Submission Tracker</h2>
        <p className="text-xs text-gray-600">
          Tracks where each target sits from Realization (R) through Submission (S).
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tracked.map((opp) => (
          <BidCard key={opp.id} opp={opp} />
        ))}
      </div>
    </section>
  );
}

function BidCard({ opp }: { opp: Opportunity }) {
  const stepIndex = phaseOrder.indexOf(opp.phase);
  const pctProgress =
    ((stepIndex + (opp.status === "SUBMITTED" ? 1 : 0)) / phaseOrder.length) * 100;

  const { statusLabel, statusTone } = getStatusLabel(opp);

  return (
    <article className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      <div>
        <div className="font-mono text-xs text-gray-500">SAM: {opp.samId}</div>
        <h3 className="mt-0.5 text-sm font-semibold leading-snug text-[#0A1F44]">
          {opp.title}
        </h3>
        <div className="mt-0.5 text-xs text-gray-600">
          {opp.agency} · {opp.office}
        </div>
      </div>

      <div>
        <div className="mb-1 flex justify-between text-[10px] uppercase tracking-wide text-gray-500">
          <span>R</span>
          <span>E</span>
          <span>P</span>
          <span>S</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full"
            style={{
              width: `${pctProgress}%`,
              backgroundColor:
                opp.status === "SUBMITTED"
                  ? "#166534"
                  : opp.status === "BLOCKED"
                  ? "#B91C1C"
                  : "#0A1F44"
            }}
          />
        </div>
        <div className="mt-1 text-[11px] text-gray-600">
          Phase: <strong>{phaseLabel(opp.phase)}</strong> · Due {formatDate(opp.dueDate)}
        </div>
      </div>

      <div className="flex items-start gap-2 text-xs">
        {statusTone === "ok" && <CheckCircle2 size={14} className="mt-[2px] text-green-700" />}
        {statusTone === "warn" && <Clock size={14} className="mt-[2px] text-amber-600" />}
        {statusTone === "bad" && <AlertTriangle size={14} className="mt-[2px] text-red-700" />}

        <div className="flex-1 text-gray-700">
          <div className="font-semibold">{statusLabel}</div>
          {opp.status === "BLOCKED" && opp.blockReason && (
            <div className="mt-0.5 text-[11px] text-red-700">
              BLOCKED: {opp.blockReason}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function phaseLabel(phase: Phase): string {
  switch (phase) {
    case "R":
      return "Realization";
    case "E":
      return "Evaluation";
    case "P":
      return "Proposal";
    case "S":
      return "Submission";
    default:
      return phase;
  }
}

function getStatusLabel(
  opp: Opportunity
): { statusLabel: string; statusTone: "ok" | "warn" | "bad" } {
  if (opp.status === "BLOCKED") {
    return {
      statusLabel: "Target blocked – waiting on missing inputs.",
      statusTone: "bad"
    };
  }

  if (opp.status === "SUBMITTED") {
    return {
      statusLabel: "Bid submitted – awaiting government action.",
      statusTone: "ok"
    };
  }

  if (opp.phase === "R") {
    return {
      statusLabel: "Target identified – awaiting go / no-go decision.",
      statusTone: "warn"
    };
  }

  if (opp.phase === "E") {
    return {
      statusLabel: "Capture and technical evaluation in progress.",
      statusTone: "warn"
    };
  }

  if (opp.phase === "P") {
    return {
      statusLabel: "Proposal drafting / internal reviews in progress.",
      statusTone: "warn"
    };
  }

  if (opp.phase === "S") {
    return {
      statusLabel: "Finalization and portal submission in progress.",
      statusTone: "warn"
    };
  }

  return {
    statusLabel: "In progress.",
    statusTone: "warn"
  };
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit"
  });
}
