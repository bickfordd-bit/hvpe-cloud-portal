import type { OPTRState } from '@/lib/optr/types';

function pct(n?: number) {
  if (typeof n !== 'number' || Number.isNaN(n)) return '—';
  return `${Math.round(n * 100)}%`;
}

function money(n?: number) {
  if (typeof n !== 'number' || Number.isNaN(n)) return '—';
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
}

function barWidth01(v?: number) {
  const x = typeof v === 'number' ? Math.max(0, Math.min(1, v)) : 0;
  return `${Math.round(x * 100)}%`;
}

export function OptrStatusPanel({ state }: { state: OPTRState | null }) {
  const coverage = (state as unknown)?.coverage ?? 0;

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Status</div>
        <div className="text-xs text-neutral-400">
          Stage: <span className="text-neutral-100">{state?.stage ?? '—'}</span>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-400">Progress</span>
          <span className="font-medium">{state?.progress ?? 0}%</span>
        </div>
        <div className="mt-2 h-3 w-full rounded-full bg-neutral-950">
          <div
            className="h-3 rounded-full bg-emerald-600"
            style={{ width: `${state?.progress ?? 0}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-neutral-500">
          {state?.message || 'Waiting for execution...'}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
          <div className="text-xs text-neutral-400">Stage</div>
          <div className="mt-1 text-sm font-semibold">{state?.stage ?? 'idle'}</div>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
          <div className="text-xs text-neutral-400">Progress</div>
          <div className="mt-1 text-sm font-semibold">{state?.progress ?? 0}%</div>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
          <div className="text-xs text-neutral-400">Status</div>
          <div className="mt-1 text-sm font-semibold">{state?.stage ?? 'idle'}</div>
        </div>
      </div>

      {state?.message && (
        <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950 p-3">
          <div className="text-sm font-semibold">Message</div>
          <div className="mt-2 text-sm text-neutral-400">{state.message}</div>
        </div>
      )}
    </div>
  );
}
