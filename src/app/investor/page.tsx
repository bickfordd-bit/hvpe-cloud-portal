"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";

export default function InvestorPage() {
  return (
    <AppShell>
      <div className="space-y-4">
        <Card>
          <div className="text-xs uppercase tracking-[0.24em] text-neutral-500">
            Investor View
          </div>
          <p className="mt-3 text-[11px] text-neutral-300">
            Placeholder layout for investor communications, performance snapshots,
            and invite-only overlays. Wire this to your wealth dashboards, KYC
            insights, and automated investor alerts once the backend is ready.
          </p>
        </Card>

        <Card>
          <div className="text-neutral-300 text-[11px]">
            Add real investor-facing data here (allocations, NAV, audit trails),
            then point the page at the same FastAPI backend powering the trading
            windows.
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
