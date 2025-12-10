"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";

export default function PacketsPage() {
  return (
    <AppShell>
      <div className="space-y-4">
        <Card>
          <div className="text-xs uppercase tracking-[0.24em] text-neutral-500">
            Trade Packets
          </div>
          <p className="mt-3 text-[11px] text-neutral-300">
            Dedicated space for monitoring HVPE packet dispatch, arbitration
            loops, and signal batching. Swap in real-time packet data from the
            trader backend when ready.
          </p>
        </Card>

        <Card>
          <div className="text-[11px] text-neutral-300">
            Consider plotting incoming packet latency, arbitration decisions, and
            quota usage here, then feed the same data into the console commands so
            this view becomes the “packet cockpit.”
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
