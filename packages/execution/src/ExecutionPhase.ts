/**
 * ExecutionPhase represents the high-level stage of execution.
 * Phases are MONOTONIC — they can only move forward, never backward.
 */
export enum ExecutionPhase {
  INTAKE = "intake",
  PLANNING = "planning",
  POLICY = "policy",
  CAPABILITY = "capability",
  EXECUTION = "execution",
  RECORDING = "recording",
  TERMINAL = "terminal",
}

export const PHASE_PROGRESSION: Record<ExecutionPhase, ExecutionPhase | null> =
  {
    [ExecutionPhase.INTAKE]: ExecutionPhase.PLANNING,
    [ExecutionPhase.PLANNING]: ExecutionPhase.POLICY,
    [ExecutionPhase.POLICY]: ExecutionPhase.CAPABILITY,
    [ExecutionPhase.CAPABILITY]: ExecutionPhase.EXECUTION,
    [ExecutionPhase.EXECUTION]: ExecutionPhase.RECORDING,
    [ExecutionPhase.RECORDING]: ExecutionPhase.TERMINAL,
    [ExecutionPhase.TERMINAL]: null,
  };

export function isValidPhaseTransition(
  from: ExecutionPhase,
  to: ExecutionPhase,
): boolean {
  if (from === ExecutionPhase.TERMINAL) return false;
  return PHASE_PROGRESSION[from] === to || to === ExecutionPhase.TERMINAL;
}
