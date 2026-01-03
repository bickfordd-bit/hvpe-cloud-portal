import type { Trace } from "@/lib/optr/types";

function pct(n: number) {
  return `${Math.round(n * 100)}%`;
}

export function OptrTraceTable({ traces }: { traces: Trace[] }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Traceability</div>
        <div className="text-xs text-neutral-400">{traces.length} traces</div>
      </div>

      <div className="mt-3 overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-800 text-xs text-neutral-400">
            <tr>
              <th className="px-3 py-2">Timestamp</th>
              <th className="px-3 py-2">Stage</th>
              <th className="px-3 py-2">Message</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {traces.length ? (
              traces.map((t, i) => (
                <tr key={i} className="align-top hover:bg-neutral-900/40">
                  <td className="px-3 py-2 font-mono text-xs text-neutral-300">{t.timestamp}</td>
                  <td className="px-3 py-2 font-mono text-xs text-neutral-300">{t.stage}</td>
                  <td className="px-3 py-2 text-xs text-neutral-300 max-w-[28rem]">
                    <div className="text-xs text-neutral-300 line-clamp-3">{t.message}</div>
                  </td>
                  <td className="px-3 py-2">{t.status}</td>
                  <td className="px-3 py-2 text-neutral-300">
                    {t.metadata ? (
                      <div className="text-xs text-neutral-400">
                        {JSON.stringify(t.metadata).substring(0, 50)}...
                      </div>
                    ) : (
                      <span className="text-xs text-neutral-500">—</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-sm text-neutral-500">
                  Run OPTR to populate traceability.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
