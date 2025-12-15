# BICK Canon (B-I-C-K)

**Version**: 1.0.0  
**Status**: Canonical Reference  
**Last Updated**: 2025-12-15

This document defines the canonical BICK formula and all its components. All implementations MUST conform to these definitions.

## The BICK Formula

```
BICK_planner = ( Σ(Value(w) * EC(w)) / Σ(T2V(w)) ) * DS * (1 / C)
```

## Components

### Work Item (w)

A **work item** is any unit of value delivery tracked in the repository:
- GitHub Issue (open, in progress, or closed)
- Pull Request (open, merged, or closed)
- Commit (on main branch)
- ADR/RFC (decision document)

Each work item `w` has:

#### Value(w) - Expected Realized Value Units

Quantified business/user value expected from completing this work item.

**Calculation**:
```
Value(w) = base_value * priority_multiplier
```

Where:
- `base_value`: Default value per item (from config, typically 100 units)
- `priority_multiplier`: Based on priority label (P0=3x, P1=2x, P2=1x, default=1x)

**Example**:
- P0 issue: 100 * 3.0 = 300 value units
- P1 PR: 100 * 2.0 = 200 value units
- Unlabeled commit: 100 * 1.0 = 100 value units

#### EC(w) - Execution Confidence

Confidence that this work item will deliver its intended value, based on traceability and quality gates.

**Range**: 0.0 to 1.0 (0% to 100%)

**Factors**:
- Tests added/passed (+0.2)
- Code review approved (+0.2)
- Linked to issue/RFC (+0.2)
- CI/CD green (+0.2)
- Documentation updated (+0.2)

**Default proxies** (when detailed data unavailable):
- Merged PR with tests: 0.8
- Merged PR without tests: 0.6
- Open PR: 0.4
- Commit: 0.6

**Example**:
- PR with tests, review, CI green, docs: 0.8
- Quick fix commit: 0.6

#### T2V(w) - Time-to-Value

Elapsed time from **intent** (issue creation or commit decision) to **value realization** (merge to main).

**Unit**: Days (fractional)

**Calculation**:
```
T2V(w) = (merged_at - created_at) / (24 * 60 * 60 * 1000)  // Convert ms to days
```

**Minimum**: 0.01 days (prevents division by zero, represents same-day delivery)

**Default proxies**:
- Merged PR: actual merge time - creation time
- Direct commit: 3 days (estimated average)
- Closed issue: close time - open time

**Example**:
- Issue opened Monday, PR merged Thursday: 3 days
- Hotfix committed immediately: 0.25 days (6 hours)

### Defensibility Snapshot (DS)

Moat strength across four dimensions, scored 0-4 each:

#### 1. Data Exclusivity (0-4)
How unique and hard to replicate is your data?
- **0**: No proprietary data
- **1**: Common data with basic collection
- **2**: Curated datasets with some uniqueness
- **3**: Proprietary data pipeline with network effects
- **4**: Irreplaceable data moat (user behavior, domain expertise)

#### 2. Workflow Lock-In (0-4)
How embedded is your solution in user workflows?
- **0**: One-off tool, easy to swap
- **1**: Used occasionally, low switching friction
- **2**: Regular use, some workflow integration
- **3**: Deep workflow integration, API dependencies
- **4**: Mission-critical, entire business process depends on it

#### 3. Autonomous Execution (0-4)
How much does your system execute without human intervention?
- **0**: Fully manual
- **1**: Assisted manual (suggestions only)
- **2**: Semi-autonomous (human approval required)
- **3**: Mostly autonomous (humans handle exceptions)
- **4**: Fully autonomous end-to-end execution

#### 4. Switching Cost (0-4)
What's the pain of moving to a competitor?
- **0**: Free trial, instant migration
- **1**: Minimal setup, 1-day migration
- **2**: Moderate setup, 1-week migration, some data loss
- **3**: Significant integration, 1-month migration, training required
- **4**: Prohibitive cost, multi-month migration, business risk

**DS Scalar Calculation**:
```
DS = (dataExclusivity + workflowLockIn + autonomousExecution + switchingCost) / 16
```

**Range**: 0.0 to 1.0

**Example** (from default config):
```
DS = (2 + 3 + 3 + 2) / 16 = 10 / 16 = 0.625
```

### Cognitive Load (C)

Mental overhead and friction slowing down value delivery.

**Formula**:
```
C = α*K + β*U + γ*B
```

Where:
- **K**: Open decisions (ADRs/RFCs in draft/proposed state, not superseded)
- **U**: Untriaged issues (no assignee, no labels, no priority)
- **B**: Blocked items (issues/PRs with "blocked" label or dependency)
- **α, β, γ**: Weights (default 1.0 each)

