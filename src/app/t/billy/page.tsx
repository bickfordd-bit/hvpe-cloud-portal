import { IntentPanel } from "@/components/intent/IntentPanel";
import { AlpacaConnect } from "@/components/alpaca/AlpacaConnect";
import { AlpacaDashboard } from "@/components/alpaca/AlpacaDashboard";
import { BickfordChat } from "@/components/bickford/BickfordChat";

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
        <h1 className="text-2xl font-bold">Billy's Portfolio</h1>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Alpaca Connection */}
        <AlpacaConnect />

        {/* Portfolio Dashboard */}
        <AlpacaDashboard />

        {/* Bickford Chat */}
        <BickfordChat />
      </div>
    </main>
  );
}
