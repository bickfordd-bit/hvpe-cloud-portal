import Link from "next/link";

export default function OPTRDashboard() {
  return (
    <div className="min-h-screen bg-black px-8 py-8 text-white">
      <h1 className="mb-6 text-3xl font-semibold">OPTR – BIC Opportunity Engine</h1>

      <div className="space-y-4">
        <Link href="/dashboard/optr/scanner" className="block">
          <div className="cursor-pointer rounded-xl border border-neutral-800 p-4 hover:bg-neutral-900">
            <h2 className="text-xl font-medium">Opportunity Scanner</h2>
            <p className="text-sm text-neutral-400">
              Pull active DoD and federal opportunities. Real-time readiness scoring.
            </p>
          </div>
        </Link>

        <Link href="/dashboard/optr/submissions" className="block">
          <div className="cursor-pointer rounded-xl border border-neutral-800 p-4 hover:bg-neutral-900">
            <h2 className="text-xl font-medium">Submissions</h2>
            <p className="text-sm text-neutral-400">
              See all OPTR-generated PDFs, readiness states, and submission history.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
