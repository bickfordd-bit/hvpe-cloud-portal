# HVPE Cloud Portal — Copilot / AI Agent Instructions

Purpose: give an AI coding agent the minimal, high-value knowledge to be productive in this repo.

Quick summary
- Type: Next.js (App Router) + TypeScript frontend + Next route handlers for server APIs.
- Structure: UI under `src/app` (app-router pages), shared `src/components`, helper code in `src/lib`, API endpoints in `src/app/api`, DB models in `prisma/`.

Key files & examples
- App pages / client usage: `src/app/optr/[id]/page.tsx` calls `optrClient.run()` to start an OPTR run.
- Client lib pattern: `src/lib/optr/client.ts` uses a small `j()` wrapper over `fetch` (sets JSON headers and `cache: "no-store").`
- API route example: `src/app/api/optr/opportunities/[id]/run/route.ts` — currently returns a hardcoded `RunResult` (this is the primary place to wire real processing).
- Types: `src/lib/optr/types.ts` contains project domain shapes (OPTRState, Trace, Requirement, RunResult).
- DB: `prisma/schema.prisma` and `src/lib/prisma.ts` (Prisma client generation runs on `postinstall`).

Big-picture architecture / data flow notes
- Frontend server components (default) and explicit client components use `"use client"` at file top. Prefer server components unless UI interactivity is required.
- Client → API: client-side code calls wrappers in `src/lib/*` (e.g., `optrClient`) which call Next API routes under `src/app/api/*` using `fetch`.
- OPTR pipeline: UI calls `optrClient.run()` → `/api/optr/opportunities/[id]/run` (route.ts) → should call a backend processor in `src/lib/optr/*`. Currently the processing is stubbed; implement ingestion, embeddings, vector DB retrieval, scoring there.

Project-specific conventions
- Source imports use the `@/` alias (e.g., `@/lib/optr/client`). Keep this pattern when adding files.
- API route handlers return `NextResponse` objects and follow the `route.ts` shape for each HTTP method.
- Styling: Tailwind CSS (see `postcss.config.mjs`, `tailwindcss` in `devDependencies`). Use Tailwind utility classes throughout components.
- TypeScript strictness: files are typed; add types to new modules and export them from `src/lib` where reusable.

Dev / run / debug commands (empirically verified)
- Install: `npm install` (repo `postinstall` runs `prisma generate`).
- Dev: `npm run dev` (starts Next dev server).
- Build: `npm run build` / `npm run start` for production server.
- Prisma migrations: `npx prisma generate` and `npx prisma migrate dev --name <name>` (see `README.md`).

Integrations & external dependencies
- OpenAI: backend uses `openai` lib and expects `OPENAI_API_KEY` / `HVPE_OPENAI_API_KEY` (see `README.md`).
- Stripe: `stripe` SDK + webhook endpoints (search `stripe_webhook`).
- Prisma/Postgres: `prisma/schema.prisma`.
- Email/PDF: `nodemailer` and `pdfkit` are present.

What an agent should look for when making changes
- Prefer adding backend processing logic under `src/lib/optr/` and call it from `src/app/api/optr/opportunities/[id]/run/route.ts`.
- Keep API surface stable: `optrClient` methods (`list`, `create`, `status`, `run`) are used by UI — preserve or update both client and route signatures together.
- When adding env vars, update `README.md` and respect existing names (`OPENAI_API_KEY`, `HVPE_OPENAI_API_KEY`, `DATABASE_URL`, `STRIPE_SECRET_KEY`).

Small examples to copy/paste
- Fetch wrapper pattern (follow `src/lib/optr/client.ts`):
```ts
async function j<T>(url: string, init: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json', ...(init.headers||{}) }, cache: 'no-store' });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}
```

Notes & current limitations
- OPTR run endpoint is a hardcoded stub (`src/app/api/optr/opportunities/[id]/run/route.ts`). Implement real pipeline (ingest → T2V → vector DB → retrieval → scoring) here.
- There are no unit tests in the repo; rely on local `npm run dev` and manual API checks for validation.

If unsure, start with small, isolated changes:
- Add a `src/lib/optr/processor.ts` with tests and wire it into the `run` route.
- Add logging and sample fixture data under `scripts/templates/` so runs can be validated locally.

If you want me to implement a starter `src/lib/optr/processor.ts` and wire it into the `run` route, say "Scaffold OPTR processor".
