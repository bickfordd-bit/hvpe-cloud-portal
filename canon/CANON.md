# BICKFORD CANON — Authoritative Specification

**Version**: 1.0.0  
**Status**: LOCKED  
**Last Updated**: 2026-01-03  
**Classification**: UNCLASSIFIED

---

## Prime Directive

**If it can't be proven, it doesn't exist.**

---

## Identity

- **System ID**: BICKFORD  
- **Company**: Bickford Technologies, Inc. (BTI)  
- **Mode**: Execution First  
- **Policy**: NO PROOF ⇒ NO EXISTENCE

---

## Core Objectives

1. Maximize realizable sale value while keeping d/dt(BICK_$) > 0
2. Primary buyer wedge: Microsoft Copilot (Asset 360) execution SLA
3. Deploy zero-approval execution runtime as daily operating surface

---

## Knowledge Levels (k₁ through k₅)

### k₁ — Raw Data
Input signals, documents, telemetry — **unverified**

### k₂ — Structured Knowledge
Parsed, indexed, embedded — **machine-readable but not validated**

### k₃ — Verified Facts
Proven through execution or external ground truth — **admissible**

### k₄ — Actionable Insights
Pattern recognition, predictions with confidence bounds — **decision-ready**

### k₅ — Compounding Intelligence (CIC)
Closed-loop learning where verified outcomes retrain the system — **self-improving**

---

## OPTR Mathematical Framework

### Base Definition

```
OPTR = Σ(Verified Executed Outcomes) / Δt
```

**Where an outcome o_i is counted if and only if:**

```
o_i ∈ {Authorized ∧ Executed ∧ Verified}
```

**Otherwise:** `o_i = 0`

### Interpretation

- **Authorized**: Decision conforms to policy (canon, law, safety)
- **Executed**: Action completed in real-world system
- **Verified**: Outcome confirmed via machine-readable feedback (not human report)

---

## OPTR-T2V (Time-to-Value)

### Canonical Equation

```
T2V = T(intent → decision)
    + T(decision → execution)
    + T(execution → verification)
    + T(verification → learning)
```

### OPTR Objective

```
Minimize T2V by collapsing or automating each term
```

**System Law**: If a term requires a meeting, email, spreadsheet, or manual reconciliation — **it is non-optimal by definition**.

### Policy Selection Formula

Choose next action u* that maximizes:

```
T2V_gain(u; S) = [Effort(S) - Effort(Apply(S,u))] / dt(u)
```

With constraint optimization:

```
minimize: TTV + λ_R·Risk + λ_C·CogLoad - λ_A·AutoGain

subject to:
  - feasible under constraints
  - proofable (artifact can be produced)
  - canon compliant
```

**Default weights:**
- λ_R (Risk) = 0.3
- λ_C (Cognitive Load) = 0.2
- λ_A (Automation Gain) = 0.5

---

## Admissibility Laws

### Law 1: Canon Compliance
Every action must preserve the canonical rules. No execution may violate core principles.

### Law 2: Non-Interference
Actions must not break existing, working functionality unless explicitly required to fix a security vulnerability.

### Law 3: Monotonic Safety
System state transitions must be monotonically safe — no state should reduce overall system safety or verifiability.

### Law 4: Burden Reduction
If an idea requires new user behavior, reject it by default (90% rule). Prefer actions that remove effort.

---

## Invariants

### Invariant 1: Proof Existence
```
∀ execution e: ∃ proof p: p.timestamp ∈ [e.start, e.end + ε]
```

Every execution MUST produce a verifiable proof artifact within bounded time.

### Invariant 2: Canon Integrity
```
SHA256(CANON.md) = CANON.meta.json.sha256
```

Canon hash MUST match on every execution. Mismatch = ABORT.

### Invariant 3: Ledger Immutability
```
∀ entry_i: entry_i.hash = SHA256(entry_i.data + entry_{i-1}.hash)
```

Ledger forms hash chain. No edits, append-only.

### Invariant 4: Zero-Approval Flow
```
Admissible(intent, canon) ∧ InvariantsSatisfied ⇒ AutoCommit
```

If intent is admissible and invariants pass, execution proceeds without human gate.

