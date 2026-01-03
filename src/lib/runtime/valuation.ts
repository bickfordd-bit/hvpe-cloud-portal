/**
 * OPTR Valuation Math Engine
 * Computes execution multiplier based on TTV collapse, decision reuse, and branch optimization
 */

export type ValuationInputs = {
  baselineTTV: number;
  currentTTV: number;
  decisionReuseRate: number; // 0-1
  branchCount: number;
};

/**
 * Compute valuation multiplier from OPTR metrics
 *
 * Formula:
 * - TTV collapse = baselineTTV / currentTTV (how much faster we're getting)
 * - Reuse boost = 1 + decisionReuseRate (compounding from decision reuse)
 * - Branch boost = log2(branchCount + 1) (value of parallel path optimization)
 * - Multiplier = ttvCollapse * reuseBoost * branchBoost
 *
 * @param inputs - Valuation computation inputs
 * @returns Execution multiplier (1.0x baseline, higher = better)
 */
export function computeValuationMultiplier({
  baselineTTV,
  currentTTV,
  decisionReuseRate,
  branchCount,
}: ValuationInputs): number {
  // Prevent division by zero
  if (currentTTV <= 0) {
    return 1.0;
  }

  // TTV collapse = how much faster we're getting
  const ttvCollapse = baselineTTV / currentTTV;

  // Reuse boost = compounding from decision reuse
  const reuseBoost = 1 + decisionReuseRate;

  // Branch boost = value of parallel path optimization (log scale for diminishing returns)
  const branchBoost = Math.log2(branchCount + 1);

  const multiplier = ttvCollapse * reuseBoost * branchBoost;

  return Number(multiplier.toFixed(2));
}
