HVPE Cloud Portal – Next.js (App Router) with Stripe and Prisma-backed licensing.

## Environment
Set these in `.env.local` (and in Vercel Project Settings → Environment Variables):

- `DATABASE_URL` (Postgres)
- Other app-specific vars you already use (`STRIPE_SECRET_KEY`, webhook secrets, mail creds, etc.)
- `OPENAI_API_KEY` (for the in-portal HVPE chat dock)
- `HVPE_OPENAI_API_KEY` (preferred alias for AI Core; falls back to `OPENAI_API_KEY`)

## Prisma setup (Postgres)
1) Generate client (requires `DATABASE_URL` set):
```bash
npx prisma generate
```
2) Apply schema to your DB (creates License + LicenseRequest tables):
```bash
npx prisma migrate dev --name init_license_models
# In production, use: npx prisma migrate deploy
```

If you added the AI Embedding and patch models, run a new migration:
```bash
npx prisma migrate dev --name add_embeddings_and_ai_patches
npx prisma generate
```

PGVector setup (optional, recommended for fast ANN searches)
1. Install the `pgvector` extension on your Postgres instance. If you manage Postgres yourself, follow https://github.com/pgvector/pgvector.
2. Run the provided SQL to create the `pg_embeddings` table and index:

```bash
psql $DATABASE_URL -f prisma/pgvector_setup.sql
```

Note: The app will try to write to `pg_embeddings` if available; this is best-effort and will not break the app if the extension/table is missing.

## License approval API
Endpoint: `POST /api/license/approve`
Payload:
```json
{ "requestId": "YOUR_PENDING_REQUEST_ID" }
```
Response (example):
```json
{ "success": true, "licenseKey": "HVPE-XXXXXX-XXXXXX-XXXXXX", "email": "user@example.com" }
```
Use from the live site (browser console or curl):
```bash
curl -X POST https://your-domain/api/license/approve \
  -H "Content-Type: application/json" \
  -d '{ "requestId": "..." }'
```

## Dev commands
- Install deps: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Test: `npm test`

## Docker Deployment 🐳

### Quick Start with Docker Compose
```bash
# Development mode (with hot reload)
docker-compose -f docker-compose.dev.yml up

# Production mode
docker-compose up -d
```

### Build & Push to GitHub Container Registry
```bash
# Login to GHCR
echo $GITHUB_TOKEN | docker login ghcr.io -u bickfordd-bit --password-stdin

# Build multi-arch image
docker build -t ghcr.io/bickfordd-bit/hvpe-cloud-portal:latest .

# Push to registry
docker push ghcr.io/bickfordd-bit/hvpe-cloud-portal:latest

# Or use automated GitHub Actions workflow (see .github/workflows/docker-publish.yml)
```

### Pull & Run from Registry
```bash
# Pull latest
docker pull ghcr.io/bickfordd-bit/hvpe-cloud-portal:latest

# Run with environment variables
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e OPENAI_API_KEY="sk-..." \
  --name hvpe-portal \
  ghcr.io/bickfordd-bit/hvpe-cloud-portal:latest
```

**See [DOCKER.md](./DOCKER.md) for complete containerization guide** including:
- Multi-arch builds (amd64, arm64)
- Kubernetes deployment
- Health checks & monitoring
- Security best practices
- CI/CD workflows

## Voice-to-code automatic deploy (AI assistant)

This repository includes a minimal voice-to-code MVP:

- Client: `src/components/VoiceAssistant.tsx` — floating mic, sends spoken text to the AI code endpoint.
- API: `POST /api/ai/code` — asks the configured OpenAI model to return a unified-diff patch and (optionally) applies it by creating a branch, committing, and pushing.

Required environment variables for full automation (set as repo secrets in GitHub / Vercel):