---

## Promotion Gates

### Gate 0: Intent Parsing
Raw text → structured Intent type

**Criteria:**
- Intent type identified
- Scope determined
- Confidence ≥ 0.7

**Failure mode:** Return to user for clarification

### Gate 1: Policy Selection
Intent → optimal policy binding via OPTR

**Criteria:**
- Policy exists for intent type
- OPTR score computed
- Risk acceptable

**Failure mode:** No applicable policy = DENY

### Gate 2: Invariant Check
Validate canon compliance, non-interference, monotonic safety

**Criteria:**
- All invariant checks pass
- Canon hash verified
- No breaking changes detected

**Failure mode:** Invariant violation = DENY with reason

### Gate 3: Execution
Generate changes, commit to GitHub, trigger deployment

**Criteria:**
- Changes generated successfully
- GitHub API call succeeds
- Commit SHA received

**Failure mode:** Retry with exponential backoff, log to ledger

### Gate 4: Verification
Confirm deployment success and system integrity

**Criteria:**
- Deployment completes
- Health check passes
- No rollback triggered

**Failure mode:** Append failure to ledger, mark intent as FAIL

---

## Ledger Contract

### Schema

```typescript
{
  id: string,              // Unique identifier
  timestamp: string,       // ISO 8601
  intent: Intent,          // Parsed intent
  policyId: string,        // Selected policy
  canonHash: string,       // SHA-256 of CANON.md at execution time
  outcome: 'ALLOW' | 'DENY' | 'FAIL',
  reasoning: string,       // Why this outcome
  artifacts: Artifact[],   // Proof artifacts
  hash: string,            // SHA-256 of this entry
  prevHash: string | null  // Previous entry hash (chain)
}
```

### Operations

- **APPEND**: Add new entry with hash chain
- **QUERY**: Read entries by filter (date, intent type, outcome)
- **VERIFY**: Check hash chain integrity

**FORBIDDEN**: Edit, delete, reorder entries

---

## Metrics & Valuation

### T2V Metrics
- **Baseline T2V**: Time without OPTR (manual process)
- **Actual T2V**: Time with OPTR (automated)
- **ΔT2V**: T2V_baseline - T2V_actual (improvement)

### BICK_$ Formula
```
BICK_$ = (ΔT2V / T2V_baseline) × C_exe × Q_proof × D × R × M
```

Where:
- C_exe = Execution quality confidence
- Q_proof = Proof quality score
- D = Defensibility (legal/audit)
- R = Repeatability
- M = Market multiplier

**Current BICK_$**: ≈ 0.56 (56% billionaire confidence)

### Proof Law

> If proof (artifact + timestamp + delta) does not exist, value, payment, and learning collapse to zero.

---

## Locked Proofs

### Proof A — Fishtown Beverage
Proof of Mechanism: OPTR accelerates real-world contract execution

**Status**: Verified  
**Evidence**: Email chain, proposal diff, timeline delta

### Proof B — Derek @ PTC (Asset 360 Copilot)
Proof of Economic Reality: Microsoft buyer interest confirmed

**Status**: Verified  
**Evidence**: Meeting notes, follow-up commitment, scope draft

---

## $1B IP Sale Architecture

| Phase | Title | Objective | Gate |
|-------|-------|-----------|------|
| 0 | Canon Lock | Restate non-negotiables in every buyer artifact | Canon artifacts countersigned |
| 1 | Asset Packaging | Quantify per-SKU value with proof bundles | Valuation packet reviewed with counsel |
| 2 | Buyer Funnel | Build OPTR loops per tiered buyer list | Buyer-specific pilot scope drafted |
| 3 | Pilot → Production | Prove SLA and convert to production contract | Two proofed pilot cycles completed |
| 4 | Monetization Structure | Decide acquisition vs earn-out vs JV | Preferred structure approved by board |
| 5 | Negotiation & Close | Execute sale while preserving rollback + CIC | SPA signed, funds released |
| 6 | Post-Sale Execution | Integrate/JV without breaking canon | Integration audit signed |

---

## Architecture Principles

