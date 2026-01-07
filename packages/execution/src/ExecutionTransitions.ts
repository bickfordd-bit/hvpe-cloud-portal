import { ExecutionState } from "./ExecutionState";
import { TransitionAuthority } from "./TransitionAuthority";

export interface TransitionRule {
  to: ExecutionState;
  authority: TransitionAuthority;
  description?: string;
}

export const VALID_TRANSITIONS: Record<ExecutionState, TransitionRule[]> = {
  [ExecutionState.INTENT_DECLARED]: [
    {
      to: ExecutionState.INTENT_ANALYZING,
      authority: TransitionAuthority.SYSTEM,
    },
    { to: ExecutionState.ABORTED, authority: TransitionAuthority.HUMAN },
  ],

  [ExecutionState.INTENT_ANALYZING]: [
    { to: ExecutionState.INTENT_PARSED, authority: TransitionAuthority.SYSTEM },
    {
      to: ExecutionState.FAILED_TERMINAL,
      authority: TransitionAuthority.SYSTEM,
    },
    { to: ExecutionState.ABORTED, authority: TransitionAuthority.HUMAN },
  ],

  [ExecutionState.INTENT_PARSED]: [
    {
      to: ExecutionState.PLAN_GENERATING,
      authority: TransitionAuthority.SYSTEM,
    },
    { to: ExecutionState.ABORTED, authority: TransitionAuthority.HUMAN },
  ],

  [ExecutionState.PLAN_GENERATING]: [
    { to: ExecutionState.PLAN_READY, authority: TransitionAuthority.SYSTEM },
    {
      to: ExecutionState.EXECUTION_FAILED,
      authority: TransitionAuthority.SYSTEM,
    },
    { to: ExecutionState.ABORTED, authority: TransitionAuthority.HUMAN },
  ],

  [ExecutionState.PLAN_READY]: [
    {
      to: ExecutionState.POLICY_CHECKING,
      authority: TransitionAuthority.SYSTEM,
    },
    { to: ExecutionState.ABORTED, authority: TransitionAuthority.HUMAN },
  ],

  [ExecutionState.POLICY_CHECKING]: [
    {
      to: ExecutionState.POLICY_APPROVED,
      authority: TransitionAuthority.POLICY,
    },
    {
      to: ExecutionState.POLICY_BLOCKED,
      authority: TransitionAuthority.POLICY,
    },
    { to: ExecutionState.ABORTED, authority: TransitionAuthority.HUMAN },
  ],

  [ExecutionState.POLICY_APPROVED]: [
    {
      to: ExecutionState.CAPABILITY_CHECKING,
      authority: TransitionAuthority.SYSTEM,
    },
  ],

  [ExecutionState.POLICY_BLOCKED]: [
    {
      to: ExecutionState.CAPABILITY_CHECKING,
      authority: TransitionAuthority.HUMAN,
    },
    { to: ExecutionState.ABORTED, authority: TransitionAuthority.HUMAN },
  ],

  [ExecutionState.CAPABILITY_CHECKING]: [
    {
      to: ExecutionState.CAPABILITY_READY,
      authority: TransitionAuthority.SYSTEM,
    },
    {
      to: ExecutionState.CAPABILITY_MISSING,
      authority: TransitionAuthority.SYSTEM,
    },
    { to: ExecutionState.ABORTED, authority: TransitionAuthority.HUMAN },
  ],

  [ExecutionState.CAPABILITY_READY]: [
    { to: ExecutionState.EXECUTING, authority: TransitionAuthority.SYSTEM },
  ],

  [ExecutionState.CAPABILITY_MISSING]: [
    {
      to: ExecutionState.CAPABILITY_CHECKING,
      authority: TransitionAuthority.EXTERNAL,
    },
    { to: ExecutionState.ABORTED, authority: TransitionAuthority.HUMAN },
  ],

  [ExecutionState.EXECUTING]: [
    {
      to: ExecutionState.ARTIFACTS_RECORDING,
      authority: TransitionAuthority.SYSTEM,
    },
    {
      to: ExecutionState.EXECUTION_PAUSED,
      authority: TransitionAuthority.SYSTEM,
    },
    {
      to: ExecutionState.EXECUTION_FAILED,
      authority: TransitionAuthority.SYSTEM,
    },
    { to: ExecutionState.ABORTED, authority: TransitionAuthority.HUMAN },
  ],

  [ExecutionState.EXECUTION_PAUSED]: [
    { to: ExecutionState.EXECUTING, authority: TransitionAuthority.EXTERNAL },
    { to: ExecutionState.ABORTED, authority: TransitionAuthority.HUMAN },
  ],

  [ExecutionState.EXECUTION_FAILED]: [
    {
      to: ExecutionState.INTENT_ANALYZING,
      authority: TransitionAuthority.SYSTEM,
    },
    {
      to: ExecutionState.FAILED_TERMINAL,
      authority: TransitionAuthority.SYSTEM,
    },
    { to: ExecutionState.ABORTED, authority: TransitionAuthority.HUMAN },
  ],

  [ExecutionState.ARTIFACTS_RECORDING]: [
    {
      to: ExecutionState.LEDGER_COMMITTING,
      authority: TransitionAuthority.SYSTEM,
    },
    {
      to: ExecutionState.FAILED_TERMINAL,
      authority: TransitionAuthority.SYSTEM,
    },
  ],

  [ExecutionState.LEDGER_COMMITTING]: [
    { to: ExecutionState.COMPLETED, authority: TransitionAuthority.SYSTEM },
    {
      to: ExecutionState.FAILED_TERMINAL,
      authority: TransitionAuthority.SYSTEM,
    },
  ],

  [ExecutionState.COMPLETED]: [],
  [ExecutionState.FAILED_TERMINAL]: [],
  [ExecutionState.ABORTED]: [],
};
