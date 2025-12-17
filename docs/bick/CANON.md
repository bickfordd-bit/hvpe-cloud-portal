# Bickford Canonical Framework

**Document Type**: System Principles & Integration Contract  
**Classification**: UNCLASSIFIED  
**Last Updated**: 2025-12-16

---

## Executive Summary

This document establishes the **canonical principles** that govern all Bickford systems, including the Intent-to-Reality engine, OPTR opportunity analysis, and BTI Sales Agent.

**Core Principle**: **No action executes without proof**.

---

## 1. Proof-Gated Execution

All Bickford systems operate under a **proof-gated contract**:

```
Action a is executable if and only if:
  1. Proofable(a) = true  (Verifiable evidence exists)
  2. ΔValue(a) ≥ 0        (Does not decrease expected value)
  3. CustomerBurden(a) ≤ threshold  (For sales: minimizes buyer friction)
```

This applies to:
- **Intent-to-Reality transformations**: User intent → Manifestation plan requires proof of feasibility
- **OPTR opportunity analysis**: Opportunity scoring → Decision requires proof artifacts (documents, intel, scoring trace)
- **BTI Sales Agent**: Sales action → Execution requires proof of positive impact on close probability **and minimal customer burden**

---

## 2. OPTR-T2V Framework Integration

The **OPTR-T2V** (Operational Throughput → Time-to-Value) framework is the mathematical foundation for all Bickford execution systems.

### 2.1 Canonical T2V Equation

```
T2V(a) = (E_before - E_after) / dt
```

Where:
- **E_before**: Expected value before action `a`
- **E_after**: Expected value after action `a`
- **dt**: Time required to execute action `a`

**Objective**: Maximize T2V by selecting actions with highest **value acceleration per unit time**.

### 2.2 T2V in Sales (BTI Sales Agent)

For sales actions, T2V translates to:

```
T2V_sales(a) = [ΔClose(a) × Deal_Value] / [dt_sales + λ × CustomerBurden(a)]
```

Where **λ** (lambda) = customer burden weight factor (default: 2.0), reflecting that 1 minute of buyer time costs 2 minutes of sales time.

**Example**:
- **Deal**: $500K ARR at 60% close probability
- **Action**: Share case study (dt_sales = 1 hour, CustomerBurden = 35)
- **Impact**: ΔClose = +10% (60% → 70%)
- **Value gain**: $500K × 0.10 = $50K
- **Total cost**: 1 hour + (2.0 × 35/60) = 2.17 hours
- **T2V**: $50K / 2.17 hours = **$23K per hour**

**Rule**: Sales agents prioritize actions with highest T2V, **penalizing actions that burden customers**. Quality over quantity. Relevance over volume.

---

## 3. Proof Artifact Requirements

Every action requires a **proof package** before execution.

### 3.1 OPTR Opportunity Analysis

**Proof artifacts**:
- Scored requirements with reasoning trace
- Retrieved documents with relevance scores
- Embedding similarity scores
- Opportunity metadata (title, description, source)

**Gate**: Opportunity must have ≥3 high-confidence scored requirements to proceed to execution.

### 3.2 BTI Sales Agent

**Proof artifacts** (see [BTI Sales Agent Architecture](../bti/SALES_AGENT_ARCHITECTURE.md) for full details):
- **ICP fit score** with breakdown (industry, size, pain, budget)
- **Intent signals** (funding, hiring, tech stack changes)
- **ROI calculation** with buyer-specific inputs
- **Case studies** (≥2 from similar industry/size)
- **Compliance validation** (CAN-SPAM, GDPR, TCPA)

**Gate**: Sales action must have ΔClose(a) ≥ 0 and complete proof package to execute.

### 3.3 Intent-to-Reality Engine

**Proof artifacts**:
- Feasibility analysis (technical, financial, temporal)
- Risk assessment with mitigation plan
- Step-by-step execution plan
- Success metrics and verification criteria

**Gate**: Manifestation plan must have ≥80% feasibility score to proceed.

---

## 4. Cross-System Integration

Bickford systems are **composable** and share a common proof-gated contract.

### 4.1 OPTR → Sales Pipeline

**Integration flow**:
1. **OPTR identifies opportunity** (e.g., "DOD needs faster procurement")
2. **OPTR scores opportunity** (ICP fit, budget, timeline)
3. **OPTR generates proof package** (intel docs, scoring trace)
4. **BTI Sales Agent receives qualified opportunity**
5. **BTI Sales Agent generates outreach + proof artifacts**
6. **BTI Sales Agent tracks deal → close**

**Result**: End-to-end pipeline from **market intelligence → closed revenue**.

### 4.2 Intent → OPTR → Sales

**Integration flow**:
1. **User states intent**: "I want to sell OPTR to DOD buyers"
2. **Intent-to-Reality engine validates feasibility**
3. **OPTR identifies target opportunities** (contracts, procurement notices)
4. **BTI Sales Agent generates outreach** to qualified leads
5. **BTI Sales Agent closes deals** with proof-backed offers

**Result**: **Intent → Reality** in <7 days (from idea to first sales conversation).

---

## 5. Audit & Compliance

