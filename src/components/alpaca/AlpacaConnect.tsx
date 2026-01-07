"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function AlpacaConnect() {
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  async function handleConnect() {
    setConnecting(true);
    try {
      const res = await fetch("/api/alpaca/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, apiSecret }),
      });

      if (res.ok) {
        setConnected(true);
        setApiKey("");
        setApiSecret("");
      } else {
        const error = await res.json();
        alert(`Connection failed: ${error.message || error.error}`);
      }
    } finally {
      setConnecting(false);
    }
  }

  return (
    <div className="border border-neutral-700 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Connect Alpaca</h3>
      {connected ? (
        <div className="text-green-500">✓ Alpaca API connected</div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-neutral-400 mb-2">
              API Key
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2"
              placeholder="PKXXXXXXXX"
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-2">
              API Secret
            </label>
            <input
              type="password"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2"
              placeholder="Enter secret key"
            />
          </div>
          <Button
            onClick={handleConnect}
            disabled={connecting || !apiKey || !apiSecret}
            className="w-full"
          >
            {connecting ? "Connecting..." : "Connect Alpaca"}
          </Button>
          <p className="text-xs text-neutral-500">
            Paper trading by default. Keys stored securely in Vercel.
          </p>
        </div>
      )}
    </div>
  );
}
