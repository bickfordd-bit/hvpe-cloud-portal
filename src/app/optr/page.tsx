// src/app/optr/page.tsx
"use client";

import DoDLayout from "@/components/layout/DoDLayout";
import { Filter, ArrowUpRight, FileText, AlertTriangle } from "lucide-react";

type Phase = "R" | "E" | "P" | "S";

interface Opportunity {
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

const mockData: Opportunity[] = [
  {
    id: "1",
    title: "Partnerships for Transformational Artificial Intelligence Models",
    agency: "DOE",
    office: "SC Oak Ridge Office",
    vehicle: "RFI",
    samId: "DE-ASCR-26-0001",
    phase: "R",
    dueDate: "2026-01-14",
    confidence: 0.87,
    status: "BLOCKED",
    blockReason: "Missing official solicitation PDF or portal listing."
  },
  {
    id: "2",
    title: "Enterprise Data & Analytics Support Services",
    agency: "DoD",
    office: "US Army PEO EIS",
    vehicle: "IDIQ",
    samId: "W91XXX-26-R-0001",
    phase: "E",
    dueDate: "2026-02-01",
    confidence: 0.93,
    status: "IN_PROGRESS"
  },
  {
    id: "3",
    title: "AI-Enabled Predictive Maintenance for Aviation Fleet",
    agency: "USAF",
    office: "AFMC",
    vehicle: "OTA",
    samId: "FA86XX-26-9-0001",
    phase: "P",
    dueDate: "2026-01-30",
    confidence: 0.96,
    status: "READY"
  },
  {
    id: "4",
    title: "Cyber Defense Analytics Platform Modernization",
    agency: "DISA",
    office: "J-6",
    vehicle: "BPA",
    samId: "HC10XX-26-R-0002",
    phase: "S",
    dueDate: "2026-01-10",
    confidence: 0.91,
    status: "SUBMITTED"
  }
];

export default function OPTRPage() {
  const total = mockData.length;
  const qualified = mockData.filter((o) => o.confidence >= 0.85).length;
  const avgConfidence =
    mockData.reduce((acc, o) => acc + o.confidence, 0) / mockData.length;
  const activeSubmissionWindow = mockData.filter(
    (o) => o.phase === "P" || o.phase === "S"
  ).length;

  return (
    <DoDLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-wide">
              OPTR // Opportunity Targeting Console
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-700">
              Centralized view of open federal opportunities, mapped to BIC
              capabilities, with live confidence scoring and submission status.
            </p>
          </div>
          <button className="inline-flex items-center gap-2 rounded border border-[#0A1F44] px-3 py-2 text-sm text-[#0A1F44] transition hover:bg-[#0A1F44] hover:text-white">
            <ArrowUpRight size={16} />
            Sync from SAM.gov / Portals
          </button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <MetricCard label="Total Active Opportunities" value={total.toString()} />
          <MetricCard
            label="Qualified Targets (≥ 85% Conf.)"
            value={qualified.toString()}
          />
          <MetricCard
            label="Average Confidence"
            value={`${(avgConfidence * 100).toFixed(1)}%`}
          />
          <MetricCard
            label="In Submission Window (P / S)"
            value={activeSubmissionWindow.toString()}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Filter size={16} />
            Filters
          </div>
          <SelectPill label="Phase" value="All" />
          <SelectPill label="Agency" value="All" />
          <SelectPill label="Vehicle" value="All" />
          <SelectPill label="Confidence" value="≥ 80%" />
          <SelectPill label="Due" value="Next 60 days" />
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="max-h-[60vh] overflow-y-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[#0A1F44] text-xs uppercase tracking-wider text-white">
                <tr>
                  <Th>Opportunity</Th>
                  <Th>Agency / Office</Th>
                  <Th>Vehicle</Th>
                  <Th>Phase</Th>
                  <Th>Due Date</Th>
                  <Th>Confidence</Th>
                  <Th>Status</Th>
                  <Th className="pr-4 text-right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {mockData.map((opp) => (
                  <tr
                    key={opp.id}
                    className="border-b last:border-b-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 align-top">
                      <div className="font-semibold text-[#0A1F44]">
                        {opp.title}
                      </div>
                      <div className="mt-1 text-xs text-gray-600">
                        SAM.gov ID: <span className="font-mono">{opp.samId}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top text-gray-700">
                      <div className="font-medium">{opp.agency}</div>
                      <div className="text-xs text-gray-600">{opp.office}</div>
                    </td>
                    <td className="px-4 py-3 align-top text-gray-700">
                      {opp.vehicle}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <PhasePill phase={opp.phase} />
                    </td>
                    <td className="px-4 py-3 align-top text-gray-700">
                      {formatDate(opp.dueDate)}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <ConfidenceBar value={opp.confidence} />
                    </td>
                    <td className="px-4 py-3 align-top">
                      <StatusBadge status={opp.status} />
                      {opp.status === "BLOCKED" && opp.blockReason && (
                        <div className="mt-1 flex items-start gap-1 text-[11px] text-red-700">
                          <AlertTriangle size={12} />
                          <span>{opp.blockReason}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top pr-4 text-right">
                      <div className="flex justify-end gap-2">
                        <TableButton variant="ghost">
                          <FileText size={14} />
                          View Dossier
                        </TableButton>
                        <TableButton>Open in OPTR</TableButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
          <div className="font-semibold text-[#0A1F44]">Phase Legend:</div>
          <LegendItem label="R – Realization (Target Identified, Data Intake)" />
          <LegendItem label="E – Evaluation (Fit, Value, Risk Scored)" />
          <LegendItem label="P – Proposal (Drafting and Approvals)" />
          <LegendItem label="S – Submission (Final Portal Delivery)" />
        </div>
      </div>
    </DoDLayout>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      <div className="mb-1 text-xs uppercase tracking-wide text-gray-600">
        {label}
      </div>
      <div className="text-2xl font-bold text-[#0A1F44]">{value}</div>
    </div>
  );
}

function SelectPill({ label, value }: { label: string; value: string }) {
  return (
    <button className="flex items-center gap-1 rounded-full border border-gray-300 bg-white px-3 py-1 text-xs hover:bg-gray-100">
      <span className="font-semibold text-gray-700">{label}:</span>
      <span className="text-gray-600">{value}</span>
    </button>
  );
}

function Th({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th className={`px-4 py-2 text-left text-xs font-semibold ${className}`}>
      {children}
    </th>
  );
}

function PhasePill({ phase }: { phase: Phase }) {
  const map: Record<Phase, { label: string; color: string; bg: string }> = {
    R: {
      label: "R – Realization",
      color: "#1E3A8A",
      bg: "#DBEAFE"
    },
    E: {
      label: "E – Evaluation",
      color: "#92400E",
      bg: "#FEF3C7"
    },
    P: {
      label: "P – Proposal",
      color: "#065F46",
      bg: "#D1FAE5"
    },
    S: {
      label: "S – Submission",
      color: "#111827",
      bg: "#E5E7EB"
    }
  };

  const cfg = map[phase];

  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold"
      style={{ color: cfg.color, backgroundColor: cfg.bg }}
    >
      {cfg.label}
    </span>
  );
}

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div className="w-24">
      <div className="mb-0.5 flex justify-between text-[11px] text-gray-600">
        <span>{pct}%</span>
        <span>fit</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            backgroundColor: pct >= 90 ? "#065F46" : pct >= 80 ? "#2563EB" : "#F97316"
          }}
        />
      </div>
    </div>
  );
}

