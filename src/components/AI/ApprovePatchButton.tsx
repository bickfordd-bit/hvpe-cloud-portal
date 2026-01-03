'use client';

import React, { useState } from 'react';

export default function ApprovePatchButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function approveAndApply() {
    setLoading(true);
    setMsg(null);
    try {
      // approve
      const ap = await fetch(`/api/ai/patches/${id}/approve`, {
        method: 'POST',
        headers: { 'x-admin-secret': (window as unknown).__ADMIN_SECRET || '' },
      });
      const aj = await ap.json();
      if (aj.error) return setMsg(`approve failed: ${aj.error}`);

      // apply
      const res = await fetch(`/api/ai/patches/${id}/apply`, {
        method: 'POST',
        headers: { 'x-admin-secret': (window as unknown).__ADMIN_SECRET || '' },
      });
      const j = await res.json();
      if (j.error) setMsg(String(j.error));
      else setMsg(`Applied → ${j.branch}`);
    } catch (e: unknown) {
      setMsg(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        className="px-2 py-1 bg-emerald-600 rounded"
        onClick={approveAndApply}
        disabled={loading}
      >
        {loading ? 'Working...' : 'Approve & Apply'}
      </button>
      {msg && <div className="text-xs text-neutral-300">{msg}</div>}
    </div>
  );
}
