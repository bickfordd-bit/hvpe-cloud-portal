# Bick-Sales: External Canonical State Directory

**Purpose**: Persistent storage for BTI Automated Sales Agent state, artifacts, and audit trail.

**Classification**: UNCLASSIFIED  
**Last Updated**: 2025-12-16

---

## Overview

This directory serves as the **external canonical memory** for the BTI Automated Sales Agent system. All sales agent state, lead intelligence, deal tracking, offers, proof artifacts, and action logs persist here to ensure:

- **Portability**: State survives system upgrades and migrations
- **Auditability**: All actions traceable to proof artifacts
- **Compliance**: Legal/regulatory access to full sales history
- **Durability**: Immutable ledger for forensic analysis

---

## Directory Structure

```
bick-sales/
├── README.md              # This file
├── state/                 # Current sales agent state
│   ├── router_state.json      # Router agent decisions and priorities
│   ├── icp_state.json         # ICP fit models and target lists
│   ├── messaging_state.json   # Active campaigns and A/B tests
│   └── pipeline_state.json    # Current deals and stage progression
├── leads/                 # Lead intelligence packages
│   ├── {lead_id}.json         # Per-lead metadata, ICP score, intent signals
│   └── lead_index.json        # Master lead list with status
├── deals/                 # Active deal files
│   ├── {deal_id}.json         # Per-deal metadata, stage, artifacts
│   └── deal_index.json        # Master deal list with close probability
├── offers/                # Offer and proposal artifacts
│   ├── {offer_id}.json        # Pricing, terms, ROI, proof artifacts
│   └── offer_templates.json   # Standard offer templates by segment
├── artifacts/             # Proof artifacts (case studies, ROI calcs, testimonials)
│   ├── case_studies/          # Customer success stories
│   ├── roi_calculators/       # ROI calculation templates
│   ├── testimonials/          # Customer testimonials
│   └── competitive_intel/     # Competitive positioning data
└── ledger/                # Immutable action log
    ├── actions_log.jsonl      # Every action with timestamp, agent, proof, outcome
    └── audit_trail.jsonl      # Compliance audit events
```

---

## State Persistence Rules

### 1. Write-Once Ledger
- **Ledger entries are append-only** (no edits or deletes)
- All actions logged to `ledger/actions_log.jsonl`
- All compliance events logged to `ledger/audit_trail.jsonl`

### 2. Versioned State
- State files are versioned (e.g., `router_state_v42.json`)
- Previous versions archived to `state/archive/`
- State updates logged to ledger

### 3. Encrypted PII
- All personally identifiable information (PII) encrypted at rest
- Encryption: AES-256-GCM with key rotation
- Key management via secure key vault (not stored in this directory)

### 4. Daily Backups
- Full state snapshot daily at 02:00 UTC
- Snapshots stored in external backup (S3, GCS, Azure Blob)
- Retention: 90 days for active data, 7 years for ledger

---

## Data Schemas

### Lead Schema (`leads/{lead_id}.json`)

```json
{
  "lead_id": "lead_12345",
  "company_name": "Acme Corp",
  "contact": {
    "name": "Jane Doe",
    "title": "VP Engineering",
    "email": "jane.doe@acme.com",
    "phone": "+1-555-123-4567",
    "linkedin": "https://linkedin.com/in/janedoe"
  },
  "icp_fit": {
    "score": 85,
    "breakdown": {
      "industry_match": 25,
      "company_size": 23,
      "pain_alignment": 22,
      "budget_authority": 15
    }
  },
  "intent_signals": [
    {
      "type": "funding_round",
      "description": "Raised $50M Series B",
      "date": "2025-11-15",
      "source": "Crunchbase"
    },
    {
      "type": "hiring",
      "description": "Hiring 3 DevOps engineers",
      "date": "2025-12-01",
      "source": "LinkedIn Jobs"
    }
  ],
  "source": "LinkedIn Sales Navigator",
  "created_at": "2025-12-10T08:30:00Z",
  "updated_at": "2025-12-15T14:22:00Z",
  "status": "qualified"
}
```

### Deal Schema (`deals/{deal_id}.json`)

