# Agent Contract: Always Speak BICK

This repository operates in **BICK mode by default**. All AI agents, tools, and automation systems working in this repository **MUST** use the BICK framework for planning, decision-making, and reporting.

## What is BICK?

**BICK** (Bickford Intent-Cognitive-Knowledge) is a mathematical framework for measuring and optimizing work value delivery:

```
BICK_planner = ( Σ(Value(w) * EC(w)) / Σ(T2V(w)) ) * DS * (1 / C)
```

Where:
- **Value(w)**: Expected realized value units for work item w
- **EC(w)**: Execution Confidence (traceability + tests + review gates), 0-1
- **T2V(w)**: Time-to-Value (intent → merge cycle time in days)
- **DS**: Defensibility Snapshot (data exclusivity, workflow lock-in, autonomous execution, switching cost), 0-1 scalar
- **C**: Cognitive Load (αK + βU + γB) where K=open decisions, U=untriaged items, B=blocked items

## Agent Requirements

### 1. Default Operating Mode
All agents working in this repository must:
- Compute BICK scores when analyzing project health
- Use BICK terminology in reports and recommendations
- Write BICK snapshots to `.bick/` directory
- Follow the canonical definitions in `docs/bick/CANON.md`

### 2. Decision Framework
When making planning decisions, agents must:
- Prioritize work items by Value * EC / T2V ratio
- Identify and surface cognitive load bottlenecks (untriaged, blocked items)
- Recommend actions that increase defensibility (DS)
- Track work through the full formula lifecycle

### 3. Reporting Standards
All agent reports should include:
- Current BICK score and trend
- Component breakdown (numerator, denominator, DS, C)
- Next-best-actions derived from bottleneck analysis
- Ledger snapshots in `.bick/snapshot-{timestamp}.json`

### 4. Continuous Improvement Loop
Agents must participate in the "getting smarter" loop:
1. **Measure**: Collect real repo signals (issues, PRs, commits)
2. **Decide**: Compute BICK and identify bottlenecks
3. **Execute**: Propose/implement next-best-actions
4. **Learn**: Update ledger, track delta over time

## Tools and Commands

The repository provides a `bick` CLI tool for agents to use:

```bash
# Initialize BICK ledger
bick init

# Compute current BICK score (JSON output)
bick score

# Generate human-readable report
bick report

# Get next-best-actions for improvement
bick tick
```

## Configuration

BICK behavior is controlled by `bick.config.json` at repo root:
- **weights**: Formula component weights
- **thresholds**: Max untriaged/blocked items
- **defensibility_snapshot**: Current DS dimensions (0-4 each)
- **value_model**: Default values and priority multipliers

## Enforcement

This contract is enforced by:
1. GitHub Actions running `bick` on every PR
2. Copilot instructions requiring BICK-aware responses
3. Ledger immutability (append-only `.bick/snapshot-*.json`)
4. Code review requiring BICK impact analysis

## Getting Started

New agents should:
1. Read `docs/bick/CANON.md` for canonical formula definitions
2. Review `bick.config.json` for current weights and thresholds
3. Run `bick report` to see current repo state
4. Use BICK terminology in all communications

---

**Remember**: BICK is not just a metric—it's the language of this repository. Every commit, PR, and decision should be evaluated through the BICK lens.

**Version**: 1.0  
**Last Updated**: 2025-12-15  
**Canonical Reference**: `docs/bick/CANON.md`
