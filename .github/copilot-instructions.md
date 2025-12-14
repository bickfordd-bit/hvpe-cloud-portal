# HVPE Cloud Portal — AI Agent Instructions

## Project Overview
Next.js 16 (App Router) + TypeScript full-stack app with AI-powered processing pipelines. Core features: OPTR opportunity analysis, Bickford chat AI, trading engine, license management.

## Architecture & Data Flow

### Directory Structure
```
src/
├── app/              # Next.js App Router pages + API routes
│   ├── api/          # Backend API endpoints (route.ts files)
│   └── [features]/   # Feature pages (e.g., optr/, bickford/, trading/)
├── components/       # React components (UI, widgets, layouts)
│   ├── providers/    # Context providers (PersonaProvider)
│   └── shared/       # Reusable components (ErrorBoundary)
├── lib/              # Backend logic, utilities, clients
│   ├── [feature]/    # Feature-specific logic (optr/, ai/, auth/)
│   ├── prisma.ts     # Database client singleton
│   ├── logger.ts     # Winston structured logging
│   └── apiResponse.ts # Standardized API responses
prisma/
├── schema.prisma     # Database models (License, AiUsageLog, Embedding)
└── pgvector_setup.sql # Vector DB setup (optional)
```

### Key Data Flows
1. **Client → API Pattern**: UI components call type-safe client wrappers in `src/lib/*/client.ts` → fetch API routes at `src/app/api/*` → return typed responses
   - Example: `optrClient.run(id)` → `POST /api/optr/opportunities/[id]/run` → `processOpportunity()` in `src/lib/optr/processor.ts`
   
2. **OPTR Pipeline**: Opportunity analysis follows: ingestion → embeddings → retrieval → scoring → results
   - Entry: `src/lib/optr/processor.ts#processOpportunity()`
   - Types: `src/lib/optr/types.ts` (Opportunity, RunResult, Trace, ScoredRequirement)
   
3. **React Server/Client Components**: Pages are server components by default; add `"use client"` directive at file top for interactivity (useState, useEffect, event handlers)

4. **Global State**: `PersonaProvider` context manages user persona mode (trader/founder/investor/engineer/intelligence) - accessible via `usePersona()` hook

5. **Feature Pillars**: OPTR is the flagship pipeline; also note Bickford chat dock (`/api/hvpe-chat`, floating dock component) and trading ideas/growth modes via AI Core (`/api/ai/run` with `mode` param). Treat OPTR as default priority unless a task explicitly targets chat or trading.

## Project-Specific Conventions

### TypeScript & Imports
- Path alias: `@/` maps to `src/` (e.g., `import { logger } from '@/lib/logger'`)
- All new files should be typed; export types from `src/lib/[feature]/types.ts`
- Strict mode enabled; avoid `any` except in error handlers

### API Route Patterns
```ts
// Standard route.ts structure
import { NextRequest, NextResponse } from 'next/server';
import { apiSuccess, apiError } from '@/lib/apiResponse';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    logger.info('Processing request', { body });
    const result = await someProcessingFunction(body);
    return NextResponse.json(apiSuccess(result));
  } catch (error: any) {
    logger.error('Request failed', { error: error.message });
    return NextResponse.json(apiError(error), { status: 500 });
  }
}
```

### Fetch Client Pattern
Follow `src/lib/optr/client.ts` wrapper style:
```ts
async function j<T>(url: string, init: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
    cache: 'no-store'
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}${text ? ` — ${text}` : ''}`);
  }
  return await res.json() as T;
}
```

### Styling
- Tailwind CSS 4 with PostCSS
- Dark-first theme (bg-black, text-white defaults)
- Use utility classes; avoid inline styles
- Check `src/lib/hvpeTheme.ts` for brand colors/gradients

### Logging & Error Handling
- Use `logger` (winston) for all server-side logging: `logger.info/warn/error(message, metadata)`
- Wrap client components in `<ErrorBoundary>` (see `src/components/shared/ErrorBoundary.tsx`)
- API errors use `apiError()` helper from `src/lib/apiResponse.ts`
- Environment validation runs on server import (`src/lib/envValidator.ts`) and will warn when OpenAI or `DATABASE_URL` are missing; it does not crash unless required vars are explicitly marked.

## Development Workflows

### Essential Commands
```bash
# Install (triggers prisma generate)
npm install

