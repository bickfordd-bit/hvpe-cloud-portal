'use client';

import { useState } from 'react';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type Persona = 'trader' | 'founder' | 'investor' | 'dod';

const STARTER_MESSAGE: ChatMessage = {
  role: 'assistant',
  content:
    'HVPE Copilot online. Choose a persona (Trader, Founder, Investor, or DoD) and ask me anything.',
};

export default function HvpeChatDock() {
  const [open, setOpen] = useState(true);
  const [persona, setPersona] = useState<Persona>('trader');
  const [messages, setMessages] = useState<ChatMessage[]>([STARTER_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/hvpe-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona,
          messages: nextMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('hvpe-chat error:', errorText);
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const replyText =
        typeof data?.reply === 'string'
          ? data.reply
          : typeof data?.reply?.content === 'string'
            ? data.reply.content
            : 'No response received.';

      setMessages([
        ...nextMessages,
        {
          role: 'assistant',
          content: replyText,
        },
      ]);
    } catch (error: unknown) {
      console.error('hvpe-chat fetch error:', error);
      setMessages([
        ...nextMessages,
        {
          role: 'assistant',
          content:
            'I hit an error reaching the chat backend. Check the logs, OPENAI_API_KEY, and HVPE_METRICS_URL.',
        },
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
        {open ? 'Close HVPE Chat' : 'HVPE Chat'}
      </button>

      {open && (
        <div className="fixed bottom-20 right-6 z-40 flex h-[420px] w-[360px] flex-col rounded-2xl border border-slate-700 bg-slate-900/95 shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">
                HVPE Cloud / Apex Mode
              </div>
              <div className="text-sm font-semibold text-slate-100">BIC Copilot</div>
              <div className="mt-1 flex gap-1 text-[10px]">
                {(
                  [
                    ['trader', 'Trader'],
                    ['founder', 'Founder'],
                    ['investor', 'Investor'],
                    ['dod', 'DoD / OPTR'],
                  ] as [Persona, string][]
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPersona(value)}
                    className={`rounded-full px-2 py-0.5 ${
                      persona === value
                        ? 'bg-sky-500 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
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
              <div
                key={`${m.role}-${i}`}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs whitespace-pre-wrap ${
                    m.role === 'user' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-100'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl bg-slate-800 px-3 py-2 text-xs text-slate-300">
                  Thinking...
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={sendMessage}
            className="flex items-center gap-2 border-t border-slate-700 px-3 py-2"
          >
            <input
              className="flex-1 rounded-xl bg-slate-800 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Ask HVPE anything..."
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
