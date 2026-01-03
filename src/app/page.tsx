"use client";

/**
 * Bickford Homepage — Zero-Approval Execution Runtime
 *
 * Daily operating surface for intent-to-reality execution.
 * No human approval gates. Canon-verified, hash-chained ledger.
 */

import { useState, useEffect, useRef } from "react";
import {
  CheckCircle,
  XCircle,
  Circle,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

interface LedgerEntry {
  id: string;
  timestamp: string;
  intentType: string;
  outcome: "ALLOW" | "DENY" | "FAIL";
  reasoning: string;
  denialReason?: string;
  canonRule?: string;
}

export default function BickfordHomepage() {
  const [intent, setIntent] = useState("");
  const [history, setHistory] = useState<LedgerEntry[]>([]);
  const [canonInfo, setCanonInfo] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<string>("idle");
  const [completedPhases, setCompletedPhases] = useState<Set<string>>(
    new Set(),
  );
  const [newLedgerEntryId, setNewLedgerEntryId] = useState<string | null>(null);
  const ledgerSectionRef = useRef<HTMLDivElement>(null);
  const executionResultRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

  const phases = [
    "acknowledged",
    "planning",
    "validating",
    "executing",
    "committing",
  ];

  // Load canon info and history on mount
  useEffect(() => {
    loadCanonInfo();
    loadHistory();
  }, []);

  // Auto-scroll to ledger and highlight new entry
  useEffect(() => {
    if (newLedgerEntryId && ledgerSectionRef.current) {
      // Smooth scroll to ledger section
      ledgerSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      // Highlight new entry
      const entryElement = document.getElementById(`entry-${newLedgerEntryId}`);
      if (entryElement) {
        entryElement.classList.add("animate-highlight");

        // Remove animation after 3 seconds
        setTimeout(() => {
          entryElement.classList.remove("animate-highlight");
        }, 3000);
      }
    }
  }, [newLedgerEntryId]);

  async function loadCanonInfo() {
    try {
      const res = await fetch("/api/execute");
      const data = await res.json();
      setCanonInfo(data);
    } catch (error) {
      console.error("Failed to load canon info:", error);
    }
  }

  async function loadHistory() {
    try {
      const res = await fetch("/api/ledger?limit=10");
      if (res.ok) {
        const data = await res.json();
        const entries = data.entries || [];
        setHistory(entries);
        return entries;
      }
    } catch (error) {
      console.error("Failed to load history:", error);
    }
    return [];
  }

  async function handleExecute() {
    if (!intent.trim()) {
      return;
    }

    setIsExecuting(true);
    setCompletedPhases(new Set());
    executionResultRef.current = null;
    setNewLedgerEntryId(null);

    // Optimistic phase transitions - feel instant!
    setCurrentPhase("acknowledged");

    // Start backend call, but don't wait for it to show next phase
    const executePromise = fetch("/api/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intent, dryRun: false }),
    });

    // Optimistically transition through phases with smooth timing
    setTimeout(() => {
      setCompletedPhases((prev) => new Set(prev).add("acknowledged"));
      setCurrentPhase("planning");
    }, 300);

    setTimeout(() => {
      setCompletedPhases((prev) => new Set(prev).add("planning"));
      setCurrentPhase("validating");
    }, 600);

    setTimeout(() => {
      setCompletedPhases((prev) => new Set(prev).add("validating"));
      setCurrentPhase("executing");
    }, 900);

    try {
      const res = await executePromise;
      const data = await res.json();

      // Store result for display
      executionResultRef.current = data;

      if (data.success) {
        setCompletedPhases((prev) => new Set(prev).add("executing"));
        setCurrentPhase("committing");

        // Brief pause for final phase
        await new Promise((resolve) => setTimeout(resolve, 200));

        setCompletedPhases((prev) => new Set(prev).add("committing"));
        setCurrentPhase("complete");

        setIntent(""); // Clear intent
        const updatedHistory = await loadHistory(); // Refresh history

        // Get the latest entry ID for highlighting
        if (updatedHistory && updatedHistory.length > 0) {
          setNewLedgerEntryId(updatedHistory[0].id);
        }
      } else {
        // Handle denial or error
        const isDenied =
          res.status === 403 ||
          res.status === 422 ||
          data.error?.includes("denied") ||
          data.error?.includes("violation");

        setCurrentPhase(isDenied ? "denied" : "failed");
      }
    } catch (error: any) {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      setCurrentPhase("failed");
    } finally {
      setIsExecuting(false);
    }
  }

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case "ALLOW":
        return "bg-green-500/20 text-green-400";
      case "DENY":
        return "bg-red-500/20 text-red-400";
      case "FAIL":
        return "bg-yellow-500/20 text-yellow-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      {/* Header */}
      <header className="border-b border-gray-800 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">BICKFORD</h1>
          <p className="text-gray-400">Zero-Approval Execution Runtime</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Canon Status */}
        {canonInfo && (
          <div className="bg-gray-900 border border-gray-800 rounded p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm text-gray-500 mb-1">Canon Status</div>
                <div className="text-green-400 font-semibold">
                  {canonInfo.canon?.status || "UNKNOWN"} v
                  {canonInfo.canon?.version || "?"}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">Hash</div>
                <div className="text-gray-300 text-xs">
                  {canonInfo.canon?.hash}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Intent Input */}
        <div className="bg-gray-900 border border-gray-800 rounded p-6">
          <label className="block text-sm text-gray-400 mb-2">INTENT</label>
          <textarea
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            placeholder="Describe what you want to do... (e.g., 'Add a new feature to generate reports', 'Fix the login bug', 'Update documentation')"
            className="w-full bg-black border border-gray-700 rounded p-4 text-white font-mono text-lg min-h-[150px] focus:outline-none focus:border-blue-500 transition-colors"
            disabled={isExecuting}
          />

          {/* Execute Button */}
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={handleExecute}
              disabled={isExecuting || !intent.trim()}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold rounded transition-colors"
            >
              {isExecuting ? "EXECUTING..." : "EXECUTE"}
            </button>
          </div>
        </div>

        {/* Phase Progress Indicator */}
        {isExecuting && currentPhase !== "idle" && (
          <div className="bg-gray-900 border border-gray-800 rounded p-4">
            <div className="flex items-center gap-2 text-sm flex-wrap">
              {phases.map((phase, i) => {
                const isCompleted = completedPhases.has(phase);
                const isCurrent = currentPhase === phase;

                return (
                  <div key={phase} className="flex items-center gap-2">
                    <div
                      className={`flex items-center gap-1 transition-all duration-200 ${
                        isCurrent
                          ? "text-blue-400 font-semibold"
                          : isCompleted
                            ? "text-green-400"
                            : "text-gray-600"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                      <span className="capitalize">{phase}</span>
                    </div>
                    {i < phases.length - 1 && (
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Execution Result - Unmistakable Visual States */}
        {currentPhase === "complete" && executionResultRef.current?.success && (
          <div className="border-2 border-green-500 bg-green-950/30 p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="w-7 h-7 text-green-500 flex-shrink-0" />
              <h3 className="text-2xl font-bold text-green-400">Executed</h3>
            </div>
            <p className="text-green-300 text-lg mb-3">
              {executionResultRef.current.message ||
                "Execution completed successfully"}
            </p>
            {executionResultRef.current.result?.ledgerEntry?.id && (
              <div className="mt-3 text-sm text-green-400/80">
                Ledger entry:{" "}
                <code className="bg-black/30 px-2 py-1 rounded">
                  {executionResultRef.current.result.ledgerEntry.id}
                </code>
              </div>
            )}
          </div>
        )}

        {currentPhase === "denied" && (
          <div className="border-2 border-red-500 bg-red-950/30 p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <XCircle className="w-7 h-7 text-red-500 flex-shrink-0" />
              <h3 className="text-2xl font-bold text-red-400">Denied</h3>
            </div>
            <p className="text-red-300 text-lg font-medium mb-2">
              {executionResultRef.current?.message ||
                executionResultRef.current?.error ||
                "Execution denied by canon rules"}
            </p>
            {executionResultRef.current?.error && (
              <div className="mt-3 text-sm text-red-400/80">
                Canon rule:{" "}
                <code className="bg-black/30 px-2 py-1 rounded">
                  {executionResultRef.current.error}
                </code>
              </div>
            )}
          </div>
        )}

        {currentPhase === "failed" &&
          !executionResultRef.current?.success &&
          executionResultRef.current && (
            <div className="border-2 border-yellow-500 bg-yellow-950/30 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle className="w-7 h-7 text-yellow-500 flex-shrink-0" />
                <h3 className="text-2xl font-bold text-yellow-400">Failed</h3>
              </div>
              <p className="text-yellow-300 text-lg">
                {executionResultRef.current.message ||
                  executionResultRef.current.error ||
                  "Execution failed"}
              </p>
            </div>
          )}

        {/* Execution History */}
        <div
          ref={ledgerSectionRef}
          id="ledger-section"
          className="bg-gray-900 border border-gray-800 rounded p-6"
        >
          <h2 className="text-xl font-bold mb-4">EXECUTION LEDGER</h2>

          {history.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              No executions yet. Submit an intent to begin.
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  id={`entry-${entry.id}`}
                  className="bg-black border border-gray-800 rounded p-4 hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${getOutcomeColor(entry.outcome)}`}
                      >
                        {entry.outcome}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {entry.intentType.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-gray-500 text-xs">
                      {new Date(entry.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-sm text-gray-300">{entry.reasoning}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 p-6 mt-12">
        <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm">
          <div className="mb-2">
            Canon v{canonInfo?.canon?.version || "?"} | Hash:{" "}
            {canonInfo?.canon?.hash}
          </div>
          <div>If it can&apos;t be proven, it doesn&apos;t exist.</div>
        </div>
      </footer>
    </div>
  );
}
