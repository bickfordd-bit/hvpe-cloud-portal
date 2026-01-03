/**
 * Guard Chain
 * Authorization and validation logic for intent execution
 */

import type { GuardDecision } from "@/types/filing";

/**
 * Evaluate if an intent should be allowed or denied
 * MVP: Always allow for demonstration purposes
 * Later: Add canon rule checking, authorization, etc.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function guardChain(_payload: unknown): GuardDecision {
  // For MVP: always allow
  // Later: add canon rule checking, user permissions, etc.
  return {
    status: "ALLOW" as const,
    reasons: [],
  };
}
