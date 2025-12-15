# Branch Workflows & GitHub Actions

This document describes the automated workflows for the HVPE Cloud Portal multi-branch architecture.

## Overview

Each branch in the repository has specific CI/CD workflows configured to ensure code quality, testing, and deployment automation.

## Workflow Files

### 1. Main CI/CD (`ci-deploy.yml`)

**Triggers**: Push or PR to `main` branch

**Steps**:
1. Install dependencies
2. Run linters (ESLint)
3. Run tests (Jest)
4. Build application
5. Run security scans
6. Deploy to production (Vercel)

**Environment Variables Required**:
- `DATABASE_URL`
- `OPENAI_API_KEY` or `HVPE_OPENAI_API_KEY`
- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

### 2. Branch CI (`branch-ci.yml`)

**Triggers**: Push or PR to product branches (bickford, hvpetrader, penelope, bickford-for-defense, bickford-mobile)

**Steps**:
1. Install dependencies
2. Run linters
3. Run tests (branch-specific if available)
4. Build application
5. Deploy to branch-specific preview environment

**Branch-Specific Test Patterns**:
- `bickford`: `**/bickford*.test.ts`
- `hvpetrader`: `**/trading*.test.ts`, `**/optr*.test.ts`
- `penelope`: `**/penelope*.test.ts`, `**/content*.test.ts`
- `bickford-for-defense`: `**/defense*.test.ts`, `**/dod*.test.ts`
- `bickford-mobile`: `**/mobile*.test.ts`

### 3. Branch Sync (`branch-sync.yml`)

**Triggers**: Weekly (Monday 2 AM UTC) or manual

**Purpose**: Keep product branches synchronized with main branch

**Steps**:
1. Checkout each product branch
2. Merge latest from main
3. Run tests to ensure compatibility
4. Push if successful
5. Create issue if conflicts detected

**Branches Synced**:
- bickford
- hvpetrader
- penelope
- bickford-for-defense
- bickford-mobile

### 4. Security Scan (`security.yml`)

**Triggers**: 
- Push to any branch
- Weekly scheduled scan
- Manual dispatch

**Steps**:
1. Run npm audit
2. Run CodeQL analysis
3. Check for dependency vulnerabilities
4. Scan for secrets in commits
5. Report findings as GitHub Security Alerts

### 5. Docker Build (`docker-publish.yml`)

**Triggers**: 
- Push to main
- Tag creation (v*)
- Manual dispatch

**Steps**:
1. Build multi-arch Docker image (amd64, arm64)
2. Run security scan on image
3. Push to GitHub Container Registry
4. Tag with branch name and version
5. Update deployment manifests

**Image Tags**:
- `ghcr.io/bickfordd-bit/hvpe-cloud-portal:latest` (main)
- `ghcr.io/bickfordd-bit/hvpe-cloud-portal:bickford` (bickford branch)
- `ghcr.io/bickfordd-bit/hvpe-cloud-portal:trader` (hvpetrader branch)
- `ghcr.io/bickfordd-bit/hvpe-cloud-portal:v1.2.3` (version tags)

## Creating New Workflows

### For a New Product Branch

1. Create workflow file `.github/workflows/branch-[name].yml`:

```yaml
name: CI - [Branch Name]

on:
  push:
    branches: [ branch-name ]
  pull_request:
    branches: [ branch-name ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run branch-specific tests
        run: npm test -- --testPathPattern=branch-name
      
      - name: Build
        run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod --branch=branch-name'
```

2. Configure secrets in GitHub Settings → Secrets and variables → Actions

3. Add deployment environment in GitHub Settings → Environments

## Environment-Specific Configurations

### Production (main)
- **URL**: `https://hvpe-cloud-portal.vercel.app`
- **Database**: Production PostgreSQL
- **API Keys**: Production keys
- **Protection**: Requires approval for deployment

### Staging (product branches)
- **URL**: `https://[branch-name].hvpe-cloud-portal.vercel.app`
- **Database**: Staging PostgreSQL or production read-replica
- **API Keys**: Development/staging keys
- **Protection**: Auto-deploy on push

### Preview (PR branches)
- **URL**: `https://[pr-number].hvpe-cloud-portal.vercel.app`
- **Database**: Shared staging database
- **API Keys**: Development keys
- **Protection**: Ephemeral, deleted after PR close

## Manual Workflow Triggers

Some workflows can be manually triggered from GitHub Actions tab:

### Sync Branch with Main

```bash
# Via GitHub CLI
gh workflow run branch-sync.yml -f branch=bickford

# Via UI: Actions → Branch Sync → Run workflow → Select branch
```

### Deploy to Environment

```bash
# Deploy specific branch to staging
gh workflow run branch-ci.yml -f branch=hvpetrader -f environment=staging
```

### Build Docker Image

