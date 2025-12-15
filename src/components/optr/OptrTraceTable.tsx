import type { Trace } from "@/lib/optr/types";

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
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Message</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {traces.length ? (
              traces.map((t, i) => (
                <tr key={i} className="align-top hover:bg-neutral-900/40">
                  <td className="px-3 py-2 font-mono text-xs text-neutral-300">
                    {new Date(t.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="px-3 py-2 text-xs text-neutral-300">{t.stage}</td>
                  <td className="px-3 py-2 text-xs">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                      t.status === 'completed' ? 'bg-green-900/30 text-green-300' :
                      t.status === 'started' ? 'bg-blue-900/30 text-blue-300' :
                      'bg-red-900/30 text-red-300'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-neutral-300 max-w-[28rem]">
                    {t.message || '—'}
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
