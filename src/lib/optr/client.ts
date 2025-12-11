import type { Opportunity, OPTRState, RunResult } from "./types";

async function j<T>(url: string, init: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
    cache: "no-store"
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}${text ? ` — ${text}` : ""}`);
  }
  return (await res.json()) as T;
}

export const optrClient = {
  list: async (): Promise<Opportunity[]> =>
    j("/api/optr/opportunities", { method: "GET" }),

  create: async (oppty: Opportunity): Promise<Opportunity> =>
    j("/api/optr/opportunities", { method: "POST", body: JSON.stringify(oppty) }),

  status: async (id: string): Promise<OPTRState> =>
    j(`/api/optr/opportunities/${encodeURIComponent(id)}/status`, { method: "GET" }),

  run: async (id: string): Promise<RunResult> =>
    j(`/api/optr/opportunities/${encodeURIComponent(id)}/run`, { method: "POST" })
};
