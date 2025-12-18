"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type JakeClaims = {
  key: string;
  role: string;
  mode: string;
  tenant: string;
  readOnly: boolean;
};

export default function JakePage() {
  const [claims, setClaims] = useState<JakeClaims | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const verifyClaims = async () => {
      try {
        const res = await fetch("/api/license/jake/verify");
        if (!res.ok) {
          router.push("/license?next=/t/jake");
          return;
        }
        const data = await res.json();
        setClaims(data.claims);
      } catch {
        router.push("/license?next=/t/jake");
      } finally {
        setLoading(false);
      }
    };

    verifyClaims();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-neutral-400">Verifying access...</div>
      </div>
    );
  }

  if (!claims) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-500">Access denied.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-4">Jake Build</h1>
        <p className="text-lg text-neutral-300 mb-6">
          Mode: <code className="bg-neutral-900 px-2 py-1 rounded">{claims.mode}</code> · 
          Read-only evaluation environment
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-3">Environment</h2>
            <ul className="text-neutral-300 text-sm space-y-2">
              <li>• Role: {claims.role}</li>
              <li>• Tier: LIFETIME</li>
              <li>• Tenant: {claims.tenant}</li>
              <li>• Read-only: {claims.readOnly ? "enabled" : "disabled"}</li>
            </ul>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-3">Status</h2>
            <ul className="text-neutral-300 text-sm space-y-2">
              <li>✅ License validated</li>
              <li>✅ Session active</li>
              <li>✅ Protected route accessible</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 bg-blue-900 bg-opacity-20 border border-blue-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-blue-200 mb-3">Jake Features</h2>
          <p className="text-neutral-300">
            This is your Jake Build instance. Customize the UI and features above based on your requirements.
          </p>
        </div>
      </div>
    </div>
  );
}
