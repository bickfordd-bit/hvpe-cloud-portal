# BTI Cloud Services

This directory contains the microservices that make up the BTI Cloud execution platform.

## Services

### Public Services

#### `bti-api/`
**Purpose:** Public REST/GraphQL API for intent ingestion and status queries  
**Port:** 3000  
**Tech:** TypeScript/Express  
**Key responsibilities:**
- Accept tenant intents
- Return execution status
- Provide query interface

### Private Services

#### `optr-orchestrator/`
**Purpose:** Path selection and execution contract building  
**Tech:** TypeScript/Node.js  
**Key responsibilities:**
- Analyze intent
- Select optimal execution path
- Build execution contract
- Compute SLA/pricing plan

#### `bdc-executor/`
**Purpose:** Tool/API action execution with rollback support  
**Tech:** TypeScript/Node.js  
**Key responsibilities:**
- Execute actions via connectors
- Support rollback on failure
- Track execution state

#### `verification-service/`
**Purpose:** Proof strength grading (0-1 scale)  
**Tech:** TypeScript/Node.js  
**Key responsibilities:**
- Grade proof bundles
- Validate system-of-record readbacks
- Compute proof strength score

#### `metering-fee-engine/`
**Purpose:** Usage tracking and billing calculation  
**Tech:** TypeScript/Node.js  
**Key responsibilities:**
- Track usage dimensions
- Apply pricing tiers
- Generate invoices
- Integrate with Stripe

#### `audit-ledger-writer/`
**Purpose:** Immutable audit log writer  
**Tech:** TypeScript/Node.js  
**Key responsibilities:**
- Write append-only audit entries
- Maintain hash chains
- Ensure WORM compliance

## Development

Each service follows a standard structure:

```
service-name/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts        # Entry point
│   ├── handlers/       # Request handlers
│   ├── models/         # Data models
│   └── utils/          # Utilities
├── tests/
└── Dockerfile
```

### Running locally

```bash
cd services/bti-api
npm install
npm run dev
```

### Running with Docker

```bash
docker build -t bti-api services/bti-api
docker run -p 3000:3000 bti-api
```

## Deployment

Services are deployed as ECS Fargate tasks. See `infra/terraform/` for infrastructure configuration.

## Service Communication

- **Synchronous:** Direct HTTP calls (service-to-service)
- **Asynchronous:** EventBridge + SQS (event-driven)
- **Data:** PostgreSQL (shared via strict row-level security)

## Tenant Isolation

All services enforce tenant isolation:
- JWT token includes `tenant_id` claim
- All database queries scoped by `tenant_id`
- All queue messages tagged with `tenant_id`

## Observability

- **Logs:** CloudWatch Logs (structured JSON)
- **Traces:** AWS X-Ray
- **Metrics:** CloudWatch Metrics
- **Dashboards:** CloudWatch Dashboards

## Security

- Secrets via AWS Secrets Manager
- Per-tenant KMS encryption keys
- IAM roles for service-to-service auth
- No secrets in code or environment variables
