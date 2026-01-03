"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { handleIntent } from "@/lib/runtime/handleIntent";
import { KnowledgeTile } from "@/components/filing/KnowledgeTile";
import { OPTRTile } from "@/components/filing/OPTRTile";
import { ValuationTile } from "@/components/filing/ValuationTile";
import { BranchGrid } from "@/components/filing/BranchGrid";
import { BranchOPTRCompare } from "@/components/filing/BranchOPTRCompare";
import { ChatInput } from "@/components/filing/ChatInput";

export default function BickfordApp() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (message: string) => {
    setLoading(true);
    try {
      // Process intent locally
      handleIntent(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Differentiator Label */}
      <div className="fixed bottom-6 left-6 z-50">
        <Link href="/bickford/how-it-works">
          <div className="bg-gradient-to-br from-purple-600/90 to-pink-600/90 backdrop-blur-md rounded-xl px-4 py-2.5 shadow-2xl border border-white/20 hover:from-purple-500/90 hover:to-pink-500/90 hover:scale-105 transition-all duration-200 cursor-pointer">
            <p className="text-sm font-medium text-white">
              Filing UI - Measure Execution Speed
            </p>
          </div>
        </Link>
      </div>

      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-950">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 shadow-lg">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Bickford Filing
                </h1>
                <p className="text-sm text-gray-400">
                  Intent → Reality (Measured)
                </p>
              </div>
            </div>

            {/* Metric Tiles */}
            <div className="flex items-center gap-4">
              <KnowledgeTile />
              <OPTRTile />
              <ValuationTile />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="space-y-6">
          {/* Branch Grid */}
          <BranchGrid />

          {/* Branch Comparison Panel */}
          <BranchOPTRCompare />

          {/* Chat Input */}
          <ChatInput onSubmit={handleSubmit} disabled={loading} />
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-800 bg-gray-950 mt-12">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <div className="text-center text-xs text-gray-500 space-y-2">
            <div className="font-semibold text-gray-400">
              © 2025 Bickford Technologies LLC. All Rights Reserved.
            </div>
            <div className="flex items-center justify-center gap-3 text-gray-600">
              <span>Patent Pending</span>
              <span>•</span>
              <span>OPTR Valuation</span>
              <span>•</span>
              <span>Investor-Grade Metrics</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
