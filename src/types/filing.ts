/**
 * Filing UI Types
 * Types for the Bickford filing interface with OPTR/TTV computation
 */

export interface Intent {
  text: string;
  mode: string;
  instanceId: string;
  sessionId: string;
}

export interface RouteResult {
  branchId: string;
  confidence: number;
}

export interface GuardDecision {
  status: "ALLOW" | "DENY";
  reasons: string[];
}

export interface OPTRState {
  goalValue: number;
  realizedValue: number;
  startTs: number;
  lastTs: number;
}

export interface OPTRMetrics {
  ttv: number;
  progress: number;
}

export interface CanonEvent {
  type: "intent";
  decision: "ALLOW" | "DENY";
  route: string;
  ttv: number;
  progress: number;
  timestamp: number;
}

export interface IntentHandlerResult {
  status: "ALLOW" | "DENY";
  route: string;
  ttv: number;
  progress: number;
  reasons: string[];
}
