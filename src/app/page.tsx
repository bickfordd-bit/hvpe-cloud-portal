"use client";

/**
 * Bickford Homepage — Zero-Approval Execution Runtime
 * 
 * Daily operating surface for intent-to-reality execution.
 * No human approval gates. Canon-verified, hash-chained ledger.
 */

import { useState, useEffect } from 'react';

interface ExecutionStatus {
  stage: string;
  message: string;
  status: 'idle' | 'running' | 'success' | 'error';
}

interface LedgerEntry {
  id: string;
  timestamp: string;
  intentType: string;
  outcome: 'ALLOW' | 'DENY' | 'FAIL';
  reasoning: string;
}

export default function BickfordHomepage() {
  const [intent, setIntent] = useState('');
  const [status, setStatus] = useState<ExecutionStatus>({
    stage: 'idle',
    message: 'Ready',
    status: 'idle'
  });
  const [history, setHistory] = useState<LedgerEntry[]>([]);
  const [canonInfo, setCanonInfo] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Load canon info and history on mount
  useEffect(() => {
    loadCanonInfo();
    loadHistory();
  }, []);

  async function loadCanonInfo() {
    try {
      const res = await fetch('/api/execute');
      const data = await res.json();
      setCanonInfo(data);
    } catch (error) {
      console.error('Failed to load canon info:', error);
    }
  }

  async function loadHistory() {
    try {
      const res = await fetch('/api/ledger?limit=10');
      if (res.ok) {
        const data = await res.json();
        setHistory(data.entries || []);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  }

  async function handleExecute() {
    if (!intent.trim()) {
      setStatus({
        stage: 'error',
        message: 'Intent cannot be empty',
        status: 'error'
      });
      return;
    }

    setIsExecuting(true);
    setStatus({
      stage: 'parsing',
      message: 'Parsing intent...',
      status: 'running'
    });

    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent, dryRun: false })
      });

      const data = await res.json();

      if (data.success) {
        setStatus({
          stage: 'complete',
          message: data.message || 'Execution successful',
          status: 'success'
        });
        setIntent(''); // Clear intent
        loadHistory(); // Refresh history
      } else {
        setStatus({
          stage: 'failed',
          message: data.message || data.error || 'Execution failed',
          status: 'error'
        });
      }
    } catch (error: any) {
      setStatus({
        stage: 'error',
        message: `Network error: ${error.message}`,
        status: 'error'
      });
    } finally {
      setIsExecuting(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'running': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'ALLOW': return 'bg-green-500/20 text-green-400';
      case 'DENY': return 'bg-red-500/20 text-red-400';
      case 'FAIL': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      {/* Header */}
      <header className="border-b border-gray-800 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">BICKFORD</h1>
          <p className="text-gray-400">Zero-Approval Execution Runtime</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Canon Status */}
        {canonInfo && (
          <div className="bg-gray-900 border border-gray-800 rounded p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm text-gray-500 mb-1">Canon Status</div>
                <div className="text-green-400 font-semibold">
                  {canonInfo.canon?.status || 'UNKNOWN'} v{canonInfo.canon?.version || '?'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">Hash</div>
                <div className="text-gray-300 text-xs">{canonInfo.canon?.hash}</div>
              </div>
            </div>
          </div>
        )}

        {/* Intent Input */}
        <div className="bg-gray-900 border border-gray-800 rounded p-6">
          <label className="block text-sm text-gray-400 mb-2">
            INTENT
          </label>
          <textarea
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            placeholder="Describe what you want to do... (e.g., 'Add a new feature to generate reports', 'Fix the login bug', 'Update documentation')"
            className="w-full bg-black border border-gray-700 rounded p-4 text-white font-mono text-lg min-h-[150px] focus:outline-none focus:border-blue-500 transition-colors"
            disabled={isExecuting}
          />
          
          {/* Execute Button */}
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={handleExecute}
              disabled={isExecuting || !intent.trim()}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold rounded transition-colors"
            >
              {isExecuting ? 'EXECUTING...' : 'EXECUTE'}
            </button>
            
            {/* Status Display */}
            <div className={`text-sm ${getStatusColor(status.status)}`}>
              <span className="font-semibold">{status.stage.toUpperCase()}</span>
              {status.message && (
                <span className="ml-2">— {status.message}</span>
              )}
            </div>
          </div>
        </div>

        {/* Execution History */}
        <div className="bg-gray-900 border border-gray-800 rounded p-6">
          <h2 className="text-xl font-bold mb-4">EXECUTION LEDGER</h2>
          
          {history.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              No executions yet. Submit an intent to begin.
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-black border border-gray-800 rounded p-4 hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getOutcomeColor(entry.outcome)}`}>
                        {entry.outcome}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {entry.intentType.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-gray-500 text-xs">
                      {new Date(entry.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-sm text-gray-300">
                    {entry.reasoning}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 p-6 mt-12">
        <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm">
          <div className="mb-2">
            Canon v{canonInfo?.canon?.version || '?'} | Hash: {canonInfo?.canon?.hash}
          </div>
          <div>
            If it can&apos;t be proven, it doesn&apos;t exist.
          </div>
        </div>
      </footer>
    </div>
  );
}
