'use client';

import { useEffect, useMemo, useState } from 'react';
import { OptrShell } from '@/components/optr/OptrShell';
import { OptrOpportunityList } from '@/components/optr/OptrOpportunityList';
import { optrClient } from '@/lib/optr/client';
import type { Opportunity } from '@/lib/optr/types';

export default function OptrHomePage() {
  const [items, setItems] = useState<Opportunity[]>([]);
  const [q, setQ] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    setErr(null);
    try {
      const data = await optrClient.list();
      setItems(data);
    } catch (e: unknown) {
      setErr(e.message || 'Failed to load opportunities.');
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((x) => `${x.title} ${x.agency} ${x.id}`.toLowerCase().includes(s));
  }, [items, q]);

  async function seedMock() {
    setBusy(true);
    setErr(null);
    try {
      const now = new Date();
      const deadline = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 14).toISOString();
      const created = await optrClient.create({
        id: `oppty_${Math.random().toString(16).slice(2)}`,
        title: 'Sample Opportunity (Mock)',
        agency: 'DEMO / TEST',
        deadline_iso: deadline,
        source: 'manual',
        links: [],
        documents: [],
      });
      setItems((prev) => [created, ...prev]);
    } catch (e: unknown) {
      setErr(e.message || 'Failed to create mock.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <OptrShell
      title="Opportunities"
      subtitle="List, open, run OPTR, and view blockers/traceability."
      right={
        <>
          <button
            onClick={refresh}
            className="rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm hover:bg-neutral-800"
          >
            Refresh
          </button>
          <button
            disabled={busy}
            onClick={seedMock}
            className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-black hover:bg-emerald-500 disabled:opacity-50"
          >
            Seed Mock
          </button>
        </>
      }
    >
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title / agency / id…"
            className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-neutral-600 md:max-w-md"
          />
          <div className="text-sm text-neutral-400">{filtered.length} shown</div>
        </div>

        {err ? (
          <div className="mt-4 rounded-xl border border-red-900 bg-red-950/40 p-3 text-sm text-red-200">
            {err}
          </div>
        ) : null}

        <div className="mt-4">
          <OptrOpportunityList items={filtered} />
        </div>
      </div>
    </OptrShell>
  );
}
