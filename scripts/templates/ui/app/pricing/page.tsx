import Link from "next/link";

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-4">HVPE Pricing</h1>
          <p className="text-gray-300 max-w-2xl">
            Choose the plan that fits your trading journey. Both plans are powered
            by the same core HVPE engine.
          </p>
        </header>

        <section className="grid gap-8 md:grid-cols-2">
          <div className="border border-gray-700 rounded-xl p-6 bg-gradient-to-b from-gray-900 to-black">
            <h2 className="text-2xl font-semibold mb-2">Founding Trader</h2>
            <p className="text-gray-400 mb-4">
              For individual traders who want to put HVPE to work with minimal
              setup.
            </p>
            <p className="text-3xl font-bold mb-4">
              $497
              <span className="text-lg font-normal text-gray-400"> / month</span>
            </p>
            <ul className="space-y-2 text-sm text-gray-300 mb-6">
              <li>✔ Access to HVPE Core Engine</li>
              <li>✔ Daily intelligent trade packets</li>
              <li>✔ Live Mode (manual-approval)</li>
              <li>✔ Aggressive &amp; conservative profiles</li>
              <li>✔ Basic profit vault routing</li>
              <li>✔ License Portal activation</li>
            </ul>
            <form action="/api/checkout_sessions" method="POST">
              <input type="hidden" name="plan" value="FOUNDING_MONTHLY" />
              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-white text-black font-semibold hover:bg-gray-200 transition"
              >
                Get Started
              </button>
            </form>
          </div>

          <div className="border border-yellow-500 rounded-xl p-6 bg-gradient-to-b from-yellow-900/20 to-black relative">
            <div className="absolute top-4 right-4 text-xs bg-yellow-500 text-black px-2 py-1 rounded-full">
              Most Popular
            </div>
            <h2 className="text-2xl font-semibold mb-2">Pro Trader</h2>
            <p className="text-gray-300 mb-4">
              For serious traders and small teams who want the full HVPE brain.
            </p>
            <p className="text-3xl font-bold mb-1">
              $1,497
              <span className="text-lg font-normal text-gray-400"> / month</span>
            </p>
            <p className="text-sm text-gray-400 mb-4">or $9,997 / year</p>
            <ul className="space-y-2 text-sm text-gray-200 mb-6">
              <li>✔ Everything in Founding Trader</li>
              <li>✔ Full HVPE Intelligence Stack (CIE + WAGL + GIL)</li>
              <li>✔ Limitless Mode &amp; Dynasty Mode controls</li>
              <li>✔ Advanced risk routing &amp; vaults</li>
              <li>✔ Priority updates &amp; support</li>
              <li>✔ Access to private HVPE group</li>
            </ul>
            <form action="/api/checkout_sessions" method="POST" className="space-y-2">
              <input type="hidden" name="plan" value="PRO_MONTHLY" />
              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-400 transition"
              >
                Get Pro – Monthly
              </button>
            </form>
            <form action="/api/checkout_sessions" method="POST" className="mt-2">
              <input type="hidden" name="plan" value="PRO_YEARLY" />
              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-transparent border border-yellow-500 text-yellow-500 font-semibold hover:bg-yellow-500/10 transition"
              >
                Get Pro – Yearly
              </button>
            </form>
          </div>
        </section>

        <footer className="mt-12 text-sm text-gray-500">
          <p>
            HVPE is an advanced trading intelligence system. Trading involves risk.
            No guarantees of profit are made.
          </p>
          <p className="mt-2">
            By subscribing you agree to our{" "}
            <Link href="/terms">
              <span className="underline hover:text-gray-300 cursor-pointer">
                Terms of Use
              </span>
            </Link>{" "}
            and{" "}
            <Link href="/risk-disclosure">
              <span className="underline hover:text-gray-300 cursor-pointer">
                Risk Disclosure
              </span>
            </Link>
            .
          </p>
        </footer>
      </div>
    </main>
  );
}
