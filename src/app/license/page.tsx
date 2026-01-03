"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Extract search params logic into a separate component
function LicenseForm() {
  const [key, setKey] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/";

  async function submit() {
    setErr(null);
    setLoading(true);

    try {
      const res = await fetch("/api/license/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });

      if (!res.ok) {
        setErr("Invalid license key.");
        setLoading(false);
        return;
      }

      // If Jake key, always send to /t/jake regardless of next
      if (key.trim() === "BICK-JAKE-LIFETIME-0001") {
        router.replace("/t/jake");
        return;
      }

      router.replace(next);
    } catch {
      setErr("Failed to validate license.");
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="w-full max-w-md p-8 bg-neutral-900 border border-neutral-800 rounded-lg">
        <h1 className="text-2xl font-bold text-white mb-6">
          Enter License Key
        </h1>

        <input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder="BICK-...."
          className="w-full px-4 py-3 bg-neutral-800 text-white border border-neutral-700 rounded-md focus:outline-none focus:border-neutral-500 mb-4"
          disabled={loading}
        />

        <button
          onClick={submit}
          disabled={loading}
          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-700 text-white font-medium rounded-md transition-colors"
        >
          {loading ? "Validating..." : "Continue"}
        </button>

        {err && <p className="mt-4 text-red-500 text-sm">{err}</p>}
      </div>
    </div>
  );
}

export default function LicensePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-black">
          <div className="text-white">Loading...</div>
        </div>
      }
    >
      <LicenseForm />
    </Suspense>
  );
}