function StatusBadge({
  status
}: {
  status: Opportunity["status"];
}) {
  const cfg: Record<
    Opportunity["status"],
    { label: string; bg: string; color: string }
  > = {
    READY: {
      label: "READY – Unblocked",
      bg: "#E0F2FE",
      color: "#0369A1"
    },
    BLOCKED: {
      label: "TARGET BLOCKED",
      bg: "#FEE2E2",
      color: "#B91C1C"
    },
    IN_PROGRESS: {
      label: "IN PROGRESS",
      bg: "#FEF9C3",
      color: "#854D0E"
    },
    SUBMITTED: {
      label: "SUBMITTED",
      bg: "#DCFCE7",
      color: "#166534"
    }
  };

  const c = cfg[status];

  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold"
      style={{ backgroundColor: c.bg, color: c.color }}
    >
      {c.label}
    </span>
  );
}

function TableButton({
  children,
  variant = "solid"
}: {
  children: React.ReactNode;
  variant?: "solid" | "ghost";
}) {
  const base =
    "inline-flex items-center gap-1 rounded border px-2.5 py-1.5 text-[11px] transition";
  if (variant === "ghost") {
    return (
      <button
        className={`${base} border-gray-300 text-gray-700 hover:bg-gray-100`}
      >
        {children}
      </button>
    );
  }
  return (
    <button
      className={`${base} border-[#0A1F44] bg-[#0A1F44] text-white hover:bg-[#111827]`}
    >
      {children}
    </button>
  );
}

function LegendItem({ label }: { label: string }) {
  return <div>{label}</div>;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit"
  });
}
