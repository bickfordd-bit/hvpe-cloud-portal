"use client";

import { useEffect, useState } from "react";

export default function OPTRWorkspace({ params }: { params: { id: string } }) {
  const [opp, setOpp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/optr/opportunity?id=${params.id}`);
        if (!res.ok) throw new Error("Failed to load opportunity");
        const data = await res.json();
        setOpp(data);
      } catch (err: any) {
        console.error(err);
        setError(err?.message || "Failed to load opportunity");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  if (loading) {
    return <div className="p-8 text-white">Loading opportunity…</div>;
  }

  if (error || !opp) {
    return (
      <div className="min-h-screen bg-black px-8 py-8 text-white">
        <p className="text-red-400">Could not load opportunity.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-8 py-8 text-white">
      <h1 className="mb-4 text-3xl">{opp.title}</h1>
      <p className="mb-6 text-sm text-neutral-400">{opp.agency}</p>

      <div className="space-y-4 rounded-xl border border-neutral-800 p-6">
        <p>Response Date: {opp.responseDate}</p>

        <div>
          <p className="text-sm text-neutral-400">OPTR Status:</p>
          <p className="text-xl">{opp.status}</p>
        </div>

        <button
          className="mt-4 rounded-full bg-white px-6 py-2 text-black"
          onClick={async () => {
            const res = await fetch("/api/optr/submit", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: params.id })
            });
            const out = await res.json();
            alert("Submission generated: " + out.pdfUrl);
          }}
        >
          Generate Submission PDF
        </button>
      </div>
    </div>
  );
}
