/**
 * Filing UI TypeScript Types
 */

export type IntentEvent = {
  type: "intent";
  intent: string;
  branchId: string;
  valueDelta: number;
  timestamp: number;
};

export type ValuationEvent = {
  type: "valuation";
  multiplier: number;
  timestamp: number;
};

export type BranchOPTREvent = {
  type: "branch-optr";
  branchId: string;
  ttv: number;
  progress: number;
  timestamp: number;
};

export type CanonEvent = IntentEvent | ValuationEvent | BranchOPTREvent;
