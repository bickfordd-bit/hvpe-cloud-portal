# CANON — OPTR/T2V + Proof Gates

## Core Rules
- If it can't be proven, it doesn't exist.
- Verified deltas only enter CIC.

## OPTR
Choose next action u* that maximizes:
$T2V(u; S) = \frac{Effort(S) - Effort(Apply(S,u))}{dt(u)}$

Subject to:
- feasible under constraints
- proofable (artifact can be produced)

## Proof Rubric (ranked)
1) build/test logs + green CI
2) before/after metric artifact
3) commit/PR diff with verification commands
4) timestamped logs (lowest)

## Ledger
Every run appends a JSON entry to `.bick/ledger/`.
No edits, append-only.
