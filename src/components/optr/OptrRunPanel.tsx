"use client";

import { useState } from "react";

export function OptrRunPanel(props: {
  onRun: () => Promise<void> | void;
  onRefresh: () => Promise<void> | void;
  packageUrl: string | null;
}) {
  const [busy, setBusy] = useState(false);

  async function doRun() {
    setBusy(true);
    try {
      await props.onRun();
    } finally {
      setBusy(false);
    }
  }

  async function doRefresh() {
    setBusy(true);
    try {
      await props.onRefresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
      <div className="text-sm font-semibold">Run</div>
      <div className="mt-1 text-sm text-neutral-400">
        Execute OPTR pipeline: ingest → decompose → map → validate → optimize → package.
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          disabled={busy}
          onClick={doRun}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-500 disabled:opacity-50"
        >
          Run OPTR
        </button>
        <button
          disabled={busy}
          onClick={doRefresh}
          className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm hover:bg-neutral-800 disabled:opacity-50"
        >
          Refresh Status
        </button>
      </div>

      <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950 p-3 text-sm">
        <div className="text-neutral-400">Package</div>
        {props.packageUrl ? (
          <a
            className="mt-1 inline-block text-emerald-400 hover:underline"
            href={props.packageUrl}
            target="_blank"
          >
            Download package
          </a>
        ) : (
          <div className="mt-1 text-neutral-500">No package emitted yet.</div>
        )}
      </div>
    </div>
  );
}
