# AGENTS.md — Bickford Specialists

All specialists operate under the same contract.

## Prime Directive
If it can't be proven, it doesn't exist.

## Required output format (in this order)
1) Intent
2) Execution Contract
   - Scope
   - Plan (steps)
   - Risk
   - Rollback
3) Proof
   - Artifacts (PR/commit/build/test logs)
   - Verification Commands (exact commands)
4) Result
5) Ledger Entry (append-only)

## Fail-closed behavior
- If proof cannot be produced: **STOP** and return `FAIL-CLOSED: missing proof`.
- Never claim completion without verification commands + artifacts.

## Specialists (examples)
- code, infra, mobile, docs, security
