"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { OptrShell } from "@/components/optr/OptrShell";
import { OptrRunPanel } from "@/components/optr/OptrRunPanel";
import { OptrStatusPanel } from "@/components/optr/OptrStatusPanel";
import { OptrTraceTable } from "@/components/optr/OptrTraceTable";
import { OptrRequirements } from "@/components/optr/OptrRequirements";
import { OptrVoiceAssistant } from "@/components/optr/OptrVoiceAssistant";
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
      // Convert RunResult to OPTRState format for UI
      setState({
        stage: rr.success ? "completed" : "error",
        progress: rr.success ? 100 : 0,
        message: rr.success ? "Analysis complete" : (rr.error || "Analysis failed")
      });
      setRequirements(rr.requirements || []);
      setTraces(rr.traces || []);
      // packageUrl not available in current RunResult
      setPackageUrl(null);
    } catch (e: any) {
      setErr(e.message || "OPTR run failed.");
    }
  }

  function handleVoiceResult(result: any) {
    // Handle voice assistant results if needed
    if (result.summary) {
      setState({
        stage: "completed",
        progress: 100,
        message: "Voice analysis complete"
      });
    }
    if (result.requirements) setRequirements(result.requirements);
    if (result.traces) setTraces(result.traces);
  }

  return (
    <>
      <OptrShell
        title={`Opportunity: ${id}`}
        subtitle="Run OPTR to compute coverage, blockers, and traceability. Use voice commands on mobile."
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
    
    {/* Voice Assistant for Mobile */}
    <OptrVoiceAssistant opportunityId={id} onResult={handleVoiceResult} />
    </>
  );
}
