# Automation Documentation

**Status:** Fully automated CI/CD pipeline  
**Last Updated:** 2025-12-19

---

## Overview

Complete automation suite with 5 GitHub Actions workflows:

1. **CI/CD Pipeline** - Build, test, deploy
2. **Auto-merge Dependabot** - Automatic dependency updates
3. **Database Migrations** - Manual trigger for schema updates
4. **Health Checks** - Nightly production monitoring
5. **Automated Releases** - Tag-based release creation

---

## Workflows

### 1. CI/CD Pipeline (`ci-cd.yml`)

**Triggers:**
- Every push to `mobile` or `main`
- Every pull request

**Jobs:**

#### Quality Checks
- TypeScript compilation
- ESLint linting
- Prettier formatting

#### Tests
- Jest unit tests
- Coverage reports
- Upload to Codecov

#### Build Verification
- Production build test
- Next.js output validation

#### Security Audit
- npm audit
- Snyk security scan

#### Production Deployment
- Automatic deploy to Vercel on `mobile` push
- Creates commit comment with URL
- Only runs after all checks pass

#### Preview Deployment
- Deploy PR previews to Vercel
- Comment on PR with preview URL
- Automatic cleanup

#### Codex Notification
- Triggers Codex sync webhook
- Notifies of successful deployment

#### Ledger Recording
- Creates `.bick/ledger` entry
- Commits and pushes automatically

**Secrets Required:**
- `VERCEL_TOKEN` - Vercel deployment token
- `CODEX_WEBHOOK_SECRET` - Codex automation secret
- `SNYK_TOKEN` - Security scanning (optional)

---

### 2. Auto-merge Dependabot (`auto-merge-dependabot.yml`)

**Triggers:**
- Dependabot pull requests

**Actions:**
- Auto-approves Dependabot PRs
- Auto-merges patch/minor updates
- Skips major version updates (manual review)

**Requires:**
- Dependabot enabled in repository settings

---

### 3. Database Migrations (`database-migrations.yml`)

**Triggers:**
- Manual workflow dispatch

**Options:**
- Production
- Staging
- Development

**Actions:**
- Runs Prisma migrations
- Validates schema
- Creates ledger entry
- Commits proof of migration

**Secrets Required:**
- `DATABASE_URL` - PostgreSQL connection string

**Usage:**
```bash
# Via GitHub UI
Actions → Database Migrations → Run workflow → Select environment

# Via CLI
gh workflow run database-migrations.yml -f environment=production
```

---

### 4. Health Checks (`health-checks.yml`)

**Triggers:**
- Nightly at 2 AM UTC
- Manual workflow dispatch

**Actions:**
- Checks `/api/health`
- Checks `/api/bickford`
- Checks `/api/codex/sync`
- Checks `/api/persistence`
- Creates GitHub issue on failure

**Monitoring:**
- Daily production health verification
- Automatic issue creation on failure
- Email notifications (via GitHub)

---

### 5. Automated Releases (`release.yml`)

**Triggers:**
- Git tags matching `v*.*.*` (e.g., `v1.0.0`)

**Actions:**
- Generates changelog from commits
- Creates GitHub release
- Creates ledger entry
- Marks pre-releases (alpha/beta)

**Usage:**
```bash
# Create release
git tag v1.0.0
git push origin v1.0.0

# Workflow automatically:
# 1. Generates changelog
# 2. Creates GitHub release
# 3. Records to ledger
```

---

## Setup Instructions

### 1. Add Repository Secrets

Go to: `Settings → Secrets and variables → Actions`

**Required:**
```
VERCEL_TOKEN=vercel_token_here
CODEX_WEBHOOK_SECRET=d38c9f08d6b06e76efd600998fd765202efaabc109d09d2b8ad7728f4b93b12a
DATABASE_URL=postgresql://user:pass@host:5432/db
```

**Optional:**
```
SNYK_TOKEN=your_snyk_token
```

### 2. Get Vercel Token

```bash
# Login to Vercel
vercel login

# Create token
vercel tokens create "GitHub Actions" --scope hvpe-cloud-portal

# Copy token and add to GitHub secrets
```

### 3. Enable Workflows

All workflows are enabled by default. Check:
```
Actions tab → See all workflows
```

### 4. Configure Branch Protection (Optional)

`Settings → Branches → Add rule` for `mobile`:
- ✅ Require status checks to pass
  - `Code Quality`
  - `Run Tests`
  - `Build Verification`
- ✅ Require branches to be up to date
- ✅ Require linear history

---

## What Gets Automated

### On Every Push to `mobile`

