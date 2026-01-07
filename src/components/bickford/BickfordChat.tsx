"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function BickfordChat() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<Array<{ role: string; content: string }>>(
    [],
  );
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!message.trim()) return;

    const userMessage = { role: "user", content: message };
    const currentMessage = message; // Capture before clearing
    setChat((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/bickford/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentMessage,
          history: chat,
        }),
      });

      const data = await res.json();
      setChat((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch (error) {
      setChat((prev) => [
        ...prev,
        { role: "assistant", content: "Error: Unable to reach Bickford" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border border-neutral-700 rounded-lg p-6 h-96 flex flex-col">
      <h3 className="text-lg font-semibold mb-4">Bickford Chat</h3>
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {chat.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded ${
              msg.role === "user"
                ? "bg-blue-900/30 ml-8"
                : "bg-neutral-800 mr-8"
            }`}
          >
            <div className="text-xs text-neutral-400 mb-1">
              {msg.role === "user" ? "You" : "Bickford"}
            </div>
            <div className="text-sm">{msg.content}</div>
          </div>
        ))}
        {loading && (
          <div className="bg-neutral-800 p-3 rounded mr-8">
            <div className="text-xs text-neutral-400 mb-1">Bickford</div>
            <div className="text-sm">Thinking...</div>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask Bickford about your portfolio..."
          className="flex-1 bg-neutral-800 border border-neutral-700 rounded px-3 py-2"
        />
        <Button onClick={sendMessage} disabled={loading || !message.trim()}>
          Send
        </Button>
      </div>
    </div>
  );
}
