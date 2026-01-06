"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type IntentState =
  | "idle"
  | "analyzing"
  | "proposed"
  | "executing"
  | "complete"
  | "error";

type Action = {
  step: string;
  why: string;
};

type AnalysisResult = {
  summary: string;
  actions: Action[];
  configFlags?: string[];
};

type ProgressUpdate = {
  step: string;
  status: "pending" | "in_progress" | "complete" | "error";
  message: string;
  timestamp: Date;
};

export function IntentPanel() {
  const [state, setState] = useState<IntentState>("idle");
  const [intent, setIntent] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [progress, setProgress] = useState<ProgressUpdate[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!intent.trim()) return;

    setState("analyzing");
    setError(null);
    setAnalysis(null);

    try {
      const response = await fetch("/api/intent/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const result: AnalysisResult = await response.json();
      setAnalysis(result);
      setState("proposed");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Analysis failed";
      setError(errorMessage);
      setState("error");
    }
  };

  const handleExecute = async () => {
    if (!analysis) return;

    setState("executing");
    setProgress([]);
    setError(null);

    try {
      const eventSource = new EventSource(
        `/api/intent/execute?intent=${encodeURIComponent(intent)}`,
      );

      eventSource.onmessage = (event) => {
        try {
          const update: ProgressUpdate = JSON.parse(event.data);
          setProgress((prev) => [...prev, update]);

          // Check if all steps are complete
          if (update.status === "complete") {
            const allComplete = progress.every((p) => p.status === "complete");
            if (allComplete) {
              setState("complete");
              eventSource.close();
            }
          }
        } catch (err) {
          console.error("Failed to parse progress update:", err);
        }
      };

      eventSource.onerror = (err) => {
        console.error("EventSource error:", err);
        setError("Execution stream failed");
        setState("error");
        eventSource.close();
      };

      // Auto-close after 30 seconds
      setTimeout(() => {
        if (eventSource.readyState !== EventSource.CLOSED) {
          setState("complete");
          eventSource.close();
        }
      }, 30000);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Execution failed";
      setError(errorMessage);
      setState("error");
    }
  };

  const handleReset = () => {
    setState("idle");
    setIntent("");
    setAnalysis(null);
    setProgress([]);
    setError(null);
  };

  const getStatusIcon = (status: ProgressUpdate["status"]) => {
    switch (status) {
      case "pending":
        return "⏳";
      case "in_progress":
        return "⏳";
      case "complete":
        return "✅";
      case "error":
        return "❌";
      default:
        return "•";
    }
  };

  return (
    <Card className="mb-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Intent Panel</h2>
          {state !== "idle" && state !== "analyzing" && (
            <Button variant="ghost" size="sm" onClick={handleReset}>
              New Intent
            </Button>
          )}
        </div>

        {/* Input Section */}
        {(state === "idle" || state === "analyzing") && (
          <div className="space-y-3">
            <Textarea
              placeholder="Tell me what you want to do in plain English..."
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              disabled={state === "analyzing"}
              rows={3}
              className="resize-none"
            />
            <Button
              onClick={handleAnalyze}
              disabled={!intent.trim() || state === "analyzing"}
              className="w-full"
            >
              {state === "analyzing" ? "Analyzing..." : "Analyze Intent"}
            </Button>
          </div>
        )}

        {/* Analysis/Proposal Section */}
        {state === "proposed" && analysis && (
          <div className="space-y-4">
            <div className="rounded-lg bg-neutral-900 p-4 space-y-3">
              <p className="text-sm text-neutral-300">✨ {analysis.summary}</p>
              <div className="space-y-2">
                {analysis.actions.map((action, idx) => (
                  <div key={idx} className="border-l-2 border-neutral-700 pl-3">
                    <p className="text-sm font-medium text-white">
                      ✅ {action.step}
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">
                      {action.why}
                    </p>
                  </div>
                ))}
              </div>
              {analysis.configFlags && analysis.configFlags.length > 0 && (
                <div className="pt-2 border-t border-neutral-800">
                  <p className="text-xs text-neutral-500">
                    Config flags: {analysis.configFlags.join(", ")}
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleExecute} className="flex-1">
                Execute
              </Button>
              <Button variant="outline" onClick={handleReset}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Execution Progress Section */}
        {state === "executing" && (
          <div className="space-y-2">
            <p className="text-sm text-neutral-400 mb-3">Executing...</p>
            {progress.map((update, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex items-start gap-2 text-sm",
                  update.status === "complete" && "text-green-400",
                  update.status === "error" && "text-red-400",
                  update.status === "in_progress" && "text-yellow-400",
                  update.status === "pending" && "text-neutral-500",
                )}
              >
                <span className="mt-0.5">{getStatusIcon(update.status)}</span>
                <div className="flex-1">
                  <p className="font-medium">{update.step}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {update.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Complete Section */}
        {state === "complete" && (
          <div className="space-y-3">
            <div className="rounded-lg bg-green-950/30 border border-green-800 p-4">
              <p className="text-sm text-green-400">
                🎉 Done! Your intent has been executed.
              </p>
            </div>
            {progress.length > 0 && (
              <div className="space-y-2">
                {progress.map((update, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-sm text-neutral-400"
                  >
                    <span className="mt-0.5">
                      {getStatusIcon(update.status)}
                    </span>
                    <div className="flex-1">
                      <p>{update.step}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Error Section */}
        {state === "error" && error && (
          <div className="rounded-lg bg-red-950/30 border border-red-800 p-4">
            <p className="text-sm text-red-400">❌ {error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="mt-3"
            >
              Try Again
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
