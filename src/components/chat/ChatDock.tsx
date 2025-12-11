// src/components/chat/ChatDock.tsx
"use client";

import { useState } from "react";
import { Send } from "lucide-react";

type Mode = "general" | "optr" | "bic" | "ovtr";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatDock() {
  const [mode] = useState<Mode>("general");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!input.trim() || loading) return;
    const content = input.trim();
    setInput("");

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/hvpe-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, mode })
      });
      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply || "[no response]"
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Chat error – check /api/hvpe-chat logs."
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-600">
        HVPE // Chat
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-3 text-xs">
        {messages.length === 0 && (
          <div className="text-[11px] text-gray-500">
            Ask HVPE about opportunities, integrations, or system status.
          </div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[90%] ${m.role === "user" ? "ml-auto text-right" : "mr-auto text-left"}`}
          >
            <div
              className={`inline-block whitespace-pre-wrap rounded-md px-2 py-1 ${
                m.role === "user" ? "bg-[#0A1F44] text-white" : "bg-gray-100 text-gray-900"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 p-2">
        <div className="flex items-end gap-1">
          <textarea
            rows={2}
            className="flex-1 resize-none rounded-md border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-[#0A1F44]"
            placeholder="Type and press Enter…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <button
            onClick={send}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-md bg-[#0A1F44] text-white hover:bg-[#111827] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
