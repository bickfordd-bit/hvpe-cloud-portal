"use client";

import { useEffect, useMemo, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const STARTER_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "HVPE Unified Agent online. I persist your conversations and archive them at the start of each new day."
};

const CHAT_KEY_PREFIX = "hvpe-chat-history-";
const CHAT_ARCHIVE_PREFIX = "hvpe-chat-archive-";
const LAST_SEEN_DATE_KEY = "hvpe-chat-last-date";

function getDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function storageKeyFor(dateKey: string) {
  return `${CHAT_KEY_PREFIX}${dateKey}`;
}

function archiveKeyFor(dateKey: string) {
  return `${CHAT_ARCHIVE_PREFIX}${dateKey}`;
}

function readMessagesFromStorage(dateKey: string): ChatMessage[] | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(storageKeyFor(dateKey));
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored) as ChatMessage[];
    if (Array.isArray(parsed)) return parsed;
  } catch (error) {
    console.warn("HVPE chat history parse error", error);
  }

  return null;
}

export default function HvpeChatDock() {
  const [open, setOpen] = useState(true);
  const [activeDateKey, setActiveDateKey] = useState(getDateKey());
  const [messages, setMessages] = useState<ChatMessage[]>([STARTER_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Load today's history and archive prior day on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const todayKey = getDateKey();
    const lastSeen = window.localStorage.getItem(LAST_SEEN_DATE_KEY);

    if (lastSeen && lastSeen !== todayKey) {
      const lastMessages = window.localStorage.getItem(storageKeyFor(lastSeen));
      if (lastMessages) {
        window.localStorage.setItem(archiveKeyFor(lastSeen), lastMessages);
      }
    }

    const storedMessages = readMessagesFromStorage(todayKey);
    if (storedMessages && storedMessages.length) {
      setMessages(storedMessages);
    }

    setActiveDateKey(todayKey);
    window.localStorage.setItem(LAST_SEEN_DATE_KEY, todayKey);
  }, []);

  // Persist chat for the active date
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKeyFor(activeDateKey), JSON.stringify(messages));
    window.localStorage.setItem(LAST_SEEN_DATE_KEY, activeDateKey);
  }, [activeDateKey, messages]);

  // Archive and rotate history when the calendar day changes while open
  useEffect(() => {
    const id = setInterval(() => {
      const currentKey = getDateKey();
      if (currentKey !== activeDateKey) {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(archiveKeyFor(activeDateKey), JSON.stringify(messages));
          const todaysMessages = readMessagesFromStorage(currentKey) ?? [STARTER_MESSAGE];
          setMessages(todaysMessages);
          setActiveDateKey(currentKey);
        }
      }
    }, 60 * 1000);

    return () => clearInterval(id);
  }, [activeDateKey, messages]);

  const activeTitle = useMemo(
    () =>
      new Date(activeDateKey).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
      }),
    [activeDateKey]
  );

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/hvpe-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "general",
          message: trimmed
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("hvpe-chat error:", errorText);
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const replyText =
        typeof data?.reply === "string"
          ? data.reply
          : typeof data?.reply?.content === "string"
          ? data.reply.content
          : "No response received.";

      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: replyText
        }
      ]);
    } catch (error) {
      console.error("hvpe-chat fetch error:", error);
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content:
            "I hit an error reaching the chat backend. Check the logs, OPENAI_API_KEY, and HVPE_METRICS_URL."
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-400"
      >
        {open ? "Close HVPE Chat" : "HVPE Chat"}
      </button>

      {open && (
        <div className="fixed bottom-20 right-6 z-40 flex h-[420px] w-[360px] flex-col rounded-2xl border border-slate-700 bg-slate-900/95 shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">HVPE Cloud / Unified Agent</div>
              <div className="text-sm font-semibold text-slate-100">Daily Archive · {activeTitle}</div>
              <div className="mt-1 text-[10px] text-slate-400">History auto-archives every day to keep context fresh.</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full px-2 py-1 text-xs text-slate-300 hover:bg-white/10"
            >
              x
            </button>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto px-3 py-2 text-sm">
            {messages.map((m, i) => (
              <div key={`${m.role}-${i}`} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs whitespace-pre-wrap ${
                    m.role === "user" ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-100"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl bg-slate-800 px-3 py-2 text-xs text-slate-300">Thinking...</div>
              </div>
            )}
          </div>

          <form onSubmit={sendMessage} className="flex items-center gap-2 border-t border-slate-700 px-3 py-2">
            <input
              className="flex-1 rounded-xl bg-slate-800 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Ask HVPE Unified Agent anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading || input.trim().length === 0}
              className="rounded-xl bg-blue-500 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
