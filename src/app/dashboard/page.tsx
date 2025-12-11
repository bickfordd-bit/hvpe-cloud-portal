import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "optr";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  let email = "Unknown";
  let role = "user";

  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      email = parsed.email || email;
      role = parsed.role || role;
    } catch {
      // ignore parse errors
    }
  }

  return (
    <div className="min-h-screen bg-black px-8 py-8 text-white">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-xl font-semibold">HVPE / OPTR Dashboard</h1>
        <form action="/api/logout" method="POST">
          <button className="rounded-full border border-neutral-700 px-4 py-1 text-sm">
            Sign out
          </button>
        </form>
      </header>

      <p className="mb-2 text-sm text-neutral-400">
        Signed in as <span className="font-mono">{email}</span> ({role})
      </p>

      <div className="mt-6 rounded-2xl border border-neutral-800 p-6">
        <h2 className="mb-2 text-lg font-medium">Welcome to OPTR</h2>
        <p className="text-sm text-neutral-300">
          This is the protected core. From here we can drop in chat, OPTR status, DoD bids,
          HVPE panes — whatever you want.
        </p>
      </div>
    </div>
  );
}
