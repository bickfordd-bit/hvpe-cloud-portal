import type { OPTRState } from "@/lib/optr/types";

function pct(n?: number) {
  if (typeof n !== "number" || Number.isNaN(n)) return "—";
  return `${Math.round(n * 100)}%`;
}

function money(n?: number) {
  if (typeof n !== "number" || Number.isNaN(n)) return "—";
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function barWidth01(v?: number) {
  const x = typeof v === "number" ? Math.max(0, Math.min(1, v)) : 0;
  return `${Math.round(x * 100)}%`;
}

export function OptrStatusPanel({ state }: { state: OPTRState | null }) {
  const coverage = state?.coverage ?? 0;

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Status</div>
        <div className="text-xs text-neutral-400">
          Phase: <span className="text-neutral-100">{state?.phase ?? "—"}</span>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-400">Coverage</span>
          <span className="font-medium">{pct(coverage)}</span>
        </div>
        <div className="mt-2 h-3 w-full rounded-full bg-neutral-950">
          <div className="h-3 rounded-full bg-emerald-600" style={{ width: barWidth01(coverage) }} />
        </div>
        <div className="mt-2 text-xs text-neutral-500">
          SubmitAllowed ⇔ Coverage = 100% and mandatory docs present.
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
          <div className="text-xs text-neutral-400">Blocked</div>
          <div className="mt-1 text-sm font-semibold">
            {state ? (state.blocked ? "YES" : "NO") : "—"}
          </div>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
          <div className="text-xs text-neutral-400">Win Prob</div>
          <div className="mt-1 text-sm font-semibold">{pct(state?.win_prob)}</div>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
          <div className="text-xs text-neutral-400">ECV</div>
          <div className="mt-1 text-sm font-semibold">{money(state?.ecv)}</div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950 p-3">
        <div className="text-sm font-semibold">Blockers</div>
        {state?.blockers?.length ? (
          <div className="mt-2 space-y-2">
            {state.blockers.map((b, i) => (
              <div key={i} className="rounded-lg border border-red-900 bg-red-950/30 p-2 text-sm">
                <div className="text-red-200">{b.code || "BLOCKER"}</div>
                <div className="text-red-100/80">{b.detail || ""}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-2 text-sm text-neutral-500">No blockers reported.</div>
        )}
      </div>
    </div>
  );
}
