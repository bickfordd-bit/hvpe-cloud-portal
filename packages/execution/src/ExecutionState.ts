import { ExecutionPhase } from "./ExecutionPhase";

export enum ExecutionState {
  // INTAKE Phase
  INTENT_DECLARED = "intent_declared",
  INTENT_ANALYZING = "intent_analyzing",
  INTENT_PARSED = "intent_parsed",

  // PLANNING Phase
  PLAN_GENERATING = "plan_generating",
  PLAN_READY = "plan_ready",

  // POLICY Phase
  POLICY_CHECKING = "policy_checking",
  POLICY_APPROVED = "policy_approved",
  POLICY_BLOCKED = "policy_blocked",

  // CAPABILITY Phase
  CAPABILITY_CHECKING = "capability_checking",
  CAPABILITY_READY = "capability_ready",
  CAPABILITY_MISSING = "capability_missing",

  // EXECUTION Phase
  EXECUTING = "executing",
  EXECUTION_PAUSED = "execution_paused",
  EXECUTION_FAILED = "execution_failed",

  // RECORDING Phase
  ARTIFACTS_RECORDING = "artifacts_recording",
  LEDGER_COMMITTING = "ledger_committing",

  // TERMINAL Phase
  COMPLETED = "completed",
  FAILED_TERMINAL = "failed_terminal",
  ABORTED = "aborted",
}

export const STATE_TO_PHASE: Record<ExecutionState, ExecutionPhase> = {
  [ExecutionState.INTENT_DECLARED]: ExecutionPhase.INTAKE,
  [ExecutionState.INTENT_ANALYZING]: ExecutionPhase.INTAKE,
  [ExecutionState.INTENT_PARSED]: ExecutionPhase.INTAKE,

  [ExecutionState.PLAN_GENERATING]: ExecutionPhase.PLANNING,
  [ExecutionState.PLAN_READY]: ExecutionPhase.PLANNING,

  [ExecutionState.POLICY_CHECKING]: ExecutionPhase.POLICY,
  [ExecutionState.POLICY_APPROVED]: ExecutionPhase.POLICY,
  [ExecutionState.POLICY_BLOCKED]: ExecutionPhase.POLICY,

  [ExecutionState.CAPABILITY_CHECKING]: ExecutionPhase.CAPABILITY,
  [ExecutionState.CAPABILITY_READY]: ExecutionPhase.CAPABILITY,
  [ExecutionState.CAPABILITY_MISSING]: ExecutionPhase.CAPABILITY,

  [ExecutionState.EXECUTING]: ExecutionPhase.EXECUTION,
  [ExecutionState.EXECUTION_PAUSED]: ExecutionPhase.EXECUTION,
  [ExecutionState.EXECUTION_FAILED]: ExecutionPhase.EXECUTION,

  [ExecutionState.ARTIFACTS_RECORDING]: ExecutionPhase.RECORDING,
  [ExecutionState.LEDGER_COMMITTING]: ExecutionPhase.RECORDING,

  [ExecutionState.COMPLETED]: ExecutionPhase.TERMINAL,
  [ExecutionState.FAILED_TERMINAL]: ExecutionPhase.TERMINAL,
  [ExecutionState.ABORTED]: ExecutionPhase.TERMINAL,
};
