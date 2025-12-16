# BTI Cloud Architecture

**Bickford Technologies IC (BTI) Cloud Architecture** is a **multi-tenant, proof-gated execution platform** that runs closed-loop workflows end-to-end:

**Intent → Orchestration (OPTR) → Execution (BDC) → Verification → Billing/Compounding**

It's built around **event-driven execution**, **tenant isolation**, and an **immutable audit/proof trail**.

---

## Reference Architecture (Cloud-Agnostic)

### 1) Edge + Identity

**Components:**
- **API Gateway** (public ingress)
- **AuthN/AuthZ** (OIDC/JWT + RBAC/ABAC)
- **Tenant router** (every request scoped by `tenant_id`, policy, and authority)

**Key rule:** No request executes without tenant scope + authority.

**Implementation:**
- API Gateway handles rate limiting, DDoS protection, TLS termination
- JWT tokens include `tenant_id` claim + role/permissions
- Every service validates tenant scope before execution

---

### 2) Control Plane (Configuration + Governance)

**Components:**
- **Tenant Config Service** (no-code integration: connectors, policies, SLA, pricing doctrine)
- **Policy Engine** (constraints, approvals, data handling rules)
- **Admin Console** (ops + customer admin)

**Control plane = "what is allowed."**

**Responsibilities:**
- Tenant onboarding and configuration
- Connector credentials management (Jira, Slack, M365, SAP, etc.)
- Policy definition and enforcement
- SLA tier management
- Pricing model configuration

---

### 3) Data Plane (Execution + Proof)

**Components:**
- **OPTR Orchestrator** (selects path, builds execution contract, computes SLA/pricing plan)
- **BDC Executor** (runs tool/API actions, supports rollback)
- **Event Bus** (pub/sub for all steps + retries)
- **Worker Fleet** (queue consumers for integrations and long-running tasks)

**Data plane = "what happens."**

**Flow:**
1. Intent arrives via API
2. OPTR analyzes intent, selects execution path
3. BDC executes actions via connectors
4. Events published for each step
5. Workers process async tasks
6. State updates tracked

---

### 4) Verification + Audit (The Moat)

**Components:**
- **Verification Service** (grades proof strength 0–1 using rubric)
- **Proof Bundle Store** (artifacts: receipts, logs, hashes, readbacks)
- **Immutable Audit Ledger** (append-only log of intent/execution/proof; WORM-capable)
- **System-of-record readback** (confirm state deltas from Jira/Slack/CRM/ERP/etc.)

**Hard rule:** `proof < min_strength → bill = 0, no compounding`.

**Verification Rubric (0-1 scale):**
- **0.0-0.2:** No proof or contradictory evidence
- **0.2-0.4:** Partial execution logs only
- **0.4-0.6:** Execution logs + system receipts
- **0.6-0.8:** Receipts + independent readback confirmation
- **0.8-1.0:** Full proof bundle with cryptographic hashing + multi-source validation

**Proof Bundle Contents:**
- Request payload + timestamp
- Execution trace (all steps)
- Connector API responses
- System-of-record readback (e.g., Jira issue state delta)
- Hash chain (request → execution → verification)
- Signature (service identity)

---

### 5) Billing + Metering (Proof-Gated Monetization)

**Components:**
- **Usage Meter** (intents, executions, tool calls, compute time)
- **Fee Engine** (tiers, ceilings/floors, SLA penalties, rollback rules)
- **Billing Connector** (Stripe/Chargebee/Invoices)
- **Revenue Ledger** (ties invoice line items to proof hash)

**Metering Dimensions:**
- Intent count
- Execution count (successful + failed)
- Tool/API calls per connector
- Compute time (execution duration)
- Verification attempts

**Pricing Tiers:**
- **T1 (Standard):** Pay-per-use, standard SLA
- **T2 (Professional):** Volume discount, priority execution
- **T3 (Enterprise):** Custom pricing, dedicated resources, highest SLA

**Billing Rules:**
- Only verified executions generate revenue
- Failed executions with rollback = no charge
- SLA violations = automatic credit
- Proof strength < threshold = no charge

---

### 6) Intelligence + Compounding

**Components:**
- **Telemetry Store** (events, deltas, T2V)
- **Feature Store / Rules Store** (what gets updated from verified outcomes)
- **Model/Rule Update Pipeline** (only consumes verified outcomes)
- **Dashboards** (T2V, verification, loop health, ROI)

