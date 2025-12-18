import { getSession } from "@/lib/licenseSession.crypto";
import { redirect } from "next/navigation";

/**
 * Jake Build: Observational mode.
 * 
 * Canonical Jake UI:
 * - One sentence about purpose
 * - One status indicator
 * - One visual (optional)
 * - One action (observe, optional)
 * 
 * NO metrics, NO charts, NO complexity.
 * Jake controls intent. System preserves it.
 */
export default async function JakePage() {
  const session = await getSession();

  // Enforce role
  if (!session || session.role !== "JAKE") {
    redirect("/license?next=/t/jake");
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      <div style={{ maxWidth: 600 }}>
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4">Decision Continuity</h1>
          <p className="text-xl text-neutral-400 leading-relaxed">
            This environment preserves the intent of approved decisions
            so outcomes compound instead of resetting over time.
          </p>
        </div>

        {/* Status */}
        <div className="border border-neutral-700 rounded-lg p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-sm uppercase tracking-wider text-neutral-400">Active</span>
          </div>
          <p className="text-neutral-300">Observational mode. No integrations. No workflow changes.</p>
        </div>

        {/* Details */}
        <div className="text-sm text-neutral-500 space-y-1">
          <p>Role: {session.role}</p>
          <p>Mode: {session.mode}</p>
          <p>Tenant: {session.tenant}</p>
        </div>
      </div>
    </main>
  );
}
