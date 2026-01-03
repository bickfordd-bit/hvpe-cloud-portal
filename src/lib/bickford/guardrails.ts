// Timestamp: 2025-12-19T11:02:00-05:00
// Bickford Guardrails: Master invariant enforcement

/**
 * Asserts that any object claiming authority MUST have a timestamp.
 * This is the core Bickford invariant: untimestamped authority = invalid.
 */
export function assertTimestampedAuthority(obj: unknown, path = 'root'): void {
  if (!obj || typeof obj !== 'object') return;

  const record = obj as Record<string, unknown>;

  // If something claims authority, it must have ts
  if (
    record.authoritative === true ||
    record.kind === 'guardrail' ||
    record.kind === 'policy' ||
    record.kind === 'intent' ||
    record.mode === 'BICKFORD'
  ) {
    if (!record.ts || typeof record.ts !== 'string') {
      throw new Error(`BICKFORD_GUARDRAIL: Missing ts for authoritative object at ${path}`);
    }

    // Validate ISO 8601 format
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
    if (!isoRegex.test(record.ts)) {
      throw new Error(`BICKFORD_GUARDRAIL: Invalid timestamp format at ${path}: ${record.ts}`);
    }
  }

  // Recurse into nested objects
  for (const [k, v] of Object.entries(obj)) {
    if (v && typeof v === 'object') {
      assertTimestampedAuthority(v, `${path}.${k}`);
    }
  }
}

/**
 * Validates that a decision/action has all required Bickford fields.
 */
export interface BickfordDecision {
  ts: string;
  kind: 'intent' | 'plan' | 'action' | 'observe' | 'persist' | 'guardrail';
  subject: string;
  payload: unknown;
  hash?: string;
  parentId?: string;
}

export function validateDecision(decision: unknown): decision is BickfordDecision {
  if (!decision || typeof decision !== 'object') {
    throw new Error('BICKFORD_GUARDRAIL: Decision must be an object');
  }

  const record = decision as Record<string, unknown>;

  if (!record.ts || typeof record.ts !== 'string') {
    throw new Error('BICKFORD_GUARDRAIL: Decision missing ts');
  }
  if (!record.kind || typeof record.kind !== 'string') {
    throw new Error('BICKFORD_GUARDRAIL: Decision missing kind');
  }
  if (!record.subject || typeof record.subject !== 'string') {
    throw new Error('BICKFORD_GUARDRAIL: Decision missing subject');
  }
  if (record.payload === undefined) {
    throw new Error('BICKFORD_GUARDRAIL: Decision missing payload');
  }
  return true;
}

/**
 * OPTR T2V check: Does this action maximize value per unit time?
 * Simple heuristic: reject actions that require new user behavior without strong justification.
 */
export function checkOPTR_TTV(action: unknown): { approved: boolean; reason: string } {
  if (!action || typeof action !== 'object') {
    return { approved: true, reason: 'T2V check passed (no action data)' };
  }

  const record = action as Record<string, unknown>;

  if (record.requiresNewUserBehavior && !record.ttv_justification) {
    return {
      approved: false,
      reason: 'OPTR T2V: Action requires new user behavior without T2V justification (90% rule)',
    };
  }
  return { approved: true, reason: 'T2V check passed' };
}
