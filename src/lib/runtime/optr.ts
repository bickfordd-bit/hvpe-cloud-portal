/**
 * OPTR Runtime Engine with Branch Tracking
 * Extends existing OPTR system with per-branch state management
 */

export type OPTRState = {
  goalValue: number;
  realizedValue: number;
  timestamp: number;
};

export type BranchOPTR = {
  branchId: string;
  ttv: number;
  progress: number;
};

// Global OPTR state
let globalState: OPTRState | null = null;

// Branch-scoped OPTR state
const branchStates: Record<string, OPTRState> = {};

/**
 * Initialize OPTR state with a goal value
 */
export function initOPTR(goalValue: number): OPTRState {
  return {
    goalValue,
    realizedValue: 0,
    timestamp: Date.now(),
  };
}

/**
 * Initialize global OPTR state
 */
export function initGlobalOPTR(goalValue: number): void {
  globalState = initOPTR(goalValue);
}

/**
 * Apply value delta to OPTR state
 */
export function applyValue(
  state: OPTRState,
  delta: number,
): { ttv: number; progress: number } {
  state.realizedValue += delta;
  state.timestamp = Date.now();

  const ttv = computeTTV(state);
  const progress = state.realizedValue / state.goalValue;

  return { ttv, progress };
}

/**
 * Apply value delta to global OPTR state
 */
export function applyGlobalValue(delta: number): {
  ttv: number;
  progress: number;
} {
  if (!globalState) {
    initGlobalOPTR(100); // Default goal
  }
  return applyValue(globalState!, delta);
}

/**
 * Apply value delta to branch-specific OPTR state
 */
export function applyBranchValue(branchId: string, delta: number): BranchOPTR {
  if (!branchStates[branchId]) {
    branchStates[branchId] = initOPTR(10); // 10 units per branch
  }

  const result = applyValue(branchStates[branchId], delta);

  return {
    branchId,
    ...result,
  };
}

/**
 * Compute Time-to-Value (TTV) for OPTR state
 */
export function computeTTV(state: OPTRState): number {
  if (state.realizedValue === 0) {
    return 5000; // Baseline 5 seconds
  }

  const progress = state.realizedValue / state.goalValue;
  const elapsed = Date.now() - state.timestamp;

  // TTV = elapsed time / progress (projected time to completion)
  const ttv = progress > 0 ? elapsed / progress : 5000;

  return Math.max(ttv, 100); // Minimum 100ms
}

/**
 * Get statistics for all branches
 */
export function getBranchStats(): BranchOPTR[] {
  return Object.entries(branchStates).map(([branchId, state]) => ({
    branchId,
    ttv: computeTTV(state),
    progress: state.realizedValue / state.goalValue,
  }));
}

/**
 * Get global OPTR state
 */
export function getGlobalState(): OPTRState | null {
  return globalState;
}

/**
 * Reset all OPTR state (useful for testing)
 */
export function resetOPTR(): void {
  globalState = null;
  Object.keys(branchStates).forEach((key) => delete branchStates[key]);
}