- `HVPE_OPENAI_API_KEY` or `OPENAI_API_KEY` — OpenAI API key used to generate patches.
- `AI_WEBHOOK_SECRET` (optional) — if set, requests must include header `x-ai-webhook-secret`.
- `GITHUB_TOKEN` (optional) — allows the server to create PRs via `gh` if installed.
- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` (optional) — if set, the GitHub Actions workflow will deploy to Vercel on push.

Admin approval and deploy secrets
- `ADMIN_DASH_TOKEN` or `ADMIN_APPLY_SECRET` — required by the approval and apply endpoints. The admin UI will attempt to send `x-admin-secret` header when approving/applying patches; set this to a strong value and only expose the admin UI to trusted users.

**Protecting IP & contributions**

- This repository contains proprietary code and is covered by the `LICENSE` file. Do not publish or redistribute code without written permission.
- Contributors must sign a Contributor License Agreement (CLA) or submit contributions only under an explicit assignment. See `CONTRIBUTING.md` for details.
- Security issues should be reported via `SECURITY.md` instructions (email `security@your-domain.example`).
- Administrative actions (approving/applying AI-generated patches) require `ADMIN_DASH_TOKEN` / `ADMIN_APPLY_SECRET` and the admin UI should be restricted to trusted users.

If you want, I can scaffold a simple CLA acceptance flow (web form + signed record) and add CI checks that block PRs that don't include a CLA-accepted label.

Security note: The `/api/ai/code` endpoint runs `git` commands on the host. Do not expose it publicly without authentication and approval gates. Prefer setting `AI_WEBHOOK_SECRET` and adding user authentication in front of it.

CI: A GitHub Actions workflow is provided at `.github/workflows/ci-deploy.yml`. It builds the app on push/PR to `ui-redesign-v1` and attempts to deploy to Vercel when Vercel secrets are configured.

## HVPE chat dock
- API: `POST /api/hvpe-chat` (requires `OPENAI_API_KEY`)
- UI: floating chat button/dock on all pages via `HvpeChatDock`

## AI Core endpoint
- API: `POST /api/ai/run` (preferred key `HVPE_OPENAI_API_KEY`)
- Modes supported:
  - `optr-gap-analysis` (RFI/RFP delta analysis)
  - `bic-objective-plan` (goal/plan decomposition)
  - `hvpe-idea` (trading/growth idea)
  - `hvpe-trade-narrative` (trading posture narrative)
  - `bic-risk-summary` (risk + mitigations)
  - `generic` (provide your own `messages`)
- Logs usage to `AiUsageLog` (Prisma)

## OPTR Trade Trigger API

Execute trades via Alpaca integration.

### API Endpoint
```bash
POST /api/optr/trade
```

**Headers:**
- `x-optr-admin-key`: Required authentication key (matches `OPTR_ADMIN_KEY` env var)
- `x-request-id`: Optional request tracking ID

**Payload:**
```json
{
  "symbol": "AAPL",
  "side": "buy",
  "mode": "dollars",
  "dollars": 10,
  "shares": 0,
  "min_dollars": 1
}
```

**Parameters:**
- `symbol` (required): Stock ticker, 1-10 chars, auto-uppercased
- `side` (optional): `buy` or `sell` (default: `buy`)
- `mode` (optional): `auto`, `dollars`, or `shares` (default: `auto`)
- `dollars` (optional): Dollar amount for notional orders (default: 0)
- `shares` (optional): Number of shares for quantity orders (default: 0)
- `min_dollars` (optional): Minimum dollar threshold (default: 1)

**Example:**
```bash
curl -X POST https://your-domain/api/optr/trade \
  -H "Content-Type: application/json" \
  -H "x-optr-admin-key: your-secret-key" \
  -d '{
    "symbol": "AAPL",
    "side": "buy",
    "mode": "dollars",
    "dollars": 10
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "symbol": "AAPL",
    "side": "buy",
    "mode": "dollars",
    "shares_executed": 0.05,
    "dollars_executed": 10.00,
    "order_id": "abc123",
    "filled_price": 200.00
  },
  "rid": "req-uuid-here",
  "metadata": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "duration": 1234,
    "remaining": 29
  }
}
```

### Python Worker Setup

The trade endpoint forwards requests to a Python worker that executes trades via Alpaca.

**Install dependencies:**
```bash
cd scripts/optr
pip install -r requirements.txt
```

**Environment variables (worker):**
- `OPTR_ADMIN_KEY` (required): Shared secret with API endpoint
- `ALPACA_API_KEY` (required): Alpaca API key
- `ALPACA_API_SECRET` (required): Alpaca API secret
- `ALPACA_BASE_URL` (optional): Default `https://paper-api.alpaca.markets` (paper trading)
- `OPTR_WORKER_PORT` (optional): HTTP server port (default: 8787)

**Run the worker:**
```bash
cd scripts/optr
export OPTR_ADMIN_KEY="your-secret-key"
export ALPACA_API_KEY="your-alpaca-key"
export ALPACA_API_SECRET="your-alpaca-secret"
python3 worker_http.py
```

**CLI testing (bypasses HTTP server):**
```bash
cd scripts/optr
python3 run_trade.py --symbol AAPL --side buy --mode dollars --dollars 10
```

### Environment Variables (Portal)
- `OPTR_ADMIN_KEY` (required): Authentication key for trade endpoint
- `OPTR_WORKER_URL` (required): URL of Python worker (e.g., `http://localhost:8787`)
- `OPTR_MAX_NOTIONAL` (optional): Max dollar amount for non-shares orders (default: 50)

**Rate Limiting:** 30 requests per minute per IP (in-memory, best-effort)

## Admin
- AI usage logs: `/admin/ai-logs`
- Protected by middleware; set `ADMIN_DASH_TOKEN` (use Bearer token or `?token=` query)
