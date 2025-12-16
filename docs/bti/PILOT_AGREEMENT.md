# BTI Cloud Platform - Pilot Agreement

**Bickford Technologies IC**  
**Microsoft Corporation Partnership**

---

## Executive Summary

This Pilot Agreement establishes the terms for Microsoft Corporation to evaluate the **Bickford Technologies IC (BTI) Cloud Platform** — a multi-tenant, proof-gated execution platform that transforms intent into verified outcomes through autonomous orchestration.

**Core Value Proposition:**
- **Intent → Reality**: Natural language to executed outcomes with cryptographic proof
- **Proof-Gated Economics**: Revenue tied directly to verified execution success
- **Compounding Intelligence**: System learns only from verified outcomes
- **Enterprise Ready**: Multi-tenant isolation, audit trails, compliance-ready

---

## 1. Pilot Scope

### 1.1 Services Included

**BTI Cloud Platform Components:**

| Component | Description | Included in Pilot |
|-----------|-------------|-------------------|
| **OPTR Orchestrator** | Path selection and execution planning | ✓ Full Access |
| **BDC Executor** | Tool/API action execution with rollback | ✓ Full Access |
| **Verification Service** | Proof strength grading (0-1 rubric) | ✓ Full Access |
| **Metering & Billing** | Usage tracking (proof-gated) | ✓ Sandbox Mode |
| **Audit Ledger** | Immutable WORM-compliant logs | ✓ Read-Only Access |
| **Intelligence Dashboard** | T2V metrics, loop health, ROI | ✓ Full Access |

**Integration Connectors (Phase 1):**
- ✓ **Microsoft 365** (Outlook, Teams, SharePoint, OneDrive)
- ✓ **Microsoft Azure** (Resource provisioning, DevOps)
- ✓ **Jira** (Issue tracking, workflow automation)
- ✓ **Slack** (Notifications, approvals)
- Additional connectors available upon request

### 1.2 Exclusions

- Source code access (platform IP remains with Bickford Technologies IC)
- Custom connector development (available post-pilot)
- White-label/rebranding options (enterprise tier only)
- Direct database access (API-only integration)

---

## 2. Pilot Timeline

### Phase 1: Onboarding (Weeks 1-2)
- **Week 1:**
  - Kickoff meeting and architecture review
  - Microsoft tenant provisioning (test environment)
  - API credentials and authentication setup
  - Initial connector configuration (M365, Azure)
  
- **Week 2:**
  - Integration testing with Microsoft systems
  - First intent-to-execution demonstrations
  - Team training sessions (3x 2-hour workshops)

### Phase 2: Controlled Production (Weeks 3-8)
- **Weeks 3-4:**
  - 5-10 production use cases identified
  - Gradual rollout to select Microsoft teams
  - Daily monitoring and support (8am-6pm EST)
  
- **Weeks 5-6:**
  - Scale to 25-50 daily intents
  - Performance tuning and optimization
  - Feedback incorporation
  
- **Weeks 7-8:**
  - Full production capacity (100+ daily intents)
  - ROI measurement and reporting
  - Success criteria validation

### Phase 3: Evaluation (Weeks 9-12)
- **Weeks 9-10:**
  - Comprehensive performance review
  - Cost-benefit analysis
  - Security and compliance audit
  
- **Weeks 11-12:**
  - Go/No-Go decision preparation
  - Enterprise agreement negotiation (if proceeding)
  - Transition planning

**Total Duration:** 12 weeks (3 months)

---

## 3. Success Criteria

### 3.1 Performance Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Intent Success Rate** | ≥ 85% | Verified executions / total intents |
| **Proof Strength** | ≥ 0.75 avg | Verification service rubric |
| **Time-to-Value (T2V)** | < 5 minutes | Intent submission → verified completion |
| **System Uptime** | ≥ 99.5% | Monitored via AWS CloudWatch |
| **False Positive Rate** | < 5% | Manual audit of claimed successes |

### 3.2 Business Value Targets

