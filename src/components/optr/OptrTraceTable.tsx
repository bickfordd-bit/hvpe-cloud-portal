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
              <th className="px-3 py-2">Req</th>
              <th className="px-3 py-2">Response</th>
              <th className="px-3 py-2">Excerpt</th>
              <th className="px-3 py-2">Confidence</th>
              <th className="px-3 py-2">Gaps</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {traces.length ? (
              traces.map((t, i) => (
                <tr key={i} className="align-top hover:bg-neutral-900/40">
                  <td className="px-3 py-2 font-mono text-xs text-neutral-300">{t.req_id}</td>
                  <td className="px-3 py-2 font-mono text-xs text-neutral-300">{t.response_id}</td>
                  <td className="px-3 py-2 text-xs text-neutral-300 max-w-[28rem]">
                    {t.evidence_snippets && t.evidence_snippets.length ? (
                      <div className="text-xs text-neutral-300 line-clamp-3">{t.evidence_snippets[0]}</div>
                    ) : (
                      <span className="text-xs text-neutral-500">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2">{pct(t.confidence)}</td>
                  <td className="px-3 py-2 text-neutral-300">
                    {t.gaps.length ? (
                      <ul className="space-y-1">
                        {t.gaps.map((g, idx) => {
                          const isCritical = g.includes('Critical:');
                          const isUrgent = g.includes('Urgent') || g.includes('immediate');
                          const isHighPriority = g.includes('High-priority') || g.includes('Mandatory');
                          
                          let gapClass = "text-xs ";
                          if (isCritical) gapClass += "text-red-400 font-medium";
                          else if (isUrgent) gapClass += "text-orange-400";
                          else if (isHighPriority) gapClass += "text-yellow-400";
                          else gapClass += "text-neutral-400";
                          
                          return (
                            <li key={idx} className={gapClass}>
                              • {g}
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <span className="text-xs text-green-400">✓ No gaps identified</span>
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
