// Timestamp: 2025-12-19T11:02:00-05:00
// Bickford Guardrails: Master invariant enforcement

/**
 * Asserts that any object claiming authority MUST have a timestamp.
 * This is the core Bickford invariant: untimestamped authority = invalid.
 */
export function assertTimestampedAuthority(obj: any, path = "root"): void {
  if (!obj || typeof obj !== "object") return;

  // If something claims authority, it must have ts
  if (
    obj.authoritative === true ||
    obj.kind === "guardrail" ||
    obj.kind === "policy" ||
    obj.kind === "intent" ||
    obj.mode === "BICKFORD"
  ) {
    if (!obj.ts || typeof obj.ts !== "string") {
      throw new Error(
        `BICKFORD_GUARDRAIL: Missing ts for authoritative object at ${path}`
      );
    }

    // Validate ISO 8601 format
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
    if (!isoRegex.test(obj.ts)) {
      throw new Error(
        `BICKFORD_GUARDRAIL: Invalid timestamp format at ${path}: ${obj.ts}`
      );
    }
  }

  // Recurse into nested objects
  for (const [k, v] of Object.entries(obj)) {
    if (v && typeof v === "object") {
      assertTimestampedAuthority(v, `${path}.${k}`);
    }
  }
}

/**
 * Validates that a decision/action has all required Bickford fields.
 */
export interface BickfordDecision {
  ts: string;
  kind: "intent" | "plan" | "action" | "observe" | "persist" | "guardrail";
  subject: string;
  payload: any;
  hash?: string;
  parentId?: string;
}

export function validateDecision(decision: any): decision is BickfordDecision {
  if (!decision.ts || typeof decision.ts !== "string") {
    throw new Error("BICKFORD_GUARDRAIL: Decision missing ts");
  }
  if (!decision.kind || typeof decision.kind !== "string") {
    throw new Error("BICKFORD_GUARDRAIL: Decision missing kind");
  }
  if (!decision.subject || typeof decision.subject !== "string") {
    throw new Error("BICKFORD_GUARDRAIL: Decision missing subject");
  }
  if (decision.payload === undefined) {
    throw new Error("BICKFORD_GUARDRAIL: Decision missing payload");
  }
  return true;
}

/**
 * OPTR T2V check: Does this action maximize value per unit time?
 * Simple heuristic: reject actions that require new user behavior without strong justification.
 */
export function checkOPTR_TTV(action: any): { approved: boolean; reason: string } {
  if (action.requiresNewUserBehavior && !action.ttv_justification) {
    return {
      approved: false,
      reason: "OPTR T2V: Action requires new user behavior without T2V justification (90% rule)"
    };
  }
  return { approved: true, reason: "T2V check passed" };
}