- **Productivity Gain:** ≥ 20% reduction in manual task time
- **Error Reduction:** ≥ 30% fewer human errors in automated tasks
- **Cost Savings:** ROI ≥ 3x pilot investment within 6 months post-pilot
- **User Satisfaction:** ≥ 4.0/5.0 average rating from pilot users

### 3.3 Technical Requirements

- **Security:** Zero critical vulnerabilities, pass Microsoft security review
- **Compliance:** SOC 2 Type II audit completion (in progress)
- **Integration:** Successful bi-directional sync with all Phase 1 connectors
- **Documentation:** Complete API docs, runbooks, and troubleshooting guides

---

## 4. Responsibilities

### 4.1 Bickford Technologies IC Provides:

- ✓ BTI Cloud Platform access (dedicated Microsoft tenant)
- ✓ 24/7 platform monitoring and maintenance
- ✓ Business hours support (8am-6pm EST, weekdays)
- ✓ Integration assistance for Phase 1 connectors
- ✓ Weekly progress reports and dashboards
- ✓ Incident response (P0: 1 hour, P1: 4 hours, P2: 24 hours)
- ✓ Security patches and platform updates
- ✓ Training materials and documentation

### 4.2 Microsoft Corporation Provides:

- ✓ Designated pilot team (5-10 users minimum)
- ✓ Clear use cases and success criteria input
- ✓ API credentials for Microsoft services (OAuth, service principals)
- ✓ Feedback and bug reports (via shared Slack channel)
- ✓ Weekly check-in participation (30-minute calls)
- ✓ Security review coordination
- ✓ Go/No-Go decision by end of Week 12

---

## 5. Pricing & Payment Terms

### 5.1 Pilot Pricing

**Model:** Proof-Gated Pricing (pay only for verified executions)

| Tier | Description | Pilot Rate | Post-Pilot Rate |
|------|-------------|------------|-----------------|
| **Intent Processing** | Per verified intent | $0 (waived) | $2.50/intent |
| **Execution Time** | Per minute of compute | $0 (waived) | $0.10/minute |
| **Tool Calls** | Per API call to connectors | $0 (waived) | $0.05/call |
| **Storage** | Proof bundles, audit logs | $0 (waived) | $0.50/GB/month |
| **Support** | Business hours support | Included | Included |

**Pilot Investment:** $0 (no-cost evaluation)  
**Post-Pilot Estimate:** $5,000-$15,000/month (based on 1,000-3,000 intents/month)

### 5.2 Payment Terms (Post-Pilot)

- Invoicing: Monthly in arrears
- Payment: Net 30 days
- Billing via: Stripe (ACH/wire available for >$10k/month)
- Currency: USD

### 5.3 Guarantees

- **No Charge for Failed Executions:** If proof strength < 0.5, no charge applied
- **SLA Credits:** 10% monthly credit for each 0.1% below 99.5% uptime
- **Rollback Protection:** No charge if execution rolled back due to failure

---

## 6. Data & Security

### 6.1 Data Handling

- **Tenant Isolation:** Microsoft data stored in dedicated logical tenant
- **Encryption:** AES-256 at rest, TLS 1.3 in transit
- **Keys:** Microsoft-managed KMS keys (per-tenant)
- **Retention:** Intent logs retained for 90 days, audit logs for 7 years
- **Deletion:** Microsoft may request data deletion at any time (executed within 48 hours)

### 6.2 Security Controls

- **Authentication:** OAuth 2.0 + OIDC (Microsoft Entra ID integration)
- **Authorization:** RBAC with least-privilege access
- **Audit:** All actions logged to immutable ledger (WORM-compliant)
- **Compliance:** SOC 2 Type II (in progress), GDPR-ready, HIPAA-ready
- **Penetration Testing:** Annual third-party audits (reports shared with Microsoft)

### 6.3 Data Ownership

