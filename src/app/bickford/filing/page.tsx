/**
 * Bickford Filing Page
 * Main filing interface with live OPTR/TTV computation
 */

"use client";

import { BranchGrid } from "@/components/filing/BranchGrid";
import { CanonBar } from "@/components/filing/CanonBar";
import { KnowledgeTile } from "@/components/filing/KnowledgeTile";
import { OPTRTile } from "@/components/filing/OPTRTile";
import { ChatInput } from "@/components/chat/ChatInput";

export default function FilingPage() {
  const handleSubmit = async (text: string) => {
    await fetch("/api/intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        mode: "FILING",
        instanceId: "bickford",
        sessionId: "default",
      }),
    });
  };

  return (
    <div className="min-h-screen bg-black text-gray-100">
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <div>
          <h1 className="text-2xl font-bold">BICKFORD</h1>
          <p className="text-xs text-gray-500">Fully persisted in real time</p>
        </div>
        <div className="flex items-center gap-4">
          <KnowledgeTile />
          <OPTRTile />
        </div>
      </header>

      <CanonBar />
      <BranchGrid />
      <ChatInput onSubmit={handleSubmit} />
    </div>
  );
}
