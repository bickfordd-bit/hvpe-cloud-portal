"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { OptrShell } from "@/components/optr/OptrShell";
import { OptrRunPanel } from "@/components/optr/OptrRunPanel";
import { OptrStatusPanel } from "@/components/optr/OptrStatusPanel";
import { OptrTraceTable } from "@/components/optr/OptrTraceTable";
import { OptrRequirements } from "@/components/optr/OptrRequirements";
import { optrClient } from "@/lib/optr/client";
import type { OPTRState, Requirement, Trace, RunResult } from "@/lib/optr/types";

export default function OptrOpportunityPage() {
  const params = useParams<{ id?: string }>();
  const id = params?.id ? decodeURIComponent(params.id) : "";

  const [state, setState] = useState<OPTRState | null>(null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [traces, setTraces] = useState<Trace[]>([]);
  const [packageUrl, setPackageUrl] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function loadStatus() {
    setErr(null);
    try {
      const s = await optrClient.status(id);
      setState(s);
    } catch (e: any) {
      setErr(e.message || "Failed to load status.");
    }
  }

  useEffect(() => {
    loadStatus();
  }, [id]);

  async function run() {
    setErr(null);
    try {
      const rr: RunResult = await optrClient.run(id);
      setState(rr.state);
      setRequirements(rr.requirements || []);
      setTraces(rr.traces || []);
      setPackageUrl(rr.package?.url || null);
    } catch (e: any) {
      setErr(e.message || "OPTR run failed.");
    }
  }

  return (
    <OptrShell
      title={`Opportunity: ${id}`}
      subtitle="Run OPTR to compute coverage, blockers, and traceability."
      right={
        <Link
          href="/optr"
          className="rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm hover:bg-neutral-800"
        >
          ← Back
        </Link>
      }
    >
      {err ? (
        <div className="mb-4 rounded-xl border border-red-900 bg-red-950/40 p-3 text-sm text-red-200">
          {err}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <OptrRunPanel onRun={run} onRefresh={loadStatus} packageUrl={packageUrl} />
        <OptrStatusPanel state={state} />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <OptrRequirements requirements={requirements} />
        <OptrTraceTable traces={traces} />
      </div>
    </OptrShell>
  );
}