- **Microsoft Data:** Microsoft retains all ownership and IP rights
- **Bickford IP:** Platform technology, algorithms, models remain Bickford property
- **Generated Insights:** Microsoft owns insights derived from their data
- **Anonymized Metrics:** Bickford may use anonymized aggregate metrics for product improvement

---

## 7. Intellectual Property

### 7.1 Pre-Existing IP

- Each party retains all IP rights to pre-existing technology
- No license granted except as necessary to perform pilot services

### 7.2 Pilot-Generated IP

- **Microsoft Data/Insights:** Owned by Microsoft
- **Platform Improvements:** Owned by Bickford Technologies IC
- **Joint Innovations:** Mutually agreed ownership (case-by-case basis)

### 7.3 Confidentiality

- **Pilot Terms:** Confidential (neither party may disclose without consent)
- **Technical Details:** Confidential for 2 years post-pilot
- **Results:** May be disclosed with prior written approval

---

## 8. Termination

### 8.1 Early Termination

Either party may terminate with:
- **For Cause:** Immediate termination upon material breach (30-day cure period)
- **For Convenience:** 30 days' written notice

### 8.2 Post-Termination

- Microsoft data deleted within 48 hours (or returned if requested)
- Access credentials revoked immediately
- Audit logs retained for 7 years (compliance requirement)
- No termination fees during pilot period

---

## 9. Limitation of Liability

- **Cap:** Each party's liability limited to $100,000 (pilot period)
- **Exclusions:** Liability cap does not apply to:
  - Data breaches caused by gross negligence
  - Willful misconduct
  - IP infringement claims
  - Indemnification obligations

---

## 10. Warranties & Disclaimers

### 10.1 BTI Cloud Platform Warranties

Bickford Technologies IC warrants:
- Platform will perform substantially as described in documentation
- Services provided with reasonable care and skill
- No known malware or backdoors in platform code

### 10.2 Disclaimers

**EXCEPT AS EXPRESSLY STATED, PLATFORM PROVIDED "AS IS":**
- No warranty of uninterrupted or error-free operation
- No warranty of specific results or outcomes
- No warranty regarding third-party integrations

---

## 11. Insurance

Bickford Technologies IC maintains:
- General Liability: $2M per occurrence, $4M aggregate
- Cyber Liability: $5M per occurrence
- Errors & Omissions: $2M per occurrence

Certificates of insurance available upon request.

---

## 12. Governing Law & Disputes

- **Governing Law:** State of Delaware, USA
- **Dispute Resolution:**
  1. Good-faith negotiation (30 days)
  2. Mediation (30 days)
  3. Binding arbitration (JAMS rules)
- **Venue:** Wilmington, Delaware (if litigation required)

---

## 13. Signatures

**Bickford Technologies IC**

Signature: _______________________  
Name: Derek Bickford  
Title: Founder & CEO  
Date: _______________________

**Microsoft Corporation**

Signature: _______________________  
Name: _______________________  
Title: _______________________  
Date: _______________________

---

## Appendices

### Appendix A: Use Case Examples
1. Automated incident response (Azure → Teams → Jira)
2. Meeting action item tracking (Teams → M365 Tasks)
3. Code deployment approvals (Azure DevOps → Slack → Jira)
4. Document workflow automation (SharePoint → approvals → archive)
5. Onboarding automation (HR system → M365 → access provisioning)

### Appendix B: API Endpoints
- Intent Submission: `POST /api/v1/intents`
- Execution Status: `GET /api/v1/intents/{id}/status`
- Proof Bundles: `GET /api/v1/intents/{id}/proof`
- Metrics Dashboard: `GET /api/v1/metrics`

### Appendix C: Support Channels
- **Email:** support@bickfordtech.com
- **Slack:** #bti-pilot-microsoft (shared channel)
- **Emergency:** +1 (XXX) XXX-XXXX (P0 incidents only)
- **Documentation:** https://docs.bickfordtech.com

---

**Document Version:** 1.0  
**Last Updated:** 2025-12-16  
**Valid Through:** 2026-03-16 (3 months from start)
