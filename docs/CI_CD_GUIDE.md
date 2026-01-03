# CI/CD Guide - Unified Deployment Pipeline

Complete guide to the HVPE Cloud Portal's bulletproof CI/CD system.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Workflows](#workflows)
- [Scripts](#scripts)
- [Configuration](#configuration)
- [Deployment Process](#deployment-process)
- [Troubleshooting](#troubleshooting)
- [Migration Guide](#migration-guide)

## Overview

The HVPE Cloud Portal uses a **unified deployment pipeline** that consolidates all deployment logic into a single, reliable workflow.

### Key Features

✅ **Single Entry Point** - One workflow handles all deployments  
✅ **Branch Awareness** - Automatic production vs preview detection  
✅ **Concurrency Protection** - Queues deployments instead of canceling  
✅ **Smart Retries** - 3 automatic retries with exponential backoff  
✅ **Preflight Validation** - Catches issues before deployment  
✅ **Real-time Status** - GitHub commit status API integration  
✅ **Auto-fixes** - Clears cache, fixes dependencies  
✅ **Full Visibility** - Progress updates and notifications  

### Benefits

- **Zero Silent Failures** - All errors are logged and reported
- **No Manual Intervention** - Fully automated unless explicitly flagged
- **Clear Progress** - Real-time status updates via GitHub UI
- **Fast Deployment** - Typical deployment < 5 minutes
- **Easy Rollback** - Simple revert mechanism
- **Cost Effective** - Efficient caching and concurrency control

## Quick Start

### For Developers

Push code to any branch - the workflow handles the rest:

```bash
git add .
git commit -m "feat: add new feature"
git push origin feature/my-branch
```

The workflow will:
1. ✅ Validate environment and dependencies
2. 🔨 Build and test your code
3. 🚀 Deploy to Vercel (preview or production)
4. ✅ Verify deployment health
5. 💬 Comment on your PR/commit with deployment URL

### For Admins

No configuration needed! The workflow uses existing secrets:

- `VERCEL_TOKEN` - Already configured
- `VERCEL_ORG_ID` - Already configured
- `VERCEL_PROJECT_ID` - Already configured

Optional secrets (auto-detected):
- `DATABASE_URL` - Database connection
- `OPENAI_API_KEY` - AI features
- `LICENSE_SESSION_SECRET` - License validation

## Architecture

### Workflow Structure

```
┌─────────────────┐
│   Push / PR     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Preflight     │  ← Validate secrets, deps, config
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Build & Test    │  ← TypeScript, Jest, Next.js build
└────────┬────────┘
         │
         ├──────────┐
         ▼          ▼
┌─────────────┐  ┌─────────────┐
│  Security   │  │   Deploy    │  ← Parallel execution
└─────────────┘  └──────┬──────┘
                        │
                        ▼
                ┌─────────────┐
                │   Verify    │  ← Smoke tests
                └──────┬──────┘
                       │
                       ▼
                ┌─────────────┐
                │   Notify    │  ← PR comments, status
                └──────┬──────┘
                       │
                       ▼
                ┌─────────────┐
                │   Ledger    │  ← Record deployment
                └─────────────┘
```

### Decision Tree

```
Push to branch
  │
  ├─ main / mobile → Production deployment
  │
  └─ other branches → Preview deployment
       │
       ├─ PR event → Comment on PR
       │
       └─ Push event → Comment on commit
```

## Workflows

### Master Deployment (`master-deploy.yml`)

**Location:** `.github/workflows/master-deploy.yml`

**Triggers:**
- Push to: `main`, `mobile`, `ui-redesign-v1`, `develop`
- Pull requests to: `main`, `mobile`, `ui-redesign-v1`

**Jobs:**

#### 1. Preflight (🔍)
Validates environment before deployment starts.

**Checks:**
- Required secrets present
- Node.js and npm installed
- Dependencies up to date
- Prisma client generated
- Critical files exist

**Outputs:**
- `should_deploy` - Whether to proceed
- `is_production` - Production or preview

**Runtime:** ~30 seconds

#### 2. Build (🔨)
Builds and tests the application.

**Steps:**
- Install dependencies
- Generate Prisma client
- TypeScript check (non-blocking)
- Run tests (non-blocking)
- Build Next.js app
- Verify build output

**Runtime:** ~2-3 minutes

#### 3. Security (🔒)
Runs security audit (non-blocking).

**Steps:**
- npm audit for vulnerabilities

**Runtime:** ~20 seconds

#### 4. Deploy (🚀)
Deploys to Vercel with retry logic.

**Steps:**
- Pull Vercel environment
- Build project artifacts
- Deploy with 3 retries
- Extract deployment URL

**Retry Logic:**
- Max retries: 3
- Backoff: 5s, 15s, 30s
- Detects transient errors

**Runtime:** ~2-4 minutes

#### 5. Verify (✅)
Validates deployment health.

**Tests:**
- Homepage loads (critical)
- Health API responds (critical)
- Lock API accessible (optional)
- Response time < 5s
- SSL certificate valid

**Runtime:** ~30 seconds

#### 6. Notify (📢)
Updates PR/commit with results.

**Actions:**
- Comment on PR with deployment URL
- Update commit status
- Create ledger entry (production only)

**Runtime:** ~10 seconds

### Legacy Workflows (Deprecated)

These workflows are archived but still active during Phase 1:

- `ci-cd.yml` - Original CI/CD pipeline
- `deploy-vercel.yml` - Vercel deployment
- `ci-deploy.yml` - UI redesign branch

**Status:** Running in parallel for monitoring  
**Next Phase:** Will be disabled after 1 week  
**Location:** `.github/workflows/archive/`

### Kept Workflows (Different Purpose)

These workflows serve different purposes and remain active:

- `docker-publish.yml` - Container builds
- `prisma-migrate.yml` - Database migrations
- `database-migrations.yml` - Manual DB operations
- `health-checks.yml` - Scheduled monitoring
- `release.yml` - Release management

## Scripts

### Preflight Check (`scripts/preflight-check.sh`)

Pre-deployment validation and auto-fixes.

**Usage:**
```bash
./scripts/preflight-check.sh
```

**Validates:**
- Environment variables
- Node.js/npm versions
- Dependencies freshness
- Prisma client
- Build prerequisites
- Disk space

**Auto-fixes:**
- Reinstalls stale dependencies
- Regenerates Prisma client
- Clears npm cache if needed

**Exit Codes:**
- `0` - All checks passed
- `1` - Critical failures found

### Deploy with Retry (`scripts/deploy-with-retry.sh`)

Smart Vercel deployment wrapper.

**Usage:**
```bash
# Preview deployment
./scripts/deploy-with-retry.sh

# Production deployment
./scripts/deploy-with-retry.sh production
```

**Features:**
- 3 automatic retries
- Exponential backoff (5s, 15s, 30s)
- Transient error detection
- Deployment URL extraction

**Detects:**
- Rate limits (429)
- Timeouts (ETIMEDOUT)
- Network errors (ECONNRESET)
- Service unavailable (502, 503, 504)

**Exit Codes:**
- `0` - Deployment successful
- `1` - All retries failed

### Verify Deployment (`scripts/verify-deployment.sh`)

Post-deployment smoke tests.

**Usage:**
```bash
./scripts/verify-deployment.sh https://your-deployment.vercel.app
```

**Tests:**
- Deployment responds
- Critical endpoints work
- Response time acceptable
- SSL certificate valid
- No error indicators

**Configuration:**
- Max wait: 60 seconds
- Check interval: 5 seconds
- Timeout per request: 10 seconds

**Exit Codes:**
- `0` - All tests passed
- `1` - One or more tests failed

## Configuration

### Deployment Config (`.github/deployment-config.yml`)

Single source of truth for deployment settings.

**Key Sections:**

#### Branches
```yaml
deployment:
  production_branches:
    - main
    - mobile
  preview_branches:
    - ui-redesign-v1
    - develop
    - "*"
```

#### Secrets
```yaml
required_secrets:
  - VERCEL_TOKEN
  - VERCEL_ORG_ID
  - VERCEL_PROJECT_ID

optional_secrets:
  - DATABASE_URL
  - OPENAI_API_KEY
  - LICENSE_SESSION_SECRET
```

#### Strategy
```yaml
strategy:
  max_retries: 3
  initial_backoff: 5
  timeout: 600
  concurrency_queue: true
```

#### Smoke Tests
```yaml
smoke_tests:
  - path: "/"
    expected_status: 200
    description: "Homepage loads"
    critical: true
```

### GitHub Secrets

Configure in: **Settings → Secrets and variables → Actions**

**Required:**
- `VERCEL_TOKEN` - Vercel CLI token
- `VERCEL_ORG_ID` - Organization ID
- `VERCEL_PROJECT_ID` - Project ID

**Optional:**
- `DATABASE_URL` - PostgreSQL connection
- `OPENAI_API_KEY` - OpenAI API key
- `LICENSE_SESSION_SECRET` - License session key
- `STRIPE_SECRET_KEY` - Stripe API key

### Environment Variables

Set in Vercel dashboard for runtime:

**Project Settings → Environment Variables**

Same variables as GitHub secrets, applied to deployment.

## Deployment Process

### Automatic Deployment

1. **Developer pushes code**
   ```bash
   git push origin feature/my-branch
   ```

2. **Workflow triggers**
   - GitHub Actions detects push
   - Master deployment workflow starts

3. **Preflight validation**
   - Validates secrets and environment
   - Auto-fixes common issues
   - Fails fast if critical errors

4. **Build and test**
   - Installs dependencies
   - Runs TypeScript check
   - Executes tests
   - Builds Next.js app

5. **Deploy with retries**
   - Deploys to Vercel
   - Retries on transient failures
   - Extracts deployment URL

6. **Verify deployment**
   - Waits for deployment ready
   - Runs smoke tests
   - Checks response time

7. **Notify developer**
   - Comments on PR/commit
   - Updates commit status
   - Records in ledger

### Manual Deployment

Use scripts locally:

```bash
# 1. Validate environment
./scripts/preflight-check.sh

# 2. Deploy with retries
./scripts/deploy-with-retry.sh production

# 3. Verify deployment
./scripts/verify-deployment.sh $DEPLOYMENT_URL
```

### Emergency Rollback

#### Via Vercel Dashboard
1. Go to vercel.com/dashboard
2. Select project
3. Find previous deployment
4. Click "Promote to Production"

#### Via Vercel CLI
```bash
vercel list
vercel rollback <deployment-url>
```

#### Via Git Revert
```bash
git revert <bad-commit>
git push origin main
```

## Troubleshooting

### Deployment Failures

#### Missing Secrets
**Symptom:** Preflight fails with "Missing required secrets"

**Solution:**
1. Go to GitHub Settings → Secrets
2. Add missing secrets:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

#### Build Failures
**Symptom:** Build job fails

**Solution:**
1. Check TypeScript errors: `npx tsc --noEmit`
2. Check tests: `npm test`
3. Check build: `npm run build`
4. Fix errors and push again

#### Deployment Timeout
**Symptom:** Deploy job times out after 10 minutes

**Solution:**
1. Check Vercel status: status.vercel.com
2. Retry manually: `./scripts/deploy-with-retry.sh`
3. If persistent, check build performance

#### Verification Failures
**Symptom:** Verify job reports errors

**Solution:**
1. Check deployment URL manually
2. Look for error pages
3. Check Vercel logs
4. Verify environment variables

### Workflow Not Triggering

**Symptom:** Push doesn't start workflow

**Check:**
1. Branch is in trigger list
2. Workflow file is valid YAML
3. GitHub Actions enabled in repo

### Slow Deployments

**Symptom:** Deployment takes > 10 minutes

**Causes:**
- Cold cache (first run)
- Large dependencies
- Slow build process

**Solutions:**
1. Cache is automatic after first run
2. Review dependencies
3. Optimize build process

## Migration Guide

### Phase 1: Parallel Operation (Current)

**Status:** Active  
**Duration:** 1 week

**What's Happening:**
- New `master-deploy.yml` runs alongside old workflows
- Both deploy successfully
- Monitoring for issues

**What to Do:**
- Push code normally
- Watch both workflows
- Report any issues

### Phase 2: Monitoring

**Status:** Upcoming  
**Duration:** 1 week

**What's Happening:**
- Collect feedback
- Fix any issues
- Verify all scenarios work

**What to Do:**
- Continue normal development
- Report any workflow issues
- Test edge cases

### Phase 3: Deprecation

**Status:** Planned  
**Duration:** Ongoing

**What's Happening:**
- Old workflows have deprecation notices
- Documentation updated
- Prepare for archival

**What to Do:**
- Use new workflow features
- Update any automation
- Review documentation

### Phase 4: Archival

**Status:** Future  
**Duration:** Permanent

**What's Happening:**
- Old workflows moved to archive
- Master deployment is single source
- Legacy code preserved for reference

**What to Do:**
- Nothing! Just use the new workflow

## Best Practices

### For Developers

1. **Push frequently** - Small, incremental changes
2. **Watch deployments** - Monitor GitHub Actions tab
3. **Test locally** - Run `npm run build` before pushing
4. **Use branches** - Feature branches get preview URLs
5. **Review PR comments** - Check deployment URL before merging

### For Reviewers

1. **Check deployment** - Click preview URL in PR comment
2. **Test functionality** - Verify changes work as expected
3. **Review logs** - Check GitHub Actions for warnings
4. **Validate security** - Review npm audit results

### For Admins

1. **Monitor secrets** - Rotate tokens regularly
2. **Check costs** - Review Vercel usage monthly
3. **Update config** - Adjust `.github/deployment-config.yml` as needed
4. **Review ledger** - Check `.bick/ledger/` for deployment history

## Performance Metrics

### Target Metrics

- **Preflight:** < 30 seconds
- **Build:** < 3 minutes
- **Deploy:** < 3 minutes
- **Verify:** < 30 seconds
- **Total:** < 5 minutes

### Actual Performance

Track in GitHub Actions tab:
- View workflow runs
- Check duration
- Compare over time

## Support

### Getting Help

1. **Documentation:**
   - `README.md` - Quick start
   - `DEPLOYMENT.md` - Platform guides
   - This guide - Comprehensive reference

2. **Issues:**
   - GitHub Issues tab
   - Tag with `ci/cd` label
   - Include workflow run link

3. **Logs:**
   - GitHub Actions tab
   - Click workflow run
   - View job logs

### Reporting Issues

Include:
- Workflow run URL
- Error messages
- Expected vs actual behavior
- Steps to reproduce

---

**Last Updated:** 2026-01-03  
**Version:** 1.0.0  
**Status:** Active (Phase 1)