1. **Multi-tenant execution** with strict tenant isolation (compute, encryption, data)
2. **Proof-gated monetization**: No billing until verification succeeds
3. **Event-driven backbone**: EventBridge + SQS/DLQ for async orchestration
4. **Immutable audit**: WORM-capable storage (DynamoDB + S3 Object Lock)
5. **Compounding loop (CIC)**: Only verified outcomes retrain the system
6. **Production-ready scaffolding**: Deploy to AWS with minimal config

---

## Canonical Artifacts

- **Pilot email template**: `docs/MICROSOFT_PILOT_EMAIL.md`
- **Pilot scope draft**: `docs/MICROSOFT_PILOT_SCOPE.md`
- **OPTR mathematical framework**: `docs/OPTR_MATHEMATICAL_FRAMEWORK.md`
- **T2V framework**: `docs/OPTR_T2V_FRAMEWORK.md`
- **Bickford canon**: `docs/BICKFORD_CANON.md`

---

## Error Handling Rules

### Canon Integrity Failure
**Action**: Hard stop, show hash mismatch  
**Log**: Append to ledger with DENY outcome  
**Recovery**: Fix canon or revert to last known good state

### Invariant Violation
**Action**: DENY with canonical reason  
**Log**: Full invariant check results in ledger  
**Recovery**: User must modify intent or fix violation

### GitHub API Failure
**Action**: Retry with exponential backoff (max 3 attempts)  
**Log**: Each attempt logged  
**Recovery**: If all retries fail, mark as FAIL in ledger

### Proof Generation Failure
**Action**: FAIL-CLOSED, no claim of completion  
**Message**: "FAIL-CLOSED: missing proof" + what's missing  
**Recovery**: Fix proof generation pipeline before retry

---

## Non-Negotiable Rules

From `.github/copilot-instructions.md`:

1. **No proof ⇒ no existence**: Every claim must have verifiable artifact
2. **Fail-closed by default**: If proof cannot be produced, stop immediately
3. **OPTR/T2V enforcement**: Prefer actions that maximize effort removed per unit time
4. **90% rule**: Reject ideas requiring new user behavior
5. **Ledger immutability**: Append-only, hash-chained, no edits
6. **Canon compliance**: All executions preserve canonical rules
7. **Zero-approval flow**: Admissible intents execute without human gate
8. **Security first**: Never expose sensitive endpoints without auth
9. **Type safety**: All code strictly typed, no `any` except error handlers
10. **Structured logging**: Use winston logger for all server-side logs

---

## Proof Rubric (Ranked)

1. **Build/test logs + green CI** (highest)
2. **Before/after metric artifact**
3. **Commit/PR diff with verification commands**
4. **Timestamped logs** (lowest)

---

## Fail-Closed Behavior

- If proof cannot be produced, stop and return:
  - **"FAIL-CLOSED: missing proof"** + what proof is missing
- Never claim completion without proof
- Log all failures to ledger with full context

---

## Configuration

### Environment Variables Required
- `GITHUB_TOKEN`: For auto-commits
- `DATABASE_URL`: For persistent ledger (optional, falls back to file-based)

### Environment Variables Optional
- `OPENAI_API_KEY` or `HVPE_OPENAI_API_KEY`: For AI-enhanced intent parsing
- `LOG_LEVEL`: Logging verbosity (default: info)

---

## Deployment Requirements

1. **Local dev**: `npm install && npm run dev` starts homepage
2. **Build**: `npm run build` succeeds with zero errors
3. **Vercel**: Auto-deploys on commit to main branch
4. **Health check**: `/api/health` returns 200
5. **Canon verification**: Runs on every `/api/execute` call
6. **Ledger persistence**: Append-only log in `.bick/ledger/`

---

## Success Criteria

- ✅ Homepage loads at root path `/`
- ✅ Canon verification executes on every API call
- ✅ Intent submission → structured execution → auto-commit → deploy
- ✅ Ledger persists all decisions with hash chain
- ✅ No manual approval prompts anywhere in flow
- ✅ Can be set as browser homepage URL
- ✅ Vercel deployment succeeds automatically

---

**END OF CANON**

This document is the authoritative specification for the Bickford execution runtime.  
All implementations must conform to this canon.  
Hash verification required on every execution.
