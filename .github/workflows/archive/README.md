# Archived Workflows

This directory contains archived workflow files that have been replaced by the unified `master-deploy.yml` workflow.

## Why These Were Archived

The HVPE Cloud Portal previously had **10+ overlapping workflow files** that created:
- Silent failures when secrets weren't configured
- Deployment collisions (simultaneous pushes)
- Manual approval interruptions
- Limited deployment visibility
- No retry logic for transient failures
- Branch-specific confusion

## The New Unified Approach

All deployment functionality has been consolidated into a single workflow:

**`.github/workflows/master-deploy.yml`**

### Key Features

✅ **Single Entry Point** - One workflow handles all deployments  
✅ **Branch Awareness** - Automatic production vs preview detection  
✅ **Concurrency Protection** - Queues instead of canceling  
✅ **Smart Retries** - 3 automatic retries with exponential backoff  
✅ **Preflight Validation** - Catches issues before deployment  
✅ **Real-time Status** - GitHub commit status API integration  
✅ **Auto-fixes** - Clears cache, fixes dependencies  
✅ **Full Visibility** - Progress updates and notifications  

### Workflow Logic Flow

```
Push/PR → Preflight → Build → Test → Deploy → Verify → Notify
   ↓         ↓         ↓      ↓      ↓        ↓        ↓
Validate  Secrets   Cache  Jest  Vercel  Smoke    Status
Config    Check     Build       +Retry  Tests    Comment
```

## Archived Workflows

### Production Workflows (Replaced)

1. **`ci-cd.yml`** - Main CI/CD pipeline
   - ✅ Replaced by: Preflight + Build + Deploy jobs in master-deploy.yml
   - Features moved: Quality checks, tests, build verification, deployment
   
2. **`deploy-vercel.yml`** - Vercel deployment
   - ✅ Replaced by: Deploy job with retry logic in master-deploy.yml
   - Features moved: Vercel deployment, smoke tests, PR comments

3. **`ci-deploy.yml`** - UI redesign branch specific
   - ✅ Replaced by: Branch detection in master-deploy.yml
   - Features moved: Build artifacts, conditional deployment

### Supporting Workflows (Kept)

4. **`docker-publish.yml`** - Container builds (KEPT - different purpose)
5. **`prisma-migrate.yml`** - Database migrations (KEPT - manual trigger)
6. **`database-migrations.yml`** - Manual DB operations (KEPT - manual trigger)
7. **`health-checks.yml`** - Scheduled health monitoring (KEPT - different purpose)
8. **`release.yml`** - Release management (KEPT - different purpose)
9. **`seed-jake-license.yml`** - License seeding (KEPT - manual trigger)
10. **`auto-merge-dependabot.yml`** - Dependabot automation (KEPT - different purpose)

## Migration Timeline

### Phase 1 (Current)
✅ New `master-deploy.yml` created and enabled  
✅ Old workflows archived but still functional  
⏳ Running in parallel for monitoring period

### Phase 2 (After 1 week)
⏳ Monitor new workflow for issues  
⏳ Collect feedback and fix problems  
⏳ Verify all scenarios work correctly

### Phase 3 (After verification)
⏳ Add deprecation notices to old workflows  
⏳ Update documentation to reference only new workflow  
⏳ Disable old deployment workflows

### Phase 4 (After 2 weeks of successful runs)
⏳ Keep archived workflows for reference only  
⏳ Master deployment is the single source of truth  

## How to Use the New Workflow

The new workflow activates automatically on push/PR to:
- `main` (production deployment)
- `mobile` (production deployment)
- `ui-redesign-v1` (preview deployment)
- `develop` (preview deployment)
- Any other branch (preview deployment)

No manual intervention needed! Just:
1. Push your code
2. Watch the deployment progress in GitHub Actions
3. Get notified when complete

## Rollback Instructions

If you need to temporarily revert to old workflows:

```bash
# Move workflows back from archive
mv .github/workflows/archive/ci-cd.yml .github/workflows/
mv .github/workflows/archive/deploy-vercel.yml .github/workflows/

# Disable new workflow
mv .github/workflows/master-deploy.yml .github/workflows/master-deploy.yml.disabled
```

Then push these changes to activate old workflows.

## Support Scripts

The new workflow uses these helper scripts:

- **`scripts/preflight-check.sh`** - Pre-deployment validation
- **`scripts/deploy-with-retry.sh`** - Smart retry wrapper
- **`scripts/verify-deployment.sh`** - Post-deployment verification

These can also be run manually:

```bash
# Validate before deploying
./scripts/preflight-check.sh

# Deploy with retries
./scripts/deploy-with-retry.sh production

# Verify a deployment
./scripts/verify-deployment.sh https://your-url.vercel.app
```

## Configuration

Deployment configuration is centralized in:

**`.github/deployment-config.yml`**

This includes:
- Branch settings
- Required/optional secrets
- Retry strategy
- Health check configuration
- Smoke test definitions
- Notification preferences

## Questions?

See the comprehensive guide: **`docs/CI_CD_GUIDE.md`**

Or check the main documentation:
- `README.md` - Quick start
- `DEPLOYMENT.md` - Deployment platforms
- `.github/workflows/master-deploy.yml` - Inline comments

---

**Last Updated:** 2026-01-03  
**Migration Status:** Phase 1 - Parallel Operation  
**Next Review:** 2026-01-10