1. ✅ **Quality checks** run (TypeScript, ESLint, Prettier)
2. ✅ **Tests** execute with coverage reports
3. ✅ **Build** verified
4. ✅ **Security** audit runs
5. ✅ **Deploy** to Vercel production
6. ✅ **Codex** notified of deployment
7. ✅ **Ledger** entry created and committed

**Total time:** ~5-8 minutes

### On Every Pull Request

1. ✅ **Quality checks** run
2. ✅ **Tests** execute
3. ✅ **Build** verified
4. ✅ **Preview** deployment created
5. ✅ **Comment** added to PR with preview URL

### Daily (2 AM UTC)

1. ✅ **Health checks** run on production
2. ✅ **Issue created** if any check fails

### On Dependabot PR

1. ✅ **Auto-approved**
2. ✅ **Auto-merged** (patch/minor only)

### On Git Tag (`v*.*.*`)

1. ✅ **Release created** with changelog
2. ✅ **Ledger entry** created

---

## Monitoring Deployments

### GitHub Actions Tab
- View all workflow runs
- See detailed logs
- Download artifacts

### Vercel Dashboard
- Real-time deployment status
- Function logs
- Performance metrics
- Analytics

### Commit Comments
Every production deployment adds a comment:
```
🚀 Deployed to production: https://hvpe-cloud-portal.vercel.app
```

---

## Triggering Manual Workflows

### Database Migrations
```bash
gh workflow run database-migrations.yml -f environment=production
```

### Health Check
```bash
gh workflow run health-checks.yml
```

### Via GitHub UI
`Actions → Select workflow → Run workflow`

---

## Rollback Strategy

### Automatic (Vercel)
1. Go to Vercel dashboard
2. Find previous deployment
3. Click "Promote to Production"
4. Instant rollback (no downtime)

### Manual (GitHub)
```bash
# Revert commit
git revert HEAD
git push origin mobile

# Workflow auto-deploys reverted code
```

---

## Failure Handling

### Build Failure
- ❌ Deployment blocked
- 📧 Email notification sent
- 🔍 Check logs in Actions tab

### Test Failure
- ❌ Deployment blocked
- 📊 Coverage report still uploaded
- 🐛 Fix tests, push again

### Deployment Failure
- 🔄 Previous deployment still live
- 📧 Notification sent
- 🔍 Check Vercel logs

### Health Check Failure
- 🚨 Issue automatically created
- 📧 Email notification
- 🔍 Check production logs

---

## Best Practices

### Commit Messages
```bash
# Triggers full pipeline
git commit -m "feat: add new feature"

# Skip CI (use sparingly)
git commit -m "docs: update README [skip ci]"
```

### Pull Requests
- Create PR → Preview deployed automatically
- Review preview before merging
- Merge → Auto-deploy to production

### Releases
```bash
# Create semantic version tags
git tag v1.0.0   # Major release
git tag v1.1.0   # Minor release
git tag v1.1.1   # Patch release
git tag v1.2.0-beta.1  # Pre-release

# Push tag
git push origin v1.0.0
```

---

## Debugging Workflows

### View logs
```bash
# List recent runs
gh run list

# View specific run
gh run view <run-id>

# Download logs
gh run download <run-id>
```

### Re-run failed jobs
```bash
gh run rerun <run-id>
```

### Cancel running workflow
```bash
gh run cancel <run-id>
```

---

## Costs

### GitHub Actions
- ✅ **2,000 minutes/month** free (public repos)
- ✅ **Unlimited** for public repos
- ⏱️ ~8 minutes per workflow run
- 📊 ~250 deployments/month free

### Vercel
- ✅ **100 GB-hours/month** free
- ✅ **Unlimited** bandwidth
- 💰 Pro plan if needed ($20/month)

---

## Maintenance

### Weekly
- ✅ Review Dependabot PRs (auto-merged)
- ✅ Check health check status

### Monthly
- ✅ Review security audit results
- ✅ Update GitHub Actions versions
- ✅ Review Vercel analytics

### Quarterly
- ✅ Audit secrets and tokens
- ✅ Review workflow efficiency
- ✅ Update automation documentation

---

## Status

- ✅ **CI/CD Pipeline** - Active
- ✅ **Auto-merge Dependabot** - Active
- ✅ **Database Migrations** - Manual trigger ready
- ✅ **Health Checks** - Nightly at 2 AM UTC
- ✅ **Automated Releases** - Tag-triggered
- ✅ **Vercel Integration** - Connected
- ✅ **Codex Sync** - Webhook configured
- ✅ **Bickford Ledger** - Auto-recording

---

**Everything is automated.** Push code → Tests run → Builds → Deploys → Notifies → Records → Done. 🚀
