import { describe, it, expect } from "@jest/globals";
import { ExecutionState } from "../ExecutionState";
import { ExecutionPhase, isValidPhaseTransition } from "../ExecutionPhase";
import {
  isValidTransition,
  validatePhaseTransition,
} from "../ExecutionInvariants";

describe("Execution Invariants", () => {
  it("rejects phase regression", () => {
    expect(
      isValidPhaseTransition(ExecutionPhase.EXECUTION, ExecutionPhase.PLANNING),
    ).toBe(false);
    expect(
      isValidPhaseTransition(ExecutionPhase.TERMINAL, ExecutionPhase.INTAKE),
    ).toBe(false);
  });

  it("allows forward phase progression", () => {
    expect(
      isValidPhaseTransition(ExecutionPhase.INTAKE, ExecutionPhase.PLANNING),
    ).toBe(true);
    expect(
      isValidPhaseTransition(ExecutionPhase.PLANNING, ExecutionPhase.POLICY),
    ).toBe(true);
  });

  it("rejects illegal state transitions", () => {
    expect(
      isValidTransition(ExecutionState.COMPLETED, ExecutionState.EXECUTING),
    ).toBe(false);
    expect(
      isValidTransition(
        ExecutionState.INTENT_DECLARED,
        ExecutionState.EXECUTING,
      ),
    ).toBe(false);
  });

  it("allows legal state transitions", () => {
    expect(
      isValidTransition(
        ExecutionState.INTENT_DECLARED,
        ExecutionState.INTENT_ANALYZING,
      ),
    ).toBe(true);
    expect(
      isValidTransition(
        ExecutionState.POLICY_CHECKING,
        ExecutionState.POLICY_APPROVED,
      ),
    ).toBe(true);
  });

  it("enforces phase boundaries on state transitions", () => {
    const result = validatePhaseTransition(
      ExecutionState.EXECUTING,
      ExecutionState.INTENT_ANALYZING,
    );
    expect(result.valid).toBe(false);
  });
});
