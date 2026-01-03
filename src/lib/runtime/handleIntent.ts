/**
 * Intent Handler with Valuation and Branch Tracking
 * Routes user intents and computes OPTR metrics
 */

import { computeValuationMultiplier } from "./valuation";
import { applyBranchValue, applyGlobalValue } from "./optr";

export type IntentRoute = {
  branchId: string;
  valueDelta: number;
};

export type CanonEvent = {
  type: string;
  timestamp?: number;
  [key: string]: unknown;
};

// Canon event log
const canonLog: CanonEvent[] = [];

/**
 * Emit a canon event
 */
export function emitCanonEvent(event: CanonEvent): void {
  canonLog.push({
    ...event,
    timestamp: event.timestamp || Date.now(),
  });
}

/**
 * Get all canon events
 */
export function getCanonEvents(): CanonEvent[] {
  return [...canonLog];
}

/**
 * Clear canon events (useful for testing)
 */
export function clearCanonEvents(): void {
  canonLog.length = 0;
}

/**
 * Route intent to appropriate branch
 */
export function routeIntent(intent: string): IntentRoute {
  const lower = intent.toLowerCase();

  // Simple keyword-based routing
  if (
    lower.includes("dod") ||
    lower.includes("defense") ||
    lower.includes("compliance") ||
    lower.includes("cmmc")
  ) {
    return { branchId: "dod-pilot", valueDelta: 2.5 };
  } else if (
    lower.includes("aws") ||
    lower.includes("cloud") ||
    lower.includes("infrastructure") ||
    lower.includes("deploy")
  ) {
    return { branchId: "aws-sim", valueDelta: 2.0 };
  } else if (
    lower.includes("ui") ||
    lower.includes("product") ||
    lower.includes("interface") ||
    lower.includes("design")
  ) {
    return { branchId: "product-ui", valueDelta: 1.5 };
  } else if (
    lower.includes("investor") ||
    lower.includes("funding") ||
    lower.includes("pitch") ||
    lower.includes("valuation")
  ) {
    return { branchId: "investor", valueDelta: 3.0 };
  }

  // Default to product-ui
  return { branchId: "product-ui", valueDelta: 1.0 };
}

/**
 * Handle user intent and emit OPTR events
 */
export function handleIntent(intent: string): void {
  // Route intent to branch
  const route = routeIntent(intent);

  // Apply value to global and branch OPTR
  const globalResult = applyGlobalValue(route.valueDelta);
  const branchResult = applyBranchValue(route.branchId, route.valueDelta);

  // Emit intent event
  emitCanonEvent({
    type: "intent",
    intent,
    branchId: route.branchId,
    valueDelta: route.valueDelta,
    timestamp: Date.now(),
  });

  // Compute valuation multiplier
  const valuation = computeValuationMultiplier({
    baselineTTV: 5000, // Initial baseline (5 seconds)
    currentTTV: globalResult.ttv,
    decisionReuseRate: 0.3, // 30% decision reuse (estimate)
    branchCount: 4, // Number of active branches
  });

  // Emit valuation event
  emitCanonEvent({
    type: "valuation",
    multiplier: valuation,
    timestamp: Date.now(),
  });

  // Emit branch-specific OPTR
  emitCanonEvent({
    type: "branch-optr",
    branchId: route.branchId,
    ttv: branchResult.ttv,
    progress: branchResult.progress,
    timestamp: Date.now(),
  });
}
