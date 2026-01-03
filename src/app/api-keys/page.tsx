/**
 * Copyright (c) 2025 HVPE Inc. All rights reserved.
 * Proprietary - Patent Pending
 *
 * API Keys Management Page
 */

'use client';

import { useState } from 'react';
import { Key, Download, Copy, Check, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  scopes: string[];
  createdAt: string;
  expiresAt: string | null;
  lastUsed: string | null;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generateKey() {
    if (!newKeyName.trim()) {
      setError('Please enter a name for your API key');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/api-keys/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newKeyName,
          scopes: ['bickford:chat', 'optr:run', 'optr:status'],
        }),
      });

      const data = await res.json();

      if (data.success) {
        setKeys([data.apiKey, ...keys]);
        setNewKeyName('');
      } else {
        setError(data.error || 'Failed to generate API key');
      }
    } catch (err: unknown) {
      setError(err.message || 'Failed to generate API key');
    } finally {
      setGenerating(false);
    }
  }

  function copyToClipboard(text: string, keyId: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  function downloadKey(apiKey: ApiKey) {
    const content = `# Bickford API Key
# Name: ${apiKey.name}
# Created: ${new Date(apiKey.createdAt).toLocaleString()}
# 
# KEEP THIS SECURE - DO NOT SHARE
# 

API_KEY=${apiKey.key}

# Available Scopes:
${apiKey.scopes.map((s) => `# - ${s}`).join('\n')}

# Example Usage (cURL):
curl -X POST https://your-domain.com/api/bickford-chat \\
  -H "Authorization: Bearer ${apiKey.key}" \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Hello Bickford"}'

# Example Usage (JavaScript):
const response = await fetch('https://your-domain.com/api/bickford-chat', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${apiKey.key}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ message: 'Hello Bickford' })
});
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bickford-api-key-${apiKey.name.toLowerCase().replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-sm text-neutral-400 hover:text-white mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Key className="w-8 h-8 text-emerald-500" />
            <h1 className="text-4xl font-bold">API Keys</h1>
          </div>
          <p className="text-neutral-400">
            Generate API keys to access Bickford and OPTR programmatically
          </p>
        </div>

        {/* Generate New Key */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 backdrop-blur p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            Generate New API Key
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-900 text-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generateKey()}
              placeholder="API Key Name (e.g., Production, Mobile App, Testing)"
              className="flex-1 rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
            />
            <button
              onClick={generateKey}
              disabled={generating}
              className="rounded-xl bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {generating ? 'Generating...' : 'Generate'}
            </button>
          </div>

          <div className="mt-4 text-sm text-neutral-400">
            ⚠️ Save your API key immediately - you won&apos;t be able to see it again after leaving
            this page
          </div>
        </div>

        {/* API Keys List */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 backdrop-blur overflow-hidden">
          <div className="p-6 border-b border-neutral-800">
            <h2 className="text-xl font-semibold">Your API Keys</h2>
          </div>

          {keys.length === 0 ? (
            <div className="p-12 text-center text-neutral-400">
              <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No API keys yet. Generate one above to get started.</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-800">
              {keys.map((apiKey) => (
                <div key={apiKey.id} className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{apiKey.name}</h3>
                      <p className="text-sm text-neutral-400">
                        Created {new Date(apiKey.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                        className="rounded-lg bg-neutral-800 p-2 hover:bg-neutral-700 transition-all"
                        title="Copy API key"
                      >
                        {copiedKey === apiKey.id ? (
                          <Check className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => downloadKey(apiKey)}
                        className="rounded-lg bg-emerald-600 p-2 hover:bg-emerald-500 transition-all"
                        title="Download API key with examples"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="rounded-lg bg-neutral-950 border border-neutral-800 p-4 font-mono text-sm">
                    <div className="text-neutral-400 mb-1">API Key:</div>
                    <div className="text-emerald-400 break-all">{apiKey.key}</div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {apiKey.scopes.map((scope) => (
                      <span
                        key={scope}
                        className="text-xs px-3 py-1 rounded-full bg-neutral-800 text-neutral-300"
                      >
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Documentation */}
        <div className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6">
          <h3 className="font-semibold mb-3">Quick Start</h3>
          <div className="text-sm text-neutral-300 space-y-2">
            <p>
              Use your API key in the <code className="text-emerald-400">Authorization</code>{' '}
              header:
            </p>
            <pre className="bg-neutral-950 border border-neutral-800 p-4 rounded-lg overflow-x-auto">
              {`Authorization: Bearer bickford_your_api_key_here`}
            </pre>
            <p className="pt-2">Available endpoints:</p>
            <ul className="list-disc list-inside space-y-1 text-neutral-400">
              <li>
                <code className="text-emerald-400">/api/bickford-chat</code> - Intent to reality
                chat
              </li>
              <li>
                <code className="text-emerald-400">/api/optr/opportunities</code> - List
                opportunities
              </li>
              <li>
                <code className="text-emerald-400">/api/optr/opportunities/[id]/run</code> - Run
                OPTR analysis
              </li>
              <li>
                <code className="text-emerald-400">/api/optr/opportunities/[id]/status</code> -
                Check status
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
