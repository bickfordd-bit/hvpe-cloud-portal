"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";

export default function LicensePage() {
  return (
    <AppShell>
      <div className="space-y-4">
        <Card>
          <div className="text-xs uppercase tracking-[0.24em] text-neutral-500">
            Licensing & Billing
          </div>
          <p className="mt-3 text-[11px] text-neutral-300">
            Surface subscription details, renewal schedules, and compliance
            documents here. Hook into the HVPE trader / finance engine to show
            invoice history, usage credits, and license metrics.
          </p>
        </Card>

        <Card>
          <ul className="space-y-2 text-[11px] text-neutral-300">
            <li>• License status: Live tier, {new Date().getFullYear()}</li>
            <li>• Renewal ETA: Q2</li>
            <li>• Compliance checklist: awaiting completion</li>
          </ul>
        </Card>
      </div>
    </AppShell>
  );
}
