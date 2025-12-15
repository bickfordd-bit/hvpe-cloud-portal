/**
 * BICK API Type definitions
 */

/**
 * BICK computation input
 */
export interface BickRequest {
  V: number;  // Value
  T: number;  // Time
  E: number;  // Efficiency
  L: number;  // Leverage
  D?: number; // Optional dimension
  baseline?: BickBaseline;
}

/**
 * Baseline for delta computation
 */
export interface BickBaseline {
  V: number;
  T: number;
  E: number;
  L: number;
  D?: number;
}

/**
 * BICK computation components
 */
export interface BickComponents {
  V: number;
  T: number;
  E: number;
  L: number;
  D?: number;
}

/**
 * Delta computation result
 */
export interface BickDelta {
  currentBick: number;
  baselineBick: number;
  deltaBick: number;
  baselineComponents: BickComponents;
}

/**
 * BICK computation response
 */
export interface BickResponse {
  bick: number;
  components: BickComponents;
  delta?: BickDelta;
}
