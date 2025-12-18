## Microsoft Asset 360 Copilot – Pilot Scope (Canonical Draft)

> Update values in **bold** brackets when Microsoft fills in the blanks. Structure and obligations must remain unchanged unless canon is updated at `src/lib/btiCanon.ts`.

### 1. Participants
- **Customer:** Microsoft Corporation – Asset 360 Copilot Program  
- **Execution Partner:** Bickford Technologies, Inc. (BTI)  
- **Environment:** Azure / Copilot production-aligned sandbox with rollback controls

### 2. Intent Classes (Initial Cohort)
| Intent Class | Description | Volume / Day | Baseline T2V | Notes |
| --- | --- | --- | --- | --- |
| Asset health packet refresh | Copilot surfaces maintenance remediation tasks | **XX** | **YY hrs** | Requires ERP + IoT connectors |
| SLA variance alert | Copilot notifies about service-level breach | **XX** | **YY hrs** | High urgency; rollback required |
| Executive summary build | Copilot composes sale-ready packet | **XX** | **YY hrs** | Proof bundle includes PDF + metadata |

*(Replace placeholders with real Microsoft data during Scope Lock.)*

### 3. Success Metrics
- **T2V Improvement:** ΔT2V ≥ **35%** vs agreed baseline.  
- **Execution Confidence:** C_exe ≥ 0.85 for every packet (no degraded path).  
- **Verification Strength:** ≥ 0.6 (numeric score from BTI verification service).  
- **Proof Bundle:** Hashable artifact stored in Dynamo ledger + S3 Object Lock per intent.  
- **Rollback:** Mean rollback completion time ≤ **15 minutes** when invoked.  
- **Billing Gate:** No Stripe/Microsoft usage record until verification passes.

### 4. Responsibilities
**Microsoft**
- Provide data/API access for the scoped intent classes.  
- Ensure Copilot surfaces are wired to send intent payloads + metadata to BTI.  
- Identify pilot owner (business) and technical counterpart (engineering).  
- Run joint weekly review (BICK dashboard + pilot metrics).  

**BTI**
- Maintain OPTR + BDC executor services for all pilot packets.  
- Operate verification + ledger + billing hooks.  
- Supply Outcome Screen access + audit exports on demand.  
- Provide rollback tooling + incident bridge if SLA risk is detected.  

### 5. Proof & Contract Terms
- **Proof Law:** No proof ⇒ no payment, no learning.  
- **Contract:** Pilot agreement binds Microsoft to execution SLA and BTI to proof/rollback obligations.  
- **Data Residency:** All artifacts remain in Microsoft-approved AWS regions, exportable for audit.  
- **Security:** Tenant-isolated compute, per-tenant KMS keys, Secrets Manager credentials, VPC endpoints only.  
- **Compliance:** Immutable ledger exports available for Microsoft compliance review (CSV + JSON).  

### 6. Timeline
| Milestone | Owner | Target Date |
| --- | --- | --- |
| Scope lock workshop | Joint | **DATE** |
| Pilot agreement signature | Legal (both) | **DATE** |
| Intent stream live | Microsoft | **DATE** |
| First proofed packet | BTI | **DATE** |
| Pilot review #1 | Joint | **DATE** |
| Production decision | Microsoft | **DATE** |

### 7. Deliverables
1. Signed pilot agreement referencing this scope.  
2. Live dashboard (Outcome Screen) showing Intent → Proof pipeline.  
3. Weekly log bundle (CSV + JSON) for Microsoft admin/compliance.  
4. Stripe/Microsoft billing export tied to proof hashes (even if zero-dollar during pilot).  
5. Retro memo summarizing ΔT2V, risk removal, and recommended production rollout.

### 8. Acceptance
Pilot considered successful when:
1. All scoped intent classes reach verification strength ≥ threshold with ΔT2V ≥ target.  
2. Microsoft receives at least **10** verifiable proof bundles with matching ledger entries.  
3. Joint review confirms readiness to move to production SLA or expanded scope.