All Bickford systems maintain **immutable audit trails**.

### 5.1 Ledger Structure

```
/bick-canonical/
├── optr_ledger/
│   ├── opportunities_log.jsonl     # All OPTR opportunities processed
│   ├── actions_log.jsonl           # All OPTR actions executed
│   └── audit_trail.jsonl           # Compliance events
├── sales_ledger/                   # See /bick-sales/ledger/
│   ├── actions_log.jsonl
│   └── audit_trail.jsonl
└── intent_ledger/
    ├── intents_log.jsonl           # All user intents received
    └── manifestations_log.jsonl    # All reality transformations executed
```

### 5.2 Audit Requirements

- **Write-Once**: Ledger entries are **append-only** (no edits/deletes)
- **Timestamped**: Every entry includes UTC timestamp
- **Attributed**: Every entry includes actor (user ID, agent ID)
- **Proofed**: Every entry includes proof package reference

---

## 6. Canonical State Directory

All Bickford systems persist state to **external canonical directories** to ensure portability and auditability.

### 6.1 Directory Layout

```
/bick-canonical/
├── README.md              # Explains canonical state structure
├── optr/                  # OPTR system state
│   ├── opportunities/
│   ├── embeddings/
│   └── results/
├── sales/                 # BTI Sales Agent state (see /bick-sales/)
│   ├── leads/
│   ├── deals/
│   └── offers/
└── intent/                # Intent-to-Reality state
    ├── intents/
    └── manifestations/
```

**Note**: `/bick-sales/` is a symlink to `/bick-canonical/sales/` for backward compatibility.

---

## 7. Agent Roles & Responsibilities

All Bickford agents are **specialists under the same proof-gated contract**.

### 7.1 Common Agent Contract

Every agent must:
1. **Receive intent** (natural language or structured command)
2. **Generate artifacts** (analysis, recommendations, actions)
3. **Provide proof package** (evidence, reasoning trace, validation)
4. **Execute only if proof passes** (ΔValue ≥ 0, compliance check passes)
5. **Log to immutable ledger** (action, proof, outcome)

### 7.2 Specialist Agents

- **OPTR Processor**: Analyzes opportunities, scores requirements, retrieves documents
- **Intent Transformer**: Converts user intent to executable manifestation plan
- **Sales Router**: Triages sales intents and routes to specialist sales agents
- **ICP Builder**: Identifies and qualifies target accounts
- **Messaging Agent**: Generates personalized outreach
- **Proof & Offer Agent**: Constructs offers backed by proof
- **Deal Desk Agent**: Structures deals and pricing
- **QA/Compliance Agent**: Validates all actions meet legal and ethical standards

**Reference**: See [BTI Sales Agent Architecture](../bti/SALES_AGENT_ARCHITECTURE.md) for detailed sales agent roles.

---

## 8. Operational Modes

Bickford systems support two operational modes:

### 8.1 Manual Mode (Default)

- Agent generates artifacts and recommendations
- User reviews and approves
- Agent executes and logs
- **Use case**: High-value decisions, first-time actions, material impact (ΔValue ≥ 20%)

### 8.2 Autonomous Mode (Opt-In)

- Agent generates artifacts
- Agent validates proof and compliance
- Agent executes without user approval (if ΔValue ≥ 0)
- Agent logs and notifies user
- **Use case**: Low-risk actions, routine workflows, proven playbooks

**Switching**: User configures per workflow or per action threshold.

---

## 9. Success Metrics

All Bickford systems track:

### 9.1 Operational Metrics

- **T2V**: Time from intent to value realization
- **Proof Quality**: % of actions with complete proof packages
- **Compliance Rate**: % of actions passing compliance checks on first try
- **Execution Accuracy**: % of predicted outcomes matching actual outcomes

### 9.2 Business Metrics

- **Revenue Impact**: $ closed revenue attributed to Bickford systems
- **Cost Savings**: $ saved by automating low-value work
- **Velocity**: Days to close (sales), days to execute (ops)
- **Win Rate**: % of opportunities → closed deals

---

## 10. Future Enhancements

### 10.1 Cross-Agent Learning

- Agents share learnings via canonical state
- OPTR insights feed sales targeting
- Sales outcomes inform OPTR scoring models

### 10.2 Multi-Tenant Deployment

- Bickford Framework as SaaS platform
- Custom agent configurations per tenant
- Shared proof artifact marketplace

### 10.3 Real-Time Collaboration

- Multi-agent orchestration (OPTR + Sales + Intent)
- Live proof package generation
- Human-agent co-execution

---

## 11. References

- [OPTR Mathematical Framework](/docs/OPTR_MATHEMATICAL_FRAMEWORK.md)
- [OPTR-T2V Framework](/docs/OPTR_T2V_FRAMEWORK.md)
- [BTI Sales Agent Architecture](/docs/bti/SALES_AGENT_ARCHITECTURE.md)
- [DOD Digital Thread Governance](/docs/DOD_DIGITAL_THREAD_GOVERNANCE.md)

---

**Document Owner**: Bickford Technologies LLC  
**Contact**: canonical@bickfordtech.com  
**Version**: 1.0.0  
**Status**: Active

