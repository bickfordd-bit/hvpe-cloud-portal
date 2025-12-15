import Link from 'next/link';

interface T2VDelta {
  id: string;
  accountId: string;
  engagementId: string | null;
  baselineValue: number;
  improvedValue: number | null;
  improvedAt: string | null;
  unit: string | null;
  source: string | null;
  confidence: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

async function fetchT2VDeltas(): Promise<T2VDelta[]> {
  try {
    // Use relative URL for server-side fetch (Next.js will resolve it)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/t2v-deltas?accountId=demo`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('Failed to fetch T2V deltas:', res.status, res.statusText);
      return [];
    }

    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching T2V deltas:', error);
    return [];
  }
}

export default async function T2VDashboardPage() {
  const deltas = await fetchT2VDeltas();

  return (
    <div className="min-h-screen bg-black px-8 py-8 text-white">
      <header className="mb-8">
        <div className="mb-4">
          <Link
            href="/dashboard/optr"
            className="text-sm text-neutral-400 hover:text-white"
          >
            ← Back to OPTR Dashboard
          </Link>
        </div>
        <h1 className="text-2xl font-semibold">T2V Delta Ledger</h1>
        <p className="mt-2 text-sm text-neutral-400">
          Track Time-to-Value improvements across engagements
        </p>
      </header>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6">
        {deltas.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-neutral-400">
              No T2V deltas found for demo account.
            </p>
            <p className="mt-2 text-sm text-neutral-500">
              Create deltas via POST /api/t2v-deltas
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium">
                Showing {deltas.length} delta{deltas.length !== 1 ? 's' : ''}
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-800 text-left text-sm text-neutral-400">
                    <th className="pb-3 pr-4 font-medium">Engagement</th>
                    <th className="pb-3 pr-4 font-medium">Baseline</th>
                    <th className="pb-3 pr-4 font-medium">Improved</th>
                    <th className="pb-3 pr-4 font-medium">Delta</th>
                    <th className="pb-3 pr-4 font-medium">Unit</th>
                    <th className="pb-3 pr-4 font-medium">Confidence</th>
                    <th className="pb-3 pr-4 font-medium">Source</th>
                    <th className="pb-3 font-medium">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {deltas.map((delta) => {
                    const deltaValue =
                      delta.improvedValue !== null
                        ? delta.improvedValue - delta.baselineValue
                        : null;
                    const deltaPercent =
                      deltaValue !== null && delta.baselineValue !== 0
                        ? ((deltaValue / delta.baselineValue) * 100).toFixed(1)
                        : null;

                    return (
                      <tr
                        key={delta.id}
                        className="border-b border-neutral-800/50 text-sm"
                      >
                        <td className="py-3 pr-4">
                          <span className="font-mono text-xs text-neutral-400">
                            {delta.engagementId || '—'}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          {delta.baselineValue.toFixed(2)}
                        </td>
                        <td className="py-3 pr-4">
                          {delta.improvedValue !== null
                            ? delta.improvedValue.toFixed(2)
                            : '—'}
                        </td>
                        <td className="py-3 pr-4">
                          {deltaValue !== null ? (
                            <span
                              className={
                                deltaValue > 0
                                  ? 'text-green-400'
                                  : deltaValue < 0
                                    ? 'text-red-400'
                                    : ''
                              }
                            >
                              {deltaValue > 0 ? '+' : ''}
                              {deltaValue.toFixed(2)}
                              {deltaPercent && ` (${deltaPercent}%)`}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="py-3 pr-4 text-neutral-400">
                          {delta.unit || '—'}
                        </td>
                        <td className="py-3 pr-4">
                          {delta.confidence !== null
                            ? `${(delta.confidence * 100).toFixed(0)}%`
                            : '—'}
                        </td>
                        <td className="py-3 pr-4 text-neutral-400">
                          {delta.source || '—'}
                        </td>
                        <td className="py-3 text-neutral-400">
                          {new Date(delta.updatedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {deltas.some((d) => d.notes) && (
              <div className="mt-6 border-t border-neutral-800 pt-6">
                <h3 className="mb-3 text-sm font-medium text-neutral-400">
                  Notes
                </h3>
                <div className="space-y-2">
                  {deltas
                    .filter((d) => d.notes)
                    .map((delta) => (
                      <div
                        key={delta.id}
                        className="rounded border border-neutral-800 bg-neutral-900/50 p-3 text-sm"
                      >
                        <span className="font-mono text-xs text-neutral-500">
                          {delta.engagementId || delta.id.slice(0, 8)}
                        </span>
                        <p className="mt-1 text-neutral-300">{delta.notes}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
