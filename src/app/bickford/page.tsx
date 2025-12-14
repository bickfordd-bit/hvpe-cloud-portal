"use client";

import { useState, useEffect } from "react";
import { Send, Sparkles, Zap } from "lucide-react";
import Link from "next/link";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function BickfordApp() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [usageId] = useState(() => crypto.randomUUID());

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "Welcome to Bickford. I transform your intentions into reality instantly. What would you like to manifest today?",
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/bickford-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          usageId,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "I apologize, but I'm experiencing a technical issue. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative">
      {/* Differentiator Label */}
      <div className="fixed bottom-6 left-6 z-50">
        <Link href="/bickford/how-it-works">
          <div className="bg-gradient-to-br from-purple-600/90 to-pink-600/90 backdrop-blur-md rounded-xl px-4 py-2.5 shadow-2xl border border-white/20 hover:from-purple-500/90 hover:to-pink-500/90 hover:scale-105 transition-all duration-200 cursor-pointer">
            <p className="text-sm font-medium text-white">Not chat — instant reality transformation</p>
          </div>
        </Link>
      </div>

      {/* Header */}
      <div className="border-b border-white/20 bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 shadow-lg">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <div className="text-center">
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-pink-200">Bickford</h1>
                <p className="text-sm text-purple-300 font-medium">Intent → Reality</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex flex-col space-y-6">
          {/* Messages */}
          <div className="flex-1 space-y-5 min-h-[450px] max-h-[650px] overflow-y-auto px-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-4 duration-300`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-4 shadow-lg ${
                    message.role === "user"
                      ? "bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 text-white"
                      : "bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md text-white border border-white/30"
                  }`}
                >
                  <p className="text-base leading-relaxed">{message.content}</p>
                  <div className={`text-xs mt-2.5 flex items-center gap-1 ${
                    message.role === "user" ? "text-purple-100" : "text-white/70"
                  }`}>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-current opacity-50"></span>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md rounded-2xl px-5 py-4 border border-white/30 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-2.5 h-2.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }}></div>
                      <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }}></div>
                    </div>
                    <span className="text-sm text-white/90 font-medium">Transforming intention...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl border border-white/20 p-5 shadow-2xl">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="What would you like to manifest today?"
                  className="w-full resize-none rounded-xl bg-white/10 border border-white/30 px-5 py-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent focus:bg-white/15 transition-all duration-200 text-base"
                  rows={2}
                  disabled={loading}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 text-white hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-purple-500/50 hover:scale-105 active:scale-95"
              >
                <Zap className="h-6 w-6" />
              </button>
            </div>
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-white/50">
              <span className="inline-block w-1 h-1 rounded-full bg-green-400 animate-pulse"></span>
              <span>Protected by patent-pending technology</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/20 bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur-md mt-12">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <div className="text-center text-xs text-white/70 space-y-2">
            <div className="font-semibold text-white/80">
              © 2025 Bickford Technologies LLC. All Rights Reserved.
            </div>
            <div className="flex items-center justify-center gap-3 text-white/60">
              <span>Patent Pending</span>
              <span>•</span>
              <span>Proprietary Technology</span>
              <span>•</span>
              <span>Intent → Reality</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}