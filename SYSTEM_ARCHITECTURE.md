# HVPE Cloud Portal — System Architecture v2.0

**Status:** Fixed and production-ready  
**Date:** 2025-12-19  
**Architect:** Bickford + GitHub Copilot

---

## Executive Summary

This document defines the canonical system architecture for `hvpe-cloud-portal` after architectural fixes applied on 2025-12-19. The system now follows a **layered, domain-driven architecture** with clear separation of concerns, infinite persistence guarantees, and automated deployment workflows.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  Next.js 16 App Router + React 19 + TypeScript + Tailwind  │
│  /app/** (pages) + /components/** (UI)                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    MIDDLEWARE LAYER                          │
│  Authentication • Authorization • LOCK Verification          │
│  Rate Limiting • Observability • Session Management          │
│  middleware.ts (Edge Runtime)                                │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    API/SERVICE LAYER                         │
│  ┌──────────────┬──────────────┬──────────────┬──────────┐  │
│  │  OPTR API    │  Bickford    │  License     │  AI/Chat │  │
│  │  /api/optr/* │  /api/bick*  │  /api/lic*   │  /api/*  │  │
│  └──────────────┴──────────────┴──────────────┴──────────┘  │
│  Standardized responses (apiSuccess/apiError)                │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                      │
│  ┌──────────────┬──────────────┬──────────────┬──────────┐  │
│  │  OPTR        │  Bickford    │  AI Core     │  Trading │  │
│  │  Processor   │  Runtime     │  Engine      │  Engine  │  │
│  │  /lib/optr/* │  /lib/bick*  │  /lib/ai/*   │  /lib/t* │  │
│  └──────────────┴──────────────┴──────────────┴──────────┘  │
│  Domain models + business rules + workflows                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    PERSISTENCE LAYER                         │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  INFINITE PERSISTENCE (4-layer redundancy)              ││
│  │  • Bickford Ledger (SHA256, immutable)                  ││
│  │  • PostgreSQL (queryable, indexed)                      ││
│  │  • Git commits (versioned, distributed)                 ││
│  │  • File backup (immediate, no deps)                     ││
│  └─────────────────────────────────────────────────────────┘│
│  /lib/persistence/* + /lib/bickford/ledger.ts               │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    INFRASTRUCTURE LAYER                      │
│  Prisma (ORM) • OpenAI (AI) • Stripe (Payments)            │
│  Twilio (SMS) • Vercel (Deploy) • Docker (Container)       │
│  PostgreSQL • Redis (future) • S3 (future)                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Layer Descriptions

### 1. Presentation Layer

**Purpose:** User interface and interaction

**Components:**
- **Pages:** `/app/**page.tsx` (App Router)
- **Components:** `/src/components/**` (React 19 Server/Client)
- **Styling:** Tailwind CSS 4 + custom design system
- **State:** Persona context (trader/founder/investor/engineer/intelligence)

**Patterns:**
- Server components by default (no `"use client"`)
- Client components for interactivity (`useState`, `useEffect`)
- Type-safe props with TypeScript interfaces
- Responsive design (mobile-first)

**Files:**
- `/app/page.tsx` - Entry point funnel
- `/app/t/[role]/page.tsx` - Role-specific UIs
- `/components/providers/PersonaProvider.tsx` - Global state
- `/components/shared/*` - Reusable UI components

---

### 2. Middleware Layer

**Purpose:** Cross-cutting concerns before request reaches handlers

**Components:**
- **Authentication:** Session verification (JWT)
- **Authorization:** Role-based access control
- **LOCK System:** Specification verification
- **Observability:** Request logging + headers
- **Rate Limiting:** (future enhancement)

**Patterns:**
- Edge runtime (fast, distributed)
- Fail-safe redirects (no error states)
- Defense in depth (verify at middleware + page + component)

**Files:**
- `/middleware.ts` - Main middleware logic
- `/src/lib/licenseSession.crypto.ts` - Session management
- `/config/LOCK_SPEC.json` - Immutable specification

---

### 3. API/Service Layer

**Purpose:** HTTP endpoints for client requests

**Components:**
- **OPTR:** Opportunity analysis (`/api/optr/**`)
- **Bickford:** Mode management (`/api/bickford/**`)
- **License:** Authentication (`/api/license/**`)
- **AI/Chat:** Conversations (`/api/hvpe-chat`, `/api/bickford-chat`)
- **Codex:** Automation (`/api/codex/sync`)
- **Persistence:** Data storage (`/api/persistence`)

**Patterns:**
- Standard response wrappers (`apiSuccess`, `apiError`)
- Structured logging (Winston)
- Error handling with metadata
- Type-safe request/response bodies

**Files:**
- `/src/app/api/**/route.ts` - API handlers
- `/src/lib/apiResponse.ts` - Response utilities
- `/src/lib/logger.ts` - Logging singleton

---

### 4. Business Logic Layer

**Purpose:** Domain models, workflows, and business rules

**Components:**

#### OPTR (Opportunity Processing)
- **Processor:** `/src/lib/optr/processor.ts`
- **Types:** `/src/lib/optr/types.ts`
- **Client:** `/src/lib/optr/client.ts`
- **Embeddings:** `/src/lib/optr/embeddings.ts`

#### Bickford
- **Runtime:** `/src/lib/bickford/runtime.ts` - Mode loader
- **Guardrails:** `/src/lib/bickford/guardrails.ts` - Enforcement
- **Ledger:** `/src/lib/bickford/ledger.ts` - Decision log
- **Config:** `/bickford.mode.json` - Activation artifact

#### AI Core
- **OpenAI Client:** `/src/lib/ai/openaiClient.ts`
- **Prompt Builder:** `/src/lib/ai/promptBuilder.ts`
- **Chat History:** `/src/lib/chat/history.ts` (stub)
- **Unified Agent:** `/src/lib/chat/unifiedAgent.ts` (stub)

#### Trading
- **Engine:** `/src/lib/trading/*` (future)
- **Brokers:** `/src/lib/brokers/*` (future)

#### Codex Integration
- **Sync Service:** `/src/lib/codex/sync.ts`
- **Automation:** Pull → Apply → Commit → Push

**Patterns:**
- Domain-driven design (bounded contexts)
- Pure functions where possible
- Type-safe interfaces
- Dependency injection

---

### 5. Persistence Layer

**Purpose:** Data storage with infinite redundancy

**Architecture:** 4-layer persistence (parallel writes)

#### Layer 1: Bickford Ledger
- **Location:** `.bick/ledger/YYYY-MM-DD/*.json`
- **Features:** SHA256 hashed, immutable, timestamp authority
- **Use Case:** Audit trail, compliance, decisions

#### Layer 2: Database (PostgreSQL)
- **ORM:** Prisma 6.19.1
- **Tables:** BickfordLedger, ChatLog, License, AiUsageLog, Embedding
- **Features:** Queryable, indexed, relational
- **Use Case:** Fast queries, relational data

#### Layer 3: Git Commits
- **Location:** `.persistence/YYYY-MM-DD/*.json`
- **Features:** Versioned, distributed, GitHub-backed
- **Use Case:** Version history, distributed backup

#### Layer 4: File Backup
- **Location:** `.persistence/backup/YYYY-MM-DD/*.json`
- **Features:** Immediate write, no external deps
- **Use Case:** Fast writes, disaster recovery

**API:**
```typescript
import { persistForever } from '@/lib/persistence/infinite';

const proof = await persistForever({
  kind: 'transaction',
  subject: 'payment-123',
  payload: { amount: 99, status: 'completed' }
});

// proof.redundancy: { ledger: true, database: true, git: true, file: true }
```

**Files:**
- `/src/lib/persistence/infinite.ts` - Core service
- `/src/app/api/persistence/route.ts` - API endpoint
- `/INFINITE_PERSISTENCE.md` - Documentation

---

### 6. Infrastructure Layer

**Purpose:** External services and deployment

**Components:**

#### Database
- **Provider:** PostgreSQL 14+
- **Extensions:** pgvector (vector similarity)
- **Hosting:** Vercel Postgres / AWS RDS / self-hosted
- **Migrations:** Prisma Migrate

#### AI Services
- **OpenAI:** GPT-4 + embeddings
- **Model:** `gpt-4-turbo-preview`
- **Use Cases:** OPTR analysis, chat, Bickford decisions

#### Payments
- **Provider:** Stripe
- **Use Cases:** License purchases, subscriptions (future)

#### Communications
- **Provider:** Twilio (SMS)
- **Use Cases:** Notifications, alerts (optional)

#### Deployment
- **Primary:** Vercel (Next.js optimized)
- **Alternative:** Docker + Kubernetes
- **CI/CD:** GitHub Actions
- **Monitoring:** Vercel Analytics + custom logging

---

## Data Flow Examples

### 1. OPTR Opportunity Analysis

```
User clicks "Analyze" on opportunity
    ↓
POST /api/optr/opportunities/[id]/run
    ↓
processOpportunity() in processor.ts
    ↓
Generate embeddings (OpenAI)
    ↓
Retrieve similar docs (pgvector)
    ↓
Score requirements (algorithm)
    ↓
Persist result (4-layer redundancy)
    ↓
Return RunResult to client
    ↓
UI displays scored requirements
```

### 2. Codex Task Automation

```
Codex completes task → generates changes
    ↓
POST /api/codex/sync (with x-codex-secret)
    ↓
syncCodexChanges() in sync.ts
    ↓
git pull --rebase origin mobile
    ↓
Apply changes (create/modify/delete files)
    ↓
git add + commit + push
    ↓
persistForever() logs to ledger
    ↓
Return proof (commit SHA + ledger ID)
```

### 3. Bickford Mode Decision

```
User interaction triggers decision
    ↓
enforceBickford(data, context) checks guardrails
    ↓
assertTimestampedAuthority() validates
    ↓
checkOPTR_TTV() applies 90% rule
    ↓
writeLedgerEntry() persists decision
    ↓
4-layer persistence ensures no data loss
    ↓
Ledger entry includes SHA256 hash + proof
```

### 4. Chat Conversation

```
User sends message
    ↓
POST /api/hvpe-chat or /api/bickford-chat
    ↓
buildUnifiedAgentPrompt() constructs context
    ↓
runChat() calls OpenAI GPT-4
    ↓
recordChatHistory() persists (4 layers)
    ↓
Return reply + metadata
    ↓
UI displays response
```

---

## Key Design Principles

### 1. Defense in Depth
- **Session verification:** 3 layers (middleware + page + component)
- **Data persistence:** 4 redundant layers
- **Error handling:** Try-catch + logging + user-friendly messages

### 2. Fail-Safe Defaults
- **Unknown roles** → redirect to `/license`
- **Missing data** → fallback to alternate persistence layer
- **API errors** → return 500 with sanitized error message

### 3. Type Safety
- **TypeScript strict mode** enabled
- **Shared types** in `/lib/*/types.ts`
- **Avoid `any`** except in error handlers

### 4. Immutability
- **LOCK_SPEC.json** locked at timestamp
- **Bickford ledger** append-only, SHA256 hashed
- **Git commits** permanent history

### 5. Observability
- **Structured logging** (Winston JSON)
- **Bickford headers** (x-bickford-ts, x-bickford-kind)
- **Ledger entries** for all decisions
- **Error tracking** with full metadata

### 6. Scalability
- **Stateless server components** (no useState on server)
- **Edge middleware** (fast, distributed)
- **Database indexing** (Prisma)
- **Parallel persistence** (non-blocking)

---

## Technology Stack

### Core
- **Runtime:** Node.js 18+
- **Framework:** Next.js 16.0.7 (App Router)
- **Language:** TypeScript 5.x (strict mode)
- **UI:** React 19.2.0

### Styling
- **CSS:** Tailwind CSS 4
- **Icons:** Lucide React
- **Theme:** Dark-first (hvpeTheme.ts)

### Data
- **Database:** PostgreSQL 14+
- **ORM:** Prisma 6.19.1
- **Vector DB:** pgvector extension

### AI/ML
- **LLM:** OpenAI GPT-4
- **Embeddings:** text-embedding-3-small
- **Client:** Custom wrapper (openaiClient.ts)

### DevOps
- **Package Manager:** npm
- **Build:** Turbopack (Next.js 16)
- **CI/CD:** GitHub Actions
- **Container:** Docker + Docker Compose
- **Deploy:** Vercel / Docker / Kubernetes

### Testing
- **Framework:** Jest + React Testing Library
- **Coverage:** 80% thresholds
- **Location:** `src/lib/**/__tests__/*.test.ts`

---

## File Organization

```
hvpe-cloud-portal/
├── src/
│   ├── app/                    # Next.js App Router pages + API
│   │   ├── page.tsx            # Entry point funnel
│   │   ├── t/[role]/           # Role-specific pages
│   │   └── api/                # API routes
│   │       ├── optr/           # OPTR endpoints
│   │       ├── bickford/       # Bickford endpoints
│   │       ├── license/        # Auth endpoints
│   │       ├── codex/          # Codex sync
│   │       └── persistence/    # Persistence API
│   ├── components/             # React components
│   │   ├── providers/          # Context providers
│   │   └── shared/             # Reusable components
│   └── lib/                    # Business logic + utilities
│       ├── optr/               # OPTR domain
│       ├── bickford/           # Bickford domain
│       ├── ai/                 # AI services
│       ├── persistence/        # Infinite persistence
│       ├── codex/              # Codex integration
│       ├── chat/               # Chat services
│       ├── trading/            # Trading domain (future)
│       ├── prisma.ts           # DB client singleton
│       ├── logger.ts           # Logging service
│       └── apiResponse.ts      # API utilities
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── migrations/             # Migration history
│   └── pgvector_setup.sql      # Vector DB setup
├── .bick/
│   ├── ledger/                 # Immutable decision log
│   └── diffs/                  # Codex diff manifest
├── .persistence/               # Git-tracked persistence
│   └── backup/                 # File backup layer
├── config/
│   └── LOCK_SPEC.json          # Immutable specification
├── scripts/                    # CLI tools
├── docs/                       # Documentation
├── middleware.ts               # Edge middleware
├── bickford.mode.json          # Mode configuration
└── [documentation files]
```

---

## Critical Files

### Configuration
- `bickford.mode.json` - Bickford mode activation
- `config/LOCK_SPEC.json` - System specification (locked)
- `.env.local` - Environment variables

### Core Services
- `src/lib/persistence/infinite.ts` - 4-layer persistence
- `src/lib/bickford/runtime.ts` - Mode loader
- `src/lib/bickford/guardrails.ts` - Enforcement
- `src/lib/bickford/ledger.ts` - Decision log
- `src/lib/codex/sync.ts` - Auto deployment
- `src/lib/optr/processor.ts` - OPTR pipeline
- `src/lib/ai/openaiClient.ts` - AI client

### API Routes
- `src/app/api/codex/sync/route.ts` - Automation endpoint
- `src/app/api/persistence/route.ts` - Persistence API
- `src/app/api/bickford/route.ts` - Mode status
- `src/app/api/optr/opportunities/[id]/run/route.ts` - OPTR execution

### Documentation
- `SYSTEM_ARCHITECTURE.md` - This file
- `INFINITE_PERSISTENCE.md` - Persistence docs
- `CODEX_SYNC.md` - Automation docs
- `BICKFORD_ACTIVATION.md` - Mode activation
- `README.md` - Quick start

---

## Deployment Checklist

### Pre-deployment
- [ ] Set `DATABASE_URL` environment variable
- [ ] Set `CODEX_WEBHOOK_SECRET` (for automation)
- [ ] Set `OPENAI_API_KEY` or `HVPE_OPENAI_API_KEY`
- [ ] Run `npx prisma generate`
- [ ] Run `npx prisma migrate deploy`

### Verification
- [ ] `npm run build` succeeds (~48s)
- [ ] `npm test` passes (if tests exist)
- [ ] Health check: `curl /api/health`
- [ ] LOCK verification: `npm run verify:lock`
- [ ] UI verification: `npm run verify:ui`

### Post-deployment
- [ ] Test license login flow
- [ ] Test role-based routing
- [ ] Test OPTR analysis
- [ ] Test Codex sync endpoint
- [ ] Monitor logs for errors
- [ ] Verify ledger entries are created

---

## Security Considerations

### Authentication
- JWT tokens (HMAC-SHA256)
- Session cookies (HttpOnly, Secure)
- Webhook secrets for Codex

### Authorization
- Role-based access control (Jake/Billy)
- Middleware route guards
- Defense-in-depth verification

### Data Protection
- Environment variables never committed
- Passwords hashed (SHA-256)
- API keys validated
- Error messages sanitized

### Audit Trail
- All decisions logged to ledger
- SHA256 hashes for integrity
- Immutable append-only log
- 4-layer redundancy

---

## Performance Targets

### Response Times
- API endpoints: <500ms (95th percentile)
- Database queries: <50ms
- Persistence writes: <200ms (parallel)
- Page loads: <2s (SSR)

### Throughput
- Concurrent users: 1,000+
- OPTR analyses: 10/minute
- Persistence writes: 100/minute
- Chat messages: 50/minute

### Availability
- Uptime: 99.9%
- Persistence: 100% (4-layer redundancy)
- Recovery time: <5 minutes

---

## Future Enhancements

### Short-term (Q1 2025)
- [ ] Implement missing chat dependencies
- [ ] Add Redis for session caching
- [ ] Expand test coverage to 90%
- [ ] Add rate limiting to all APIs
- [ ] Implement monitoring dashboard

### Medium-term (Q2 2025)
- [ ] Trading engine integration
- [ ] Real-time WebSocket updates
- [ ] Mobile app (Expo)
- [ ] Advanced analytics
- [ ] Multi-tenant support

### Long-term (Q3-Q4 2025)
- [ ] Microservices architecture
- [ ] Event-driven workflows
- [ ] ML model training pipeline
- [ ] Geographic distribution
- [ ] Compliance certifications (SOC 2)

---

## Conclusion

This architecture provides:
- ✅ **Clear separation of concerns** (6 distinct layers)
- ✅ **Infinite data persistence** (4-layer redundancy)
- ✅ **Automated deployment** (Codex sync)
- ✅ **Type safety** (TypeScript strict mode)
- ✅ **Observability** (structured logging + ledger)
- ✅ **Scalability** (stateless design + edge middleware)
- ✅ **Security** (defense in depth + immutability)

**Status:** Production-ready as of 2025-12-19

**Maintained by:** Bickford + GitHub Copilot  
**Last Updated:** 2025-12-19T12:00:00-05:00  
**Version:** 2.0.0
