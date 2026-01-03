/**
 * OPTR Math Engine
 * Optimal Path to Realization - Time-to-Value computation
 */

import type { OPTRState, OPTRMetrics } from "@/types/filing";

/**
 * Initialize OPTR state with a goal value
 */
export function initOPTR(goalValue: number): OPTRState {
  const now = Date.now();
  return {
    goalValue,
    realizedValue: 0,
    startTs: now,
    lastTs: now,
  };
}

/**
 * Apply a value delta and compute new TTV/progress
 */
export function applyValue(state: OPTRState, deltaValue: number): OPTRMetrics {
  const now = Date.now();
  state.realizedValue += deltaValue;
  state.lastTs = now;

  return {
    ttv: computeTTV(state),
    progress: state.realizedValue / state.goalValue,
  };
}

/**
 * Compute Time-to-Value metric
 * Returns milliseconds per unit of value realized
 */
export function computeTTV(state: OPTRState): number {
  if (state.realizedValue <= 0) return Infinity;
  return (state.lastTs - state.startTs) / state.realizedValue;
}
