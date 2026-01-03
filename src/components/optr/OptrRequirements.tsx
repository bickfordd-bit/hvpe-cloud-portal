import type { Requirement } from '@/lib/optr/types';

export function OptrRequirements({ requirements }: { requirements: Requirement[] }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Requirements</div>
        <div className="text-xs text-neutral-400">{requirements.length} items</div>
      </div>

      <div className="mt-3 space-y-2">
        {requirements.length ? (
          requirements.map((r) => (
            <div key={r.id} className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs text-neutral-500">{(r as unknown).section || '—'}</div>
                <div className="text-xs uppercase tracking-widest text-neutral-400">
                  {(r as unknown).kind || r.priority}
                </div>
              </div>
              <div className="mt-2 text-sm text-neutral-100">{r.text}</div>
              <div className="mt-2 text-xs text-neutral-500">ID: {r.id}</div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6 text-center text-sm text-neutral-500">
            Run OPTR to populate requirements.
          </div>
        )}
      </div>
    </div>
  );
}