# Development server (port 3000)
npm run dev

# Production build
npm run build && npm start

# Database migrations
npx prisma generate              # Regenerate Prisma client
npx prisma migrate dev --name <desc>  # Create + apply migration
npx prisma migrate deploy        # Apply migrations (production)

# Testing (Jest + React Testing Library)
npm test                  # Run tests once
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report

# Docker
make docker-dev           # Dev with hot reload
docker-compose up -d      # Production mode
```

### Makefile Shortcuts
Use `make help` to see all targets. Common ones:
- `make install` - Install deps + generate Prisma
- `make dev` - Start dev server
- `make test` - Run test suite
- `make prisma-studio` - Open DB GUI

### Deployment
- Docker: `make docker-dev` for hot-reload dev compose; `docker-compose up -d` for prod-style compose; `docker build` / `docker buildx` targets already tagged for GHCR.
- Vercel: `npm run build && npm start` locally mirrors Vercel build; `npm run deploy:vercel` triggers prod deploy if configured.
- Migrations: `npm run migrate:deploy` (no-op if `DATABASE_URL` unset); `postinstall` will attempt `prisma generate` and falls back to local schema if no DB.
- Health: `make health-check` hits `/api/health` when running locally.

## Environment Variables

### Required (see `.env.local` or Vercel settings)
- `DATABASE_URL` - PostgreSQL connection string (optional for basic chat features)
- `OPENAI_API_KEY` or `HVPE_OPENAI_API_KEY` - OpenAI API access (preferred: `HVPE_OPENAI_API_KEY`)

### Optional Integrations
- `STRIPE_SECRET_KEY` + webhook secrets - Payment processing
- `TWILIO_*` - SMS notifications
- `AI_WEBHOOK_SECRET` - Secures `/api/ai/code` voice-to-code endpoint
- `ADMIN_DASH_TOKEN` - Admin UI authentication

See `src/lib/envValidator.ts` for complete list with validation logic.

## Testing

- Framework: Jest with `ts-jest` and React Testing Library
- Test location: `src/lib/[feature]/__tests__/*.test.ts`
- Example: `src/lib/optr/__tests__/processor.test.ts` - OPTR pipeline unit tests
- Coverage thresholds: 80% (branches/functions/lines/statements)
- Run specific tests: `npm test -- processor.test.ts`
- Coverage expectations: always add unit tests for processors/services and API routes (happy path + failure); UI component tests are optional unless they contain stateful logic.

## Database (Prisma + PostgreSQL)

- Client singleton: `src/lib/prisma.ts` (prevents connection exhaustion in dev)
- Models: License, LicenseRequest, AiUsageLog, Embedding, AIPatchLog
- PGVector extension (optional): Enables fast similarity search for embeddings
  - Setup: `psql $DATABASE_URL -f prisma/pgvector_setup.sql`
  - Used by OPTR retrieval stage for document matching

## Authentication & Middleware

- Session cookie: `optr` (see `middleware.ts`)
- Protected routes: `/dashboard/*`, `/admin/*`, `/account/*`, `/licenses/*`
- Middleware redirects unauthenticated users to `/login?redirectTo=<path>`
- No auth required for: public pages, API health checks, webhooks

## Critical Integration Points

### OPTR Processing Pipeline
- Entry: `src/app/api/optr/opportunities/[id]/run/route.ts`
- Core logic: `src/lib/optr/processor.ts#processOpportunity()`
- Stages: Fetch opportunity → Generate embeddings → Retrieve documents → Score requirements
- Output: `RunResult` with traces, scored requirements, metadata

### Other Pillars
- HVPE chat dock: `POST /api/hvpe-chat` powered by OpenAI; UI is mounted globally.
- AI Core multipurpose endpoint: `POST /api/ai/run` with `mode` to switch between analysis/growth/trading plans.
- Trading/ideas flows reuse AI Core and log usage in `AiUsageLog`.

### AI Code Generation (Voice-to-Code)
- Endpoint: `POST /api/ai/code` (see `src/app/api/ai/code/route.ts`)
- Flow: Voice input → OpenAI generates git patch → Store in `AIPatchLog` → Admin approval → Apply via Git
- Security: Requires `AI_WEBHOOK_SECRET` header; admin approval gated by `ADMIN_DASH_TOKEN`
- Security callout: never expose `/api/ai/code` publicly without `AI_WEBHOOK_SECRET` + `ADMIN_DASH_TOKEN`; log requester identity; prefer rate limiting in front of this route.

### OpenAI Client
- Wrapper: `src/lib/ai/openaiClient.ts#runChat()`
- Prefers `HVPE_OPENAI_API_KEY`, falls back to `OPENAI_API_KEY`
- Used by: OPTR embeddings, Bickford chat, Penelope generator, AI code endpoint

## When Making Changes

### Adding New Features
1. Create types in `src/lib/[feature]/types.ts`
2. Implement logic in `src/lib/[feature]/processor.ts` (or similar)
3. Add API route at `src/app/api/[feature]/route.ts` using standard pattern
4. Create client wrapper at `src/lib/[feature]/client.ts` with typed methods
5. Build UI in `src/app/[feature]/page.tsx` (server component) or components
6. Add tests in `src/lib/[feature]/__tests__/`
7. Update `.env.local` example and `README.md` for new env vars

### Modifying Existing APIs
- Update both route handler AND client wrapper to maintain type safety
- Preserve backwards compatibility or version the endpoint
- Update types in `types.ts` - shared between client and server

### Database Changes
1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name <description>`
3. Commit migration files in `prisma/migrations/`
4. Update `src/lib/prisma.ts` if new client config needed

### Adding Dependencies
- Install: `npm install <package>` (production) or `npm install -D <package>` (dev)
- For Prisma providers: Update `prisma/schema.prisma` generator config

## Common Pitfalls & Solutions

1. **Prisma client out of sync**: Run `npx prisma generate` after schema changes
2. **"use client" errors**: Add directive if using hooks/state/events in component
3. **Path imports fail**: Use `@/` alias, not relative paths across `src/` boundary
4. **API 500 errors**: Check server logs via `logger` output; errors logged with metadata
5. **Docker build fails**: Ensure `DATABASE_URL` is set or migrations are skipped (see `package.json` postinstall)
6. **Tests fail with import errors**: Check `moduleNameMapper` in `jest.config.ts` includes `@/` mapping

## Current Limitations & TODOs

- OPTR vector retrieval is stubbed (uses mock data); implement pgvector queries in `src/lib/optr/processor.ts#retrieveDocuments()`
- Vector retrieval guidance: use `Embedding` table with `vector` json column; query top-K via pgvector or app-side cosine sim, then return doc snippets. Keep mock fallback when `DATABASE_URL` or extension missing.
- No CI/CD tests run automatically (GitHub Actions workflow exists but needs test command)
- License approval flow requires manual API calls (see `README.md` for curl examples)
- Voice-to-code requires `gh` CLI installed for PR creation

## Quick Reference: Example Files

- **Standard API route**: `src/app/api/optr/opportunities/[id]/run/route.ts`
- **Client wrapper**: `src/lib/optr/client.ts`
- **Processing pipeline**: `src/lib/optr/processor.ts`
- **Type definitions**: `src/lib/optr/types.ts`
- **Test suite**: `src/lib/optr/__tests__/processor.test.ts`
- **Client component**: `src/app/optr/[id]/page.tsx` (uses `"use client"`)
- **Server component**: `src/app/layout.tsx` (default, no directive)
- **Context provider**: `src/components/providers/PersonaProvider.tsx`

---

**Need help?** Check `README.md`, `SETUP.md`, `DOCKER.md` for deployment guides. For OPTR pipeline details, see `docs/OPTR_MATHEMATICAL_FRAMEWORK.md`.
