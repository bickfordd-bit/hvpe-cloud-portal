# BTI (Bickford Technologies IC) Documentation

This directory contains architecture and operational documentation for the BTI Cloud platform.

## Documents

### [CLOUD_ARCHITECTURE.md](./CLOUD_ARCHITECTURE.md)
Comprehensive cloud architecture specification including:
- Reference architecture (cloud-agnostic)
- Service map and responsibilities
- Tenant isolation patterns
- Security essentials
- AWS implementation details
- Integration with existing HVPE portal

## Quick Links

- **Infrastructure:** `../../infra/`
- **Services:** `../../services/`
- **BICK CLI:** `../../tools/bick-cli/`
- **BICK Canon:** `../bick/CANON.md`

## Overview

BTI Cloud is a multi-tenant, proof-gated execution platform with the flow:

```
Intent → Orchestration (OPTR) → Execution (BDC) → Verification → Billing/Compounding
```

## Key Principles

1. **Tenant Isolation:** Every request scoped by tenant_id
2. **Proof-Gated:** No revenue without verification
3. **Event-Driven:** All execution via event bus
4. **Immutable Audit:** WORM-capable append-only ledger
5. **Compounding:** Only verified outcomes train the system

## Getting Started

1. Read [CLOUD_ARCHITECTURE.md](./CLOUD_ARCHITECTURE.md)
2. Review `infra/terraform/` for infrastructure setup
3. Explore `services/` for microservice implementations
4. Check `AGENTS.md` for BICK integration

## Status

- **Architecture:** Draft v1.0.0
- **Implementation:** Scaffolding phase
- **Target Cloud:** AWS
- **Billing:** Stripe (existing integration)
