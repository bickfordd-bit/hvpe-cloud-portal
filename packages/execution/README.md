# @bickford/execution

**Bickford Execution Spec v1 - Canonical State Machine Implementation**

This package provides the frozen, canonical implementation of the Bickford Execution Spec v1, which defines a monotonic state machine for tracking execution lifecycle from intent declaration through completion.

## Status

**CANONICAL SPEC (Frozen 2026-01-07)**  
**Authority: bickfordd-bit (system owner)**

Any deviation from this spec is a bug. This is not a design task - it is a complete, frozen specification.

## Features

- **Monotonic Phase Progression**: Phases can only move forward, never backward
- **Strict State Transitions**: Every state transition is validated against allowed rules
- **Authority Tracking**: Each transition is tagged with its authority (SYSTEM, POLICY, HUMAN, EXTERNAL)
- **Event Streaming**: Real-time execution state updates via Server-Sent Events
- **Type-Safe**: Full TypeScript support with strict type checking
- **Invariant Enforcement**: Automatic validation of phase boundaries and state legality

## Installation

```bash
npm install @bickford/execution
```

## Core Concepts

### Execution Phases (Monotonic)

1. **INTAKE** - Intent declaration and parsing
2. **PLANNING** - Plan generation
3. **POLICY** - Policy approval/blocking
4. **CAPABILITY** - Capability checking
5. **EXECUTION** - Actual execution
6. **RECORDING** - Artifact and ledger recording
7. **TERMINAL** - Final state (completed/failed/aborted)

### Execution States

Each phase contains multiple states:

- **INTAKE**: `INTENT_DECLARED` → `INTENT_ANALYZING` → `INTENT_PARSED`
- **PLANNING**: `PLAN_GENERATING` → `PLAN_READY`
- **POLICY**: `POLICY_CHECKING` → `POLICY_APPROVED` | `POLICY_BLOCKED`
- **CAPABILITY**: `CAPABILITY_CHECKING` → `CAPABILITY_READY` | `CAPABILITY_MISSING`
- **EXECUTION**: `EXECUTING` | `EXECUTION_PAUSED` | `EXECUTION_FAILED`
- **RECORDING**: `ARTIFACTS_RECORDING` → `LEDGER_COMMITTING`
- **TERMINAL**: `COMPLETED` | `FAILED_TERMINAL` | `ABORTED`

### Transition Authorities

- **SYSTEM**: Automated system transitions
- **POLICY**: Policy engine decisions
- **HUMAN**: Requires human approval/intervention
- **EXTERNAL**: External service/capability resolution

## Usage

### Basic State Machine

```typescript
import {
  ExecutionPhase,
  ExecutionState,
  isValidTransition,
  validatePhaseTransition,
} from "@bickford/execution";

// Check if a state transition is valid
const valid = isValidTransition(
  ExecutionState.INTENT_DECLARED,
  ExecutionState.INTENT_ANALYZING,
); // true

// Validate phase boundaries
const result = validatePhaseTransition(
  ExecutionState.EXECUTING,
  ExecutionState.INTENT_ANALYZING,
);
console.log(result); // { valid: false, reason: "Invalid phase transition..." }
```

### Event Emitter with Invariant Enforcement

```typescript
import {
  ExecutionEmitter,
  ExecutionState,
  ExecutionPhase,
  TransitionAuthority,
} from "@bickford/execution";

const emitter = new ExecutionEmitter();

// Listen for transitions
emitter.on("execution:transition", (event) => {
  console.log(`Transitioned to ${event.currentState}`);
});

// Emit a transition (validates automatically)
emitter.emitTransition({
  executionId: "exec-123",
  tenantId: "tenant-456",
  timestamp: new Date().toISOString(),
  phase: ExecutionPhase.INTAKE,
  previousState: ExecutionState.INTENT_DECLARED,
  currentState: ExecutionState.INTENT_ANALYZING,
  authority: TransitionAuthority.SYSTEM,
  message: "Analyzing intent",
});

// Invalid transitions throw errors
try {
  emitter.emitTransition({
    executionId: "exec-123",
    tenantId: "tenant-456",
    timestamp: new Date().toISOString(),
    phase: ExecutionPhase.TERMINAL,
    previousState: ExecutionState.COMPLETED,
    currentState: ExecutionState.EXECUTING,
    authority: TransitionAuthority.SYSTEM,
    message: "Invalid!",
  });
} catch (error) {
  console.error(error.message); // "Illegal state transition: completed → executing"
}
```

### React Hook for Real-Time Streaming

```typescript
import { useExecutionStream } from '@bickford/execution';

function ExecutionMonitor({ executionId }: { executionId: string }) {
  const { currentState, latestEvent, history, isConnected, error, isTerminal } =
    useExecutionStream(executionId);

  if (error) return <div>Error: {error.message}</div>;
  if (!isConnected) return <div>Connecting...</div>;

  return (
    <div>
      <h2>Current State: {currentState}</h2>
      {latestEvent && <p>{latestEvent.message}</p>}
      {isTerminal && <p>Execution completed</p>}

      <h3>History</h3>
      <ul>
        {history.map((event, i) => (
          <li key={i}>{event.currentState}: {event.message}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Database Schema

The package includes SQL schema for PostgreSQL with UUID support:

```sql
-- Load from packages/ledger/schema/executions.sql

-- Tables:
-- - executions: Main execution tracking
-- - execution_transitions: Append-only transition log
-- - execution_artifacts: Execution output artifacts

-- Indexes optimized for tenant queries, phase/state filtering, and authority tracking
```

## Testing

The package includes spec-locking tests that validate all invariants:

```bash
npm test
```

All tests must pass. Any test failure indicates a spec violation.

## API Reference

### Functions

- `isValidPhaseTransition(from, to)`: Check if phase transition is valid
- `isValidTransition(from, to)`: Check if state transition is valid
- `isTerminalState(state)`: Check if state is terminal
- `requiresHumanAuthority(from, to)`: Check if transition requires human approval
- `validatePhaseTransition(fromState, toState)`: Validate phase boundary rules

### Classes

- `ExecutionEmitter`: EventEmitter with built-in invariant enforcement

### Hooks

- `useExecutionStream(executionId)`: React hook for SSE-based execution monitoring

### Enums

- `ExecutionPhase`: All execution phases
- `ExecutionState`: All execution states
- `TransitionAuthority`: All authority types

### Constants

- `PHASE_PROGRESSION`: Maps each phase to its next phase
- `STATE_TO_PHASE`: Maps each state to its phase
- `VALID_TRANSITIONS`: Complete transition rule table

## Development

```bash
# Build
npm run build

# Watch mode
npm run dev

# Run tests
npm test

# Type check
npm run typecheck
```

## License

PROPRIETARY - Copyright (c) 2026 Derek Bickford

## Spec Authority

This implementation is maintained by bickfordd-bit (system owner). All changes must preserve exact spec compliance.

---

**Important**: This is a canonical specification. Do not modify without authorization from the spec owner.
