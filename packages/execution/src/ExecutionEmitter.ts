import { EventEmitter } from "events";
import { ExecutionEvent } from "./ExecutionEvent";
import {
  isValidTransition,
  validatePhaseTransition,
} from "./ExecutionInvariants";

export class ExecutionEmitter extends EventEmitter {
  emitTransition(event: ExecutionEvent): void {
    if (event.previousState) {
      if (!isValidTransition(event.previousState, event.currentState)) {
        throw new Error(
          `Illegal state transition: ${event.previousState} → ${event.currentState}`,
        );
      }

      const phaseValidation = validatePhaseTransition(
        event.previousState,
        event.currentState,
      );
      if (!phaseValidation.valid) {
        throw new Error(phaseValidation.reason);
      }
    }

    this.emit("execution:transition", event);
  }
}

export const executionEmitter = new ExecutionEmitter();
