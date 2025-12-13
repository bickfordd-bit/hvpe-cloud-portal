import type { Opportunity } from "@/lib/optr/types";

const demo: Opportunity = {
  id: "demo-oppty-1",
  source: "internal-demo",
  title: "Demo Opportunity — Autonomous Risk Tracker",
  agency: "Example Agency",
  deadline_iso: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
  links: ["https://example.com/demo-doc.txt"],
  documents: [
    {
      id: "doc-1",
      type: "text",
      sha256: "",
      filename: "demo-doc.txt"
    }
  ]
};

const store: Opportunity[] = [demo];

export function getOpportunity(id: string) {
  return store.find((o) => o.id === id);
}

export function upsertOpportunity(oppty: Opportunity) {
  const existing = store.find((o) => o.id === oppty.id);
  if (existing) {
    Object.assign(existing, oppty);
    return existing;
  }
  store.unshift(oppty);
  return oppty;
}

export function listOpportunities() {
  return store;
}
