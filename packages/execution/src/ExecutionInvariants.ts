import { ExecutionState, STATE_TO_PHASE } from "./ExecutionState";
import { ExecutionPhase, isValidPhaseTransition } from "./ExecutionPhase";
import { TransitionAuthority } from "./TransitionAuthority";
import { VALID_TRANSITIONS } from "./ExecutionTransitions";

export function isValidTransition(
  from: ExecutionState,
  to: ExecutionState,
): boolean {
  const rules = VALID_TRANSITIONS[from] || [];
  return rules.some((rule) => rule.to === to);
}

export function isTerminalState(state: ExecutionState): boolean {
  return [
    ExecutionState.COMPLETED,
    ExecutionState.FAILED_TERMINAL,
    ExecutionState.ABORTED,
    ExecutionState.POLICY_BLOCKED,
    ExecutionState.CAPABILITY_MISSING,
  ].includes(state);
}

export function requiresHumanAuthority(
  from: ExecutionState,
  to: ExecutionState,
): boolean {
  const rules = VALID_TRANSITIONS[from] || [];
  const rule = rules.find((r) => r.to === to);
  return rule?.authority === TransitionAuthority.HUMAN;
}

export function validatePhaseTransition(
  fromState: ExecutionState,
  toState: ExecutionState,
): { valid: boolean; reason?: string } {
  const fromPhase = STATE_TO_PHASE[fromState];
  const toPhase = STATE_TO_PHASE[toState];

  if (fromPhase === toPhase) {
    return { valid: true };
  }

  if (!isValidPhaseTransition(fromPhase, toPhase)) {
    return {
      valid: false,
      reason: `Invalid phase transition: ${fromPhase} → ${toPhase}`,
    };
  }

  return { valid: true };
}
