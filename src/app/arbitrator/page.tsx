"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";

export default function ArbitratorPage() {
  return (
    <AppShell>
      <div className="space-y-4">
        <Card>
          <div className="text-xs uppercase tracking-[0.24em] text-neutral-500">
            Arbitrator Console
          </div>
          <p className="mt-3 text-[11px] text-neutral-300">
            Visualize arbitration state, alerts, and override controls here. Once
            you stream arbitration metadata from the FastAPI or HVPE services,
            replace this placeholder with the actual signal state machine.
          </p>
        </Card>

        <Card>
          <div className="text-[11px] text-neutral-300">
            Show conflict resolution, arbitration timers, and manual controls
            (pause/resume/steer) once the backend exposes them.
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
