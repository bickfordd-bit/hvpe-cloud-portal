import { loadLockSpec } from '@/lib/lock/spec';

export type T2VInput = {
  V: number; // value_committed_usd
  T0: number; // planned_time_to_value (same unit as deltaT)
  deltaT: number; // delay_due_to_decay
  Ch: number; // fully_loaded_hourly_cost
  H: number; // rework_hours
  R: number; // escalation_or_risk_cost
};

export type T2VResult = {
  total: number;
  components: {
    value_decay: number;
    rework_cost: number;
    risk_cost: number;
  };
};

/**
 * Compute T2V$ (dollarized time-to-value) using the locked formula.
 * Fails closed if formula drifts from spec.
 *
 * Formula: T2V$ = (V / T0) * ΔT + Ch * H + R
 */
export function t2vDollar(input: T2VInput): T2VResult {
  const { spec } = loadLockSpec();

  // Hard bind: formula identity check (fail closed if drifted)
  const expectedFormula = 'T2V$ = (V / T0) * ΔT + Ch * H + R';
  const specFormula = (spec.optr_t2v as { formula?: string } | undefined)?.formula;
  if (specFormula !== expectedFormula) {
    throw new Error(
      `LOCK violation: OPTR/T2V formula drift. Expected "${expectedFormula}", got "${specFormula}"`
    );
  }

  const { V, T0, deltaT, Ch, H, R } = input;

  // Input validation
  if (![V, T0, deltaT, Ch, H, R].every((n) => Number.isFinite(n) && n >= 0)) {
    throw new Error('Invalid T2V input: all values must be finite and non-negative');
  }
  if (T0 <= 0) {
    throw new Error('T0 (planned_time_to_value) must be > 0');
  }

  // Compute components
  const value_decay = (V / T0) * deltaT;
  const rework_cost = Ch * H;
  const risk_cost = R;

  const total = value_decay + rework_cost + risk_cost;

  return {
    total,
    components: {
      value_decay,
      rework_cost,
      risk_cost,
    },
  };
}

/**
 * Compute ΔT2V$ (delta T2V) between two paths to measure optimization.
 * Positive value means path2 is better (lower cost).
 */
export function deltaT2V(path1: T2VInput, path2: T2VInput): number {
  const result1 = t2vDollar(path1);
  const result2 = t2vDollar(path2);
  return result1.total - result2.total; // Positive if path2 is cheaper
}

/**
 * Score a list of paths by T2V$ (ascending = better).
 * Returns paths sorted by T2V$ with their scores.
 */
export function scorePaths(
  paths: Array<{ id: string; input: T2VInput }>
): Array<{ id: string; t2v_dollars: number; rank: number }> {
  const scored = paths.map(({ id, input }) => ({
    id,
    t2v_dollars: t2vDollar(input).total,
  }));

  // Sort ascending (lowest cost first)
  scored.sort((a, b) => a.t2v_dollars - b.t2v_dollars);

  // Add rank
  return scored.map((item, index) => ({
    ...item,
    rank: index + 1,
  }));
}
