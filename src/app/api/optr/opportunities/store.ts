import type { Opportunity } from "@/lib/optr/types";

const store: Opportunity[] = [];

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