```json
{
  "deal_id": "deal_67890",
  "lead_id": "lead_12345",
  "company_name": "Acme Corp",
  "deal_value": 500000,
  "currency": "USD",
  "stage": "proof_of_value",
  "close_probability": 0.70,
  "expected_close_date": "2026-01-31",
  "bant_qualification": {
    "budget": 100,
    "authority": 100,
    "need": 80,
    "timeline": 90
  },
  "champion": {
    "name": "Jane Doe",
    "title": "VP Engineering",
    "strength": 85
  },
  "proof_artifacts": [
    {
      "type": "case_study",
      "title": "Similar Enterprise SaaS Deployment",
      "file": "artifacts/case_studies/enterprise_saas_2024.pdf"
    },
    {
      "type": "roi_calculator",
      "title": "Acme Corp ROI Projection",
      "file": "artifacts/roi_calculators/acme_corp_roi.xlsx"
    }
  ],
  "next_action": {
    "type": "schedule_reference_call",
    "description": "Schedule call with existing customer",
    "expected_delta_close": 0.10,
    "due_date": "2025-12-20"
  },
  "created_at": "2025-12-01T10:00:00Z",
  "updated_at": "2025-12-16T11:45:00Z"
}
```

### Action Log Schema (`ledger/actions_log.jsonl`)

```json
{
  "action_id": "action_99999",
  "timestamp": "2025-12-16T19:30:00Z",
  "agent": "messaging_agent",
  "intent": "Send personalized outreach email to lead_12345",
  "action_type": "email_send",
  "target": {
    "lead_id": "lead_12345",
    "email": "jane.doe@acme.com"
  },
  "proof_package": {
    "icp_fit_score": 85,
    "personalization_source": "Recent funding round + hiring signals",
    "compliance_check": "pass",
    "compliance_details": "CAN-SPAM compliant, B2B exempt"
  },
  "outcome": {
    "status": "sent",
    "email_id": "msg_abc123",
    "opened": true,
    "clicked": true,
    "replied": false
  },
  "delta_close": 0.05,
  "t2v": "25000.00",
  "t2v_unit": "USD/hour"
}
```

---

## Usage

### For Developers

1. **Read state**: Load current agent state from `state/*.json`
2. **Write state**: Update state and append version
3. **Query leads**: Load `leads/lead_index.json` and filter
4. **Track deals**: Load `deals/deal_index.json` and check status
5. **Log actions**: Append to `ledger/actions_log.jsonl` (never edit)

### For Sales Teams

1. **View pipeline**: Open `deals/deal_index.json` for dashboard
2. **Check priorities**: Open `state/router_state.json` for daily report
3. **Review artifacts**: Browse `artifacts/` for case studies, ROI calcs

### For Compliance Officers

1. **Audit actions**: Query `ledger/actions_log.jsonl` for compliance events
2. **Review approvals**: Check `ledger/audit_trail.jsonl` for manual overrides
3. **Access PII**: Request decryption key from security team

---

## Security & Access Control

### Role-Based Access

| Role                | Read State | Write State | Read Ledger | Write Ledger | Read PII | Write PII |
|---------------------|------------|-------------|-------------|--------------|----------|-----------|
| Sales Rep           | ✓          | ✗           | ✗           | ✗            | ✓*       | ✗         |
| Sales Manager       | ✓          | ✓           | ✓           | ✗            | ✓        | ✗         |
| Sales Agent (AI)    | ✓          | ✓           | ✓           | ✓            | ✓        | ✓         |
| Compliance Officer  | ✓          | ✗           | ✓           | ✗            | ✓        | ✗         |
| Admin               | ✓          | ✓           | ✓           | ✓            | ✓        | ✓         |

*Sales Reps can only read PII for their assigned leads/deals.

### Encryption

- **At Rest**: All files encrypted with AES-256-GCM
- **In Transit**: All API calls use TLS 1.3
- **Key Rotation**: Encryption keys rotated every 90 days
- **Key Storage**: Keys stored in AWS KMS / Azure Key Vault / GCP Secret Manager

---

## Backup & Disaster Recovery

### Backup Schedule

- **Incremental**: Every 6 hours
- **Full Snapshot**: Daily at 02:00 UTC
- **Offsite Replication**: Real-time to secondary region

### Retention Policy

- **Active Data**: 90 days in primary storage
- **Archived Data**: 1 year in cold storage
- **Ledger Data**: 7 years (compliance requirement)

### Recovery

- **RTO (Recovery Time Objective)**: <4 hours
- **RPO (Recovery Point Objective)**: <6 hours

---

## Compliance

This directory supports compliance with:

- **CAN-SPAM Act**: Opt-out tracking in `ledger/audit_trail.jsonl`
- **GDPR**: Right to access/delete personal data
- **TCPA**: Call consent tracking in `ledger/actions_log.jsonl`
- **CCPA**: California resident data sale opt-out
- **SOC 2 Type II**: Audit trail for all data access

---

## References

- [BTI Sales Agent Architecture](../docs/bti/SALES_AGENT_ARCHITECTURE.md)
- [Canonical Framework](../docs/bick/CANON.md)
- [Agent Framework](../AGENTS.md)

---

**Maintained by**: Bickford Technologies LLC  
**Contact**: sales-ops@bickfordtech.com  
**Version**: 1.0.0

