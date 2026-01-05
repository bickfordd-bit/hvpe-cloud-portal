import { IntentPanel } from "@/components/intent/IntentPanel";

/**
 * Billy Build: Trading-focused execution.
 *
 * Billy sees: Account | Invest | Positions
 * Separate mental model from Jake.
 * Focus on portfolio state and transaction flow.
 *
 * NOTE: This page uses server-side session checks (Next.js only).
 * For native app, implement client-side auth context instead.
 */
export default async function BillyPage() {
  // TODO: Replace with client-side auth check for native app
  // const session = await getSession();
  // if (!session || session.role !== "BILLY") {
  //   redirect("/license?next=/t/billy");
  // }

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-b border-neutral-800 px-6 py-4">
        <h1 className="text-2xl font-bold">Portfolio</h1>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        {/* Intent Panel */}
        <IntentPanel />

        {/* Trading Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Account Section */}
          <section className="border border-neutral-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Account</h2>
            <div className="space-y-3 text-sm text-neutral-400">
              <div>
                <p className="text-xs uppercase tracking-wider text-neutral-500">
                  Balance
                </p>
                <p className="text-2xl font-bold text-white mt-1">$0.00</p>
              </div>
              <div className="pt-3 border-t border-neutral-700">
                <p className="text-xs uppercase tracking-wider text-neutral-500">
                  Role
                </p>
                <p className="text-white mt-1">BILLY</p>
              </div>
            </div>
          </section>

          {/* Invest Section */}
          <section className="border border-neutral-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Invest</h2>
            <div className="space-y-3 text-sm text-neutral-400">
              <div>
                <p className="text-xs uppercase tracking-wider text-neutral-500">
                  Opportunities
                </p>
                <p className="text-2xl font-bold text-white mt-1">0</p>
              </div>
              <div className="pt-3 border-t border-neutral-700">
                <p className="text-xs uppercase tracking-wider text-neutral-500">
                  Status
                </p>
                <p className="text-yellow-400 mt-1">Ready to evaluate</p>
              </div>
            </div>
          </section>

          {/* Positions Section */}
          <section className="border border-neutral-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Positions</h2>
            <div className="space-y-3 text-sm text-neutral-400">
              <div>
                <p className="text-xs uppercase tracking-wider text-neutral-500">
                  Active
                </p>
                <p className="text-2xl font-bold text-white mt-1">0</p>
              </div>
              <div className="pt-3 border-t border-neutral-700">
                <p className="text-xs uppercase tracking-wider text-neutral-500">
                  P&L
                </p>
                <p className="text-neutral-400 mt-1">—</p>
              </div>
            </div>
          </section>
        </div>

        {/* Details */}
        <footer className="border-t border-neutral-800 px-6 py-4 text-xs text-neutral-500 mt-12">
          <p>Mode: Trading</p>
        </footer>
      </div>
    </main>
  );
}