**Compounding Loop:**
1. Verified execution generates telemetry
2. Telemetry enriches feature store
3. Models/rules updated from verified patterns
4. Future executions become smarter
5. T2V decreases, success rate increases

**Key Metrics:**
- Time-to-Value (T2V) per intent type
- Verification success rate
- Proof strength distribution
- Revenue per tenant
- Compounding velocity (how fast system improves)

---

## Minimal Service Map

### Public Services

| Service | Purpose | Technology |
|---------|---------|------------|
| `bti-api` | REST/GraphQL API | Next.js API Routes |
| `tenant-console` | Web UI | Next.js App Router |
| `webhook-ingress` | External callbacks | Express/Next.js API |

### Private Services

| Service | Purpose | Technology |
|---------|---------|------------|
| `optr-orchestrator` | Path selection, contract building | TypeScript/Node.js |
| `bdc-executor` | Tool/API execution | TypeScript/Node.js |
| `verification-service` | Proof grading | TypeScript/Node.js |
| `metering-fee-engine` | Usage tracking, billing | TypeScript/Node.js |
| `connector-workers/*` | Integration workers | TypeScript/Node.js |
| `audit-ledger-writer` | Immutable audit log | TypeScript/Node.js |

### Data Stores

| Store | Purpose | Technology |
|-------|---------|------------|
| Relational DB | Tenants, configs, loop state | PostgreSQL (Prisma) |
| Object Store | Proof bundles | S3/CloudStorage |
| Log Store | Events, traces | CloudWatch/Stackdriver |
| Warehouse | Analytics, reporting | BigQuery/Redshift |

---

## Tenant Isolation (3 Acceptable Patterns)

### A) Strong Isolation (Defense / Regulated)

**Use case:** Government, healthcare, highly regulated industries

**Architecture:**
- Separate AWS accounts/projects per tenant (or per tenant group)
- Dedicated encryption keys per tenant
- Network isolation (VPC per tenant)
- Dedicated compute resources

**Pros:** Maximum security, compliance friendly
**Cons:** Higher cost, more operational overhead

---

### B) Standard SaaS Isolation (Recommended Default)

**Use case:** Most commercial customers

**Architecture:**
- Shared compute infrastructure
- **Strict row-level security** (RLS) in database
- Per-tenant encryption keys (KMS/HSM-backed)
- Tenant-scoped queues/topics (logical isolation)
- Per-tenant secrets namespaces

**Pros:** Cost-efficient, scalable, standard practice
**Cons:** Requires careful security implementation