```bash
# Build and push Docker image for specific branch
gh workflow run docker-publish.yml -f branch=bickford-mobile -f tag=mobile-v1.2.3
```

## Workflow Status Badges

Add status badges to branch READMEs:

### Main Branch
![CI Status](https://github.com/bickfordd-bit/hvpe-cloud-portal/workflows/CI%20-%20Main/badge.svg)
![Deploy Status](https://github.com/bickfordd-bit/hvpe-cloud-portal/workflows/Deploy%20-%20Production/badge.svg)

### Product Branches
![Bickford CI](https://github.com/bickfordd-bit/hvpe-cloud-portal/workflows/CI%20-%20Bickford/badge.svg)
![Trader CI](https://github.com/bickfordd-bit/hvpe-cloud-portal/workflows/CI%20-%20Trader/badge.svg)

## Secrets Management

### Required Secrets (All Branches)
- `OPENAI_API_KEY` or `HVPE_OPENAI_API_KEY`
- `DATABASE_URL`

### Deployment Secrets
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

### Branch-Specific Secrets
- `ALPACA_API_KEY` (hvpetrader)
- `ALPACA_SECRET_KEY` (hvpetrader)
- `DOD_API_KEY` (bickford-for-defense)
- `CMMC_COMPLIANCE_MODE` (bickford-for-defense)

### Adding Secrets

```bash
# Via GitHub CLI
gh secret set SECRET_NAME -b"secret_value" --env production

# Or via UI: Settings → Secrets and variables → Actions → New repository secret
```

## Monitoring & Alerts

### Workflow Failure Alerts

Configure Slack/Discord webhook for failure notifications:

1. Add webhook URL to secrets: `SLACK_WEBHOOK_URL`
2. Update workflow to include notification step:

```yaml
- name: Notify on failure
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Workflow failed for branch: ${{ github.ref }}'
    webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Deployment Notifications

Notify team when deployments succeed:

```yaml
- name: Notify deployment success
  uses: 8398a7/action-slack@v3
  with:
    status: success
    text: 'Deployed to ${{ env.ENVIRONMENT }}'
    webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## Debugging Workflows

### View Workflow Logs

```bash
# List recent runs
gh run list --workflow=branch-ci.yml

# View specific run
gh run view [run-id]

# Download logs
gh run download [run-id]
```

### Re-run Failed Workflows

```bash
# Re-run failed jobs only
gh run rerun [run-id] --failed

# Re-run entire workflow
gh run rerun [run-id]
```

### Test Workflows Locally

Use [act](https://github.com/nektos/act) to test workflows locally:

```bash
# Install act
brew install act  # macOS
# or
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Run workflow locally
act push -W .github/workflows/branch-ci.yml

# With secrets
act push -W .github/workflows/branch-ci.yml -s OPENAI_API_KEY=sk-...
```

## Performance Optimization

### Caching

All workflows use npm cache to speed up builds:

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'  # Automatically caches node_modules
```

### Parallel Jobs

Split tests across multiple jobs for faster feedback:

```yaml
jobs:
  test:
    strategy:
      matrix:
        node-version: [18, 20]
        test-suite: [unit, integration, e2e]
    runs-on: ubuntu-latest
    steps:
      - run: npm test -- --testPathPattern=${{ matrix.test-suite }}
```

### Conditional Execution

Skip unnecessary jobs based on changed files:

```yaml
- name: Check for code changes
  uses: dorny/paths-filter@v2
  id: filter
  with:
    filters: |
      src:
        - 'src/**'
      tests:
        - '**/*.test.ts'

- name: Run tests
  if: steps.filter.outputs.src == 'true' || steps.filter.outputs.tests == 'true'
  run: npm test
```

## Troubleshooting

### Common Issues

**Issue**: Workflow fails with "Resource not accessible by integration"
**Solution**: Ensure workflow has correct permissions in repository settings

**Issue**: Deploy fails with "Invalid token"
**Solution**: Regenerate and update deployment tokens (Vercel, etc.)

**Issue**: Tests fail in CI but pass locally
**Solution**: Check environment variables, Node version, and timezone settings

**Issue**: Branch sync creates conflicts
**Solution**: Manually resolve conflicts and push, workflow will resume on next run

## Best Practices

1. **Keep workflows DRY**: Use reusable workflows for common tasks
2. **Fail fast**: Run linters and quick tests before long-running jobs
3. **Cache aggressively**: Cache dependencies and build artifacts
4. **Monitor costs**: GitHub Actions has usage limits, optimize workflow runs
5. **Secure secrets**: Never log secrets, use masked values in outputs
6. **Test locally**: Use `act` to test workflows before pushing
7. **Document changes**: Update this file when modifying workflows

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Security Hardening](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [Vercel GitHub Integration](https://vercel.com/docs/git/vercel-for-github)

---

**Maintained by**: DevOps Team  
**Last Updated**: December 2025
