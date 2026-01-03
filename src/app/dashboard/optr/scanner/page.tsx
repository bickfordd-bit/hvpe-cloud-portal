'use client';

import { useEffect, useState } from 'react';

export default function OPTRScanner() {
  const [loading, setLoading] = useState(true);
  const [opps, setOpps] = useState<unknown[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/optr/top10');
        const data = await res.json();
        setOpps(data.results || []);
      } catch (err: unknown) {
        console.error('Failed to load opportunities', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="p-8 text-white">Scanning open opportunities…</div>;
  }

  return (
    <div className="min-h-screen bg-black px-8 py-8 text-white">
      <h1 className="mb-6 text-2xl">Top 10 Federal Opportunities (Live OPTR Scan)</h1>

      <div className="space-y-6">
        {opps.map((opp: unknown, i: number) => (
          <a
            key={i}
            href={`/dashboard/optr/${opp.id ?? i + 1}`}
            className="block rounded-xl border border-neutral-800 p-4 hover:bg-neutral-900"
          >
            <h2 className="text-xl font-semibold">{opp.title}</h2>
            <p className="text-sm text-neutral-400">{opp.agency}</p>
            <p className="mt-1 text-xs text-neutral-500">Due: {opp.responseDate}</p>
            {typeof opp.readinessScore === 'number' && (
              <p className="mt-1 text-xs text-neutral-400">
                Readiness: {opp.readinessScore}% · {opp.status}
              </p>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