**Interpretation**:
- C < 5: Low friction, healthy flow
- C = 5-15: Moderate load, manageable
- C > 15: High friction, action required

**Minimum**: 1.0 (prevents division by zero, represents minimal baseline load)

**Example**:
```
K = 2 (2 open RFCs)
U = 8 (8 untriaged issues)
B = 3 (3 blocked PRs)

C = 1.0*2 + 1.0*8 + 1.0*3 = 13
```

## Full Formula Calculation Example

**Scenario**: 
- 5 completed work items in last 30 days
- Config DS = 0.625
- Cognitive load C = 13

**Work items**:
1. P0 PR, EC=0.8, T2V=2 days, Value=300
2. P1 PR, EC=0.8, T2V=4 days, Value=200
3. P2 Issue, EC=0.6, T2V=7 days, Value=100
4. Commit, EC=0.6, T2V=3 days, Value=100
5. P1 PR, EC=0.8, T2V=5 days, Value=200

**Numerator** (total value × confidence):
```
Σ(Value * EC) = (300*0.8) + (200*0.8) + (100*0.6) + (100*0.6) + (200*0.8)
              = 240 + 160 + 60 + 60 + 160
              = 680
```

**Denominator** (total time-to-value):
```
Σ(T2V) = 2 + 4 + 7 + 3 + 5 = 21 days
```

**Base value rate**:
```
Base = 680 / 21 = 32.38 value units per day
```

**BICK score**:
```
BICK = 32.38 * 0.625 * (1 / 13)
     = 32.38 * 0.625 * 0.0769
     = 1.557
```

## Interpretation Guide

### BICK Score Ranges

- **BICK < 1**: Low value delivery, significant friction
- **BICK = 1-5**: Baseline productivity, room for improvement
- **BICK = 5-15**: Strong performance, good velocity
- **BICK > 15**: Exceptional execution, high moat

### Improvement Levers

To increase BICK, target these in priority order:

1. **Reduce Cognitive Load (C)**: Most immediate impact
   - Triage untriaged issues (reduce U)
   - Unblock blocked items (reduce B)
   - Resolve or supersede open decisions (reduce K)

2. **Improve Time-to-Value (T2V)**: Accelerate delivery
   - Reduce PR review time
   - Automate CI/CD
   - Break large issues into smaller increments

3. **Increase Execution Confidence (EC)**: Improve quality
   - Add automated tests
   - Enforce code review
   - Link PRs to issues/RFCs

4. **Increase Defensibility (DS)**: Build moat
   - Collect proprietary data
   - Deepen workflow integration
   - Increase automation
   - Raise switching costs

5. **Prioritize High-Value Work**: Strategic focus
   - Use P0/P1/P2 labels consistently
   - Estimate value impact
   - Kill low-value work

## Next-Best-Actions Algorithm

The "getting smarter" loop identifies bottlenecks and proposes actions:

```typescript
if (U > max_untriaged_threshold) {
  action = "Groom intake: triage unassigned/unlabeled issues"
}

if (B > max_blocked_threshold) {
  action = "Kill blockers: resolve dependencies / clarify acceptance criteria"
}

if (DS < 0.5) {
  action = "Increase defensibility: add automation gates + traceability (ADR/RFC links)"
}

if (average_T2V > 7 days) {
  action = "Accelerate delivery: reduce PR review time, automate more"
}

if (average_EC < 0.6) {
  action = "Improve quality: add tests, enforce reviews, link issues"
}
```

## Data Collection

### From GitHub (via `gh` CLI)

**Issues**:
```bash
gh issue list --limit 100 --json number,title,state,labels,createdAt,closedAt,assignees
```

**Pull Requests**:
```bash
gh pr list --limit 100 --state merged --json number,title,createdAt,mergedAt,labels
```

**Required fields**:
- `createdAt`, `mergedAt`/`closedAt` → compute T2V
- `labels` → extract priority (priority/P0, priority/P1, priority/P2)
- `labels` → detect blocked (status/blocked)
- `assignees` → detect untriaged (empty = untriaged)

### From Git (fallback)

```bash
git log --since=30.days --pretty=%H|%ct|%s
```

Parse subject lines for:
- Priority hints (P0, P1, P2 in message)
- Conventional Commit types (feat, fix, docs)

Use default proxies:
- T2V = 3 days
- EC = 0.6
- Value = 100

## Versioning

This canon follows semantic versioning:
- **Major**: Breaking changes to formula (requires recalibration)
- **Minor**: New components or dimensions (backward compatible)
- **Patch**: Clarifications or example updates

**Current Version**: 1.0.0

## References

- `bick.config.json`: Runtime configuration
- `AGENTS.md`: Agent contract and requirements
- `.bick/`: Ledger and snapshot storage

---

**This is the canonical reference. All implementations MUST conform to these definitions.**