**Implementation details:**
```sql
-- Row-level security example (PostgreSQL)
CREATE POLICY tenant_isolation ON executions
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

---

### C) Hybrid

**Use case:** Mix of standard and high-value customers

**Architecture:**
- Shared control plane (config, billing, admin)
- Dedicated data plane for high-value tenants
- Standard SaaS isolation for others

**Pros:** Flexibility, premium offering
**Cons:** More complex operations

---

## Security Essentials (Non-Negotiable)

### Secrets Management
- **No secrets in repo** (use AWS Secrets Manager, HashiCorp Vault, etc.)
- Automatic rotation (30-90 days)
- Least privilege access (IAM roles, service accounts)
- Audit all secret access

### Encryption
- **Per-tenant encryption keys** (KMS/HSM-backed)
- Encrypt at rest (DB, object storage)
- Encrypt in transit (TLS 1.3)
- Key rotation policy

### Authentication & Authorization
- OIDC/JWT for API authentication
- RBAC for service-to-service
- ABAC for fine-grained permissions
- MFA for admin access

### Network Security
- **Egress allowlist** for integrations (only allow known connector endpoints)
- Private subnets for services
- NAT gateway for outbound
- WAF for API gateway

### Audit & Compliance
- **Signed proof bundles** (hash chains)
- **WORM / immutable audit** (write-once-read-many for verification credibility)
- Tamper detection
- Compliance exports (SOC2, GDPR, HIPAA)

### Additional Hardening
- **mTLS for high-assurance connectors** (optional, for regulated industries)
- Container scanning (vulnerabilities)
- Dependency scanning
- Regular penetration testing

---

## Deployment + Reliability

### Containerization
- All services containerized (Docker)
- Orchestration via Kubernetes or managed container service (ECS, Cloud Run)
- Helm charts for K8s deployments

### Queue & Workers
- Background workers with queues (SQS, Pub/Sub)
- Retry logic with exponential backoff
- Dead Letter Queue (DLQ) for failed messages
- Idempotency keys

### Observability
- **Distributed tracing** (OpenTelemetry, Jaeger, X-Ray)
- **Metrics** (Prometheus, CloudWatch)
- **Structured logs** (JSON, with tenant_id, request_id)
- Dashboards (Grafana, Datadog)

### SLOs & SLAs
- **T1 (Standard):** 99.5% uptime, best-effort latency
- **T2 (Professional):** 99.9% uptime, <500ms P95 latency
- **T3 (Enterprise):** 99.99% uptime, <200ms P95 latency, dedicated support

### CI/CD
- Infrastructure as Code (Terraform, Pulumi)
- GitOps workflow
- Automated testing (unit, integration, e2e)
- Blue-green or canary deployments
- Rollback procedures

### Disaster Recovery
- Cross-region replication (critical data)
- Automated backups (daily, 30-day retention)
- Disaster recovery plan (RPO: 1 hour, RTO: 4 hours)
- Regular DR drills

---

## AWS Implementation (Concrete Example)

### Services Mapping

| Component | AWS Service | Notes |
|-----------|-------------|-------|
| API Gateway | API Gateway + ALB | ALB for internal, API Gateway for external |
| Compute | ECS Fargate / Lambda | Fargate for long-running, Lambda for event-driven |
| Event Bus | EventBridge + SQS | EventBridge for routing, SQS for queues |
| Database | RDS PostgreSQL | Multi-AZ, automated backups |
| Object Store | S3 | Versioning enabled, lifecycle policies |
| Secrets | Secrets Manager | Automatic rotation |
| Encryption | KMS | Per-tenant keys |
| Logs | CloudWatch Logs | Log groups per service |
| Tracing | X-Ray | Integrated with SDK |
| Auth | Cognito + IAM | Cognito for users, IAM for services |
| Networking | VPC + PrivateLink | Private subnets, VPC endpoints |

### Folder Layout

```
hvpe-cloud-portal/
├── infra/
│   ├── terraform/
│   │   ├── modules/
│   │   │   ├── networking/
│   │   │   ├── compute/
│   │   │   ├── database/
│   │   │   ├── security/
│   │   │   └── observability/
│   │   ├── environments/
│   │   │   ├── dev/
│   │   │   ├── staging/
│   │   │   └── prod/
│   │   └── main.tf
│   ├── aws/
│   │   ├── cloudformation/
│   │   └── cdk/
│   └── configs/
│       ├── policies/
│       └── secrets.example.yaml
├── services/
│   ├── bti-api/
│   ├── optr-orchestrator/
│   ├── bdc-executor/
│   ├── verification-service/
│   ├── metering-fee-engine/
│   └── audit-ledger-writer/
└── docs/
    └── bti/
        ├── CLOUD_ARCHITECTURE.md (this file)
        ├── DEPLOYMENT_GUIDE.md
        └── RUNBOOK.md
```

---

## One-Line Canonical Definition

**BTI Cloud is a multi-tenant, event-driven execution fabric where verification is the gate for both revenue and learning.**

---

## Integration with Existing HVPE Portal

The BTI cloud architecture extends the existing HVPE Cloud Portal:

1. **OPTR** (existing) becomes the orchestration layer
2. **Stripe** (existing) integrates with metering-fee-engine
3. **Prisma/PostgreSQL** (existing) extended with tenant isolation
4. **Next.js API routes** (existing) become the bti-api surface
5. **BICK metrics** (existing) feed into intelligence/compounding layer

**Migration path:**
- Phase 1: Add tenant isolation to existing schema
- Phase 2: Extract orchestrator + executor as separate services
- Phase 3: Add verification + proof storage
- Phase 4: Implement metering + proof-gated billing
- Phase 5: Close compounding loop with verified outcomes

---

## Next Steps

1. Review this architecture with stakeholders
2. Define initial tenant isolation pattern (B recommended)
3. Create Terraform modules for core infrastructure
4. Implement tenant-scoped API authentication
5. Build proof verification rubric
6. Integrate with existing Stripe billing

**Status:** Draft - awaiting review
**Version:** 1.0.0
**Last Updated:** 2025-12-16
