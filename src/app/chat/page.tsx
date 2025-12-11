// src/app/chat/page.tsx
"use client";

import { useState, type ReactNode } from "react";
import DoDLayout from "@/components/layout/DoDLayout";
import { Send, Shield, Crosshair, Cpu, Workflow } from "lucide-react";

type Mode = "general" | "optr" | "bic" | "ovtr";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  mode: Mode;
}

export default function ChatPage() {
  const [mode, setMode] = useState<Mode>("general");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      mode
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/hvpe-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          mode,
          context: buildContextForMode(mode)
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unknown error");
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply,
        mode
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <DoDLayout>
      <div className="flex h-full flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-wide">
              BIC // Mission Assistant Console
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-700">
              Secure conversational layer for OPTR, BIC, and OVTR. Use this
              console to reason about opportunities, integrations, and mission
              objectives in DoD terms.
            </p>
          </div>
          <ModeSelector mode={mode} onChange={setMode} />
        </div>

        {/* Chat window */}
        <div className="flex min-h-[300px] flex-1 flex-col rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="flex h-full items-center justify-center px-8 text-center text-sm text-gray-500">
                Select a mode (General, OPTR, BIC, or OVTR) and ask a question.
                Example: “Evaluate the AI partnerships RFI in OPTR terms and
                tell me what is blocking submission.”
              </div>
            )}

            {messages.map((m) => (
              <ChatBubble key={m.id} message={m} />
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="border-t border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">
              Error: {error}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-gray-200 p-3">
            <div className="flex items-end gap-2">
              <textarea
                className="flex-1 resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A1F44]"
                rows={2}
                placeholder="Type your question and press Enter to send. Shift+Enter for newline."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                onClick={handleSend}
                disabled={loading}
                className="flex h-10 w-10 items-center justify-center rounded-md bg-[#0A1F44] text-white hover:bg-[#111827] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </DoDLayout>
  );
}

function ModeSelector({
  mode,
  onChange
}: {
  mode: Mode;
  onChange: (m: Mode) => void;
}) {
  const modes: { id: Mode; label: string; icon: ReactNode }[] = [
    { id: "general", label: "General", icon: <Shield size={14} /> },
    { id: "optr", label: "OPTR", icon: <Crosshair size={14} /> },
    { id: "bic", label: "BIC", icon: <Cpu size={14} /> },
    { id: "ovtr", label: "OVTR", icon: <Workflow size={14} /> }
  ];

  return (
    <div className="flex min-w-[260px] flex-col gap-1 rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
      <div className="px-1 text-xs font-semibold uppercase tracking-wide text-gray-600">
        Mode
      </div>
      <div className="flex flex-wrap gap-1">
        {modes.map((m) => {
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onChange(m.id)}
              className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs transition ${
                active
                  ? "border-[#0A1F44] bg-[#0A1F44] text-white"
                  : "border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {m.icon}
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const align = isUser ? "items-end" : "items-start";
  const bubbleStyle = isUser
    ? "bg-[#0A1F44] text-white"
    : "bg-gray-100 text-gray-900";
  const label = isUser ? "You" : modeLabel(message.mode);

  return (
    <div className={`flex ${align}`}>
      <div className="max-w-[80%]">
        <div className="mb-0.5 text-[10px] uppercase tracking-wide text-gray-500">
          {label}
        </div>
        <div
          className={`whitespace-pre-wrap rounded-md px-3 py-2 text-sm ${bubbleStyle}`}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}

function modeLabel(mode: Mode): string {
  switch (mode) {
    case "optr":
      return "OPTR Engine";
    case "bic":
      return "BIC Engine";
    case "ovtr":
      return "OVTR Orchestrator";
    case "general":
    default:
      return "Assistant";
  }
}

function buildContextForMode(mode: Mode): any {
  switch (mode) {
    case "optr":
      return {
        engine: "OPTR",
        note:
          "Inject current opportunity, R/E/P/S status, gaps, and confidence score here."
      };
    case "bic":
      return {
        engine: "BIC",
        note:
          "Inject system inventory, legacy platforms, and integration objectives here."
      };
    case "ovtr":
      return {
        engine: "OVTR",
        note:
          "Inject summary of OPTR and BIC states so OVTR can decide which is primary."
      };
    case "general":
    default:
      return { engine: "General" };
  }
}
