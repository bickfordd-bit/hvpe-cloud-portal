HVPE Cloud Portal – Next.js (App Router) with Stripe and Prisma-backed licensing.

## 🚀 Bickford Homepage — Zero-Approval Execution Runtime

**NEW**: The root homepage (`/`) is now the Bickford execution runtime with zero-approval intent-to-reality flow.

### Features
- **Intent Input**: Natural language intent parsing
- **OPTR Policy Selection**: Automatic policy binding via T2V optimization
- **Canon Verification**: SHA-256 integrity checking on every execution
- **Auto-Commit**: Direct GitHub commits with no manual approval
- **Hash-Chained Ledger**: Immutable execution history in `.bick/ledger/`
- **Real-Time Status**: Live execution tracking and history visualization

### Quick Start
```bash
npm install
npm run dev
# Open http://localhost:3000 - the Bickford Homepage will load
```

## 🔧 Development Setup

### Pre-commit Hooks

This repository uses Husky and lint-staged to automatically fix lint and formatting issues before each commit:

- **ESLint**: Automatically fixes TypeScript/JavaScript errors
- **Prettier**: Formats all supported files (TS, JS, CSS, JSON, MD)
- **Auto-staging**: Fixed files are automatically staged

The pre-commit hook runs automatically on `git commit`. If linting fails, the commit will be aborted and you'll see the errors that need manual fixing.

#### Bypassing Pre-commit Hooks

In rare cases where you need to commit without running hooks (not recommended):
```bash
git commit --no-verify -m "your message"
```

#### Manual Linting

```bash
npm run lint              # Check for issues
npx eslint . --fix        # Auto-fix issues
npx prettier --write .    # Format all files
```

### API Endpoints
- `GET /api/execute` - Check canon status and capabilities
- `POST /api/execute` - Submit intent for execution (body: `{ "intent": "your intent text" }`)
- `GET /api/ledger?limit=10` - Query execution history

### Environment Variables
Required for full functionality:
- `GITHUB_TOKEN` - For auto-commits to repository
- `DATABASE_URL` - PostgreSQL connection (optional, falls back to file-based ledger)

Optional:
- `GITHUB_REPO` - Target repository (default: bickfordd-bit/hvpe-cloud-portal)
- `GITHUB_BRANCH` - Target branch (default: main)

### Canon System
The canonical specification is stored in `/canon/`:
- `CANON.md` - Full specification (11KB, LOCKED status)
- `CANON.meta.json` - SHA-256 hash and metadata

**Canon verification runs on every execution. Hash mismatch = ABORT.**

---

## 🤖 Auto-Merge Workflow

This repository implements zero-approval auto-merge for owner PRs. No manual merge button clicking required.

### How It Works

When the repository owner (`bickfordd-bit`) creates a PR:

1. **Automatic Check Execution**: PR checks workflow runs lint, build, and test
2. **Auto-Approval**: Once checks pass, the PR is automatically approved
3. **Auto-Merge**: PR merges automatically with squash strategy
4. **Branch Cleanup**: Source branch is deleted after merge
5. **Notifications**: Status updates posted as PR comments at each stage

### Requirements

For auto-merge to trigger, the PR must:
- ✅ Be created by repository owner (`bickfordd-bit`)
- ✅ Not be in draft state
- ✅ Not have `[no-auto-merge]` in the title
- ✅ Pass all required checks (lint, build, test)

### Required Status Checks

Auto-merge waits for these checks to pass:
- **Lint** - ESLint validation
- **Build** - Next.js build verification  
- **Test** - Jest test suite

### Disabling Auto-Merge

To disable auto-merge for a specific PR, add `[no-auto-merge]` anywhere in the PR title:

```
[no-auto-merge] WIP: Experimental feature
```

### Monitoring PR Progress

**GitHub Notifications:**
- Watch repository → Custom → Select "Pull requests"
- Enable email notifications for PR activity

**PR Comments:**
The auto-merge workflow posts status updates:
- 🤖 "Auto-merge initiated" - When workflow starts
- ⏱️ "Waiting for checks" - While checks are running
- ✅ "Auto-merge enabled" - When checks pass and merge is queued
- ❌ "Auto-merge blocked" - If checks fail
- 🎉 "Auto-merged successfully" - After successful merge

**Workflow Logs:**
View detailed execution logs at:
```
https://github.com/bickfordd-bit/hvpe-cloud-portal/actions
```

### Branch Protection

To configure branch protection rules:

1. Go to **Actions** tab in GitHub
2. Select **Setup Branch Protection** workflow
3. Click **Run workflow**
4. Select target branch (main/mobile)
5. Click **Run workflow** button

This configures:
- Required status checks (lint, build, test)
- Force push protection
- Branch deletion protection
- No required PR reviews (owner can self-merge)

### Troubleshooting

**Auto-merge didn't trigger:**
- Check PR author is `bickfordd-bit`
- Ensure PR is not in draft
- Verify title doesn't contain `[no-auto-merge]`
- Check workflow logs for errors

**Checks are failing:**
- Review workflow run logs
- Fix failing tests/lints locally
- Push fixes - auto-merge will retry

**Workflow timed out:**
- Checks took longer than 30 minutes
- Auto-merge will retry on next push
- Check for stuck/hanging tests

---

## Canon + Sale Architecture
- **Executable canon** lives in [`src/lib/btiCanon.ts`](./src/lib/btiCanon.ts) and drives the proof-gated $1B sale plan.
- Human-readable mirror: [`docs/BICKFORD_CANON.md`](./docs/BICKFORD_CANON.md).
- Update the TypeScript source first; regenerate the doc afterward to keep parity.
- Microsoft assets:
  - Pilot commitment email template — [`docs/MICROSOFT_PILOT_EMAIL.md`](./docs/MICROSOFT_PILOT_EMAIL.md)
  - Pilot scope doc (to be co-signed) — [`docs/MICROSOFT_PILOT_SCOPE.md`](./docs/MICROSOFT_PILOT_SCOPE.md)

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

## Admin
- AI usage logs: `/admin/ai-logs`
- Protected by middleware; set `ADMIN_DASH_TOKEN` (use Bearer token or `?token=` query)

## Bickford Live Filing (Expo)

### Setup

```bash
npm install
```

```bash
npx expo start
```

### Notes

This project uses Expo Router. If you add gesture-handler or reanimated, follow the Expo setup guide for those packages. The current implementation uses the core Animated API and does not require extra setup steps.
