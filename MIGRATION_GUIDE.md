# Migration Guide: Separate Repositories to Branch Architecture

This guide helps teams migrate from separate repositories to the new branch-based architecture in HVPE Cloud Portal.

## Overview

**Before**: Multiple separate repositories (bickford-mobile, hvpetrader, penelope, etc.)  
**After**: Single repository with branches for each project

## Benefits of Migration

✅ **Simplified Dependency Management**: Shared code updates automatically  
✅ **Easier Code Reuse**: Import from shared `@/lib` without npm packages  
✅ **Unified CI/CD**: One workflow for all projects  
✅ **Better Collaboration**: Cross-team changes in single PRs  
✅ **Consistent Tooling**: Same linters, formatters, test runners  
✅ **Reduced Overhead**: No need to sync changes across repos  

## Pre-Migration Checklist

Before migrating, ensure you have:

- [ ] Full backup of the separate repository
- [ ] List of all open PRs and issues
- [ ] Documentation of custom build/deploy scripts
- [ ] List of repository-specific secrets and environment variables
- [ ] Team members notified of migration plan
- [ ] Access to HVPE Cloud Portal repository
- [ ] Local clone of both repositories

## Migration Steps

### Step 1: Prepare the Source Repository

```bash
# Clone your separate repository
cd /tmp
git clone https://github.com/your-org/separate-repo.git
cd separate-repo

# Create a final release tag
git tag -a v-final-before-migration -m "Final version before migrating to hvpe-cloud-portal"
git push origin v-final-before-migration

# Export list of open issues and PRs
gh issue list --state open > /tmp/issues-export.txt
gh pr list --state open > /tmp/prs-export.txt
```

### Step 2: Create the Branch in hvpe-cloud-portal

```bash
# Clone hvpe-cloud-portal (if you haven't already)
cd /tmp
git clone https://github.com/bickfordd-bit/hvpe-cloud-portal.git
cd hvpe-cloud-portal

# Create your branch from main (or current base)
git checkout main  # or the appropriate base branch
git pull origin main
git checkout -b your-branch-name  # e.g., bickford-mobile
```

### Step 3: Copy Code and Refactor

```bash
# Copy source files
# Adjust paths based on your project structure

# Copy application code
cp -r /tmp/separate-repo/src/* ./src/
# or create a subdirectory if needed
# mkdir -p ./src/apps/your-branch
# cp -r /tmp/separate-repo/src/* ./src/apps/your-branch/

# Copy tests
cp -r /tmp/separate-repo/__tests__/* ./src/lib/your-branch/__tests__/ 2>/dev/null || true
cp -r /tmp/separate-repo/tests/* ./src/lib/your-branch/__tests__/ 2>/dev/null || true

# Copy documentation
cp /tmp/separate-repo/README.md ./BRANCH_YOUR_BRANCH_README.md
cp -r /tmp/separate-repo/docs/* ./docs/your-branch/ 2>/dev/null || true

# Copy configuration files (selectively!)
# Only copy if they differ from hvpe-cloud-portal defaults
# cp /tmp/separate-repo/.eslintrc.json ./.eslintrc.your-branch.json  # if needed
```

### Step 4: Update Import Paths

The biggest refactoring task is updating imports to use the `@/` alias:

```bash
# Find all import statements that need updating
grep -r "from '\.\." ./src/ | grep -v node_modules

# Example conversions:
# Before: import { something } from '../../lib/utils'
# After:  import { something } from '@/lib/utils'

# Before: import { api } from '../../../api/client'
# After:  import { api } from '@/lib/api/client'
```

**Script to help automate** (use with caution, review changes):

```bash
# Convert relative imports to absolute
find ./src -name "*.ts" -o -name "*.tsx" | while read file; do
    # This is a simplified example - adjust regex for your needs
    sed -i "s|from '\.\./\.\./lib/|from '@/lib/|g" "$file"
    sed -i "s|from '\.\./\.\./\.\./lib/|from '@/lib/|g" "$file"
done
```

### Step 5: Merge Dependencies

Update `package.json` to merge dependencies:

```bash
# View dependencies from old repo
cat /tmp/separate-repo/package.json

# Manually add any unique dependencies to hvpe-cloud-portal/package.json
# Then install
npm install
```

**Tips:**
- Don't duplicate dependencies that already exist
- Use same version as hvpe-cloud-portal where possible
- Document version differences if necessary

### Step 6: Configure Environment Variables

```bash
# Create branch-specific section in .env.example
cat >> .env.example << 'EOF'

# -----------------------------------------------------------------------------
# YOUR_BRANCH - Description
# -----------------------------------------------------------------------------
# YOUR_BRANCH_API_KEY=...
# YOUR_BRANCH_CONFIG=...
EOF

# Copy your actual .env to .env.local and update
cp /tmp/separate-repo/.env .env.local.old
# Manually merge into hvpe-cloud-portal/.env.local
```

### Step 7: Update Build and Test Scripts

If your old repo had custom scripts:

```bash
# Check old scripts
cat /tmp/separate-repo/package.json | jq .scripts

# Add branch-specific scripts to hvpe-cloud-portal/package.json
# Example:
# "build:your-branch": "next build && <your-custom-build-steps>"
# "test:your-branch": "jest --testPathPattern=your-branch"
```

### Step 8: Commit and Push

```bash
# Review all changes
git status
git diff

# Stage changes
git add .

# Commit with detailed message
git commit -m "Migrate from separate-repo to your-branch

Migrated codebase from github.com/your-org/separate-repo (v-final-before-migration)
to hvpe-cloud-portal your-branch.

Changes:
- Moved source code to src/
- Updated imports to use @/ alias
- Merged dependencies into package.json
- Added branch-specific environment variables
- Updated documentation

See MIGRATION_GUIDE.md for details."

# Push to remote
git push -u origin your-branch
```

### Step 9: Verify Functionality

```bash
# Install dependencies
npm install

# Run linter
npm run lint

# Run tests
npm test -- --testPathPattern=your-branch

# Build
npm run build

# Start dev server
npm run dev

# Manual testing
# Open http://localhost:3000 and test your features
```

### Step 10: Migrate Issues and PRs

For each open issue/PR in the old repo:

1. Create new issue in hvpe-cloud-portal
2. Add label `branch:your-branch`
3. Reference old issue: "Migrated from org/repo#123"
4. Close old issue with comment: "Migrated to hvpe-cloud-portal#456"

**Automated approach** (requires GitHub CLI and API token):

```bash
# Export from old repo
cd /tmp/separate-repo
gh issue list --json number,title,body,labels --state open > issues.json

# Import to hvpe-cloud-portal (script this or do manually)
# For each issue, create in new repo with branch label
```

### Step 11: Archive Old Repository

**DO NOT DELETE** the old repository immediately!

```bash
# Mark as archived on GitHub
gh repo archive your-org/separate-repo

# Add notice to README
cat > /tmp/separate-repo/README.md << 'EOF'
# ⚠️ This Repository Has Been Archived

This project has been migrated to [hvpe-cloud-portal](https://github.com/bickfordd-bit/hvpe-cloud-portal) as the `your-branch` branch.

## Migration Details

- **Migration Date**: [Date]
- **Final Version**: v-final-before-migration
- **New Location**: https://github.com/bickfordd-bit/hvpe-cloud-portal/tree/your-branch

## For Contributors

Please direct all new issues, PRs, and contributions to the new repository.

## For Users

The functionality remains the same, just in a new location. See the [Branch Architecture](https://github.com/bickfordd-bit/hvpe-cloud-portal/blob/main/BRANCH_ARCHITECTURE.md) for details.
EOF

# Commit and push the archive notice
git add README.md
git commit -m "Archive notice: Migrated to hvpe-cloud-portal"
git push origin main

# Actually archive via GitHub settings
# Settings → Danger Zone → Archive this repository
```

### Step 12: Update CI/CD

If the old repo had CI/CD:

1. **Disable old workflows**: In old repo, disable GitHub Actions
2. **Configure new workflows**: Add branch-specific workflow in hvpe-cloud-portal
3. **Migrate secrets**: Copy necessary secrets to hvpe-cloud-portal repository settings
4. **Update deployment**: Point deployments to new branch

```bash
# Create branch-specific workflow
cat > .github/workflows/your-branch-ci.yml << 'EOF'
name: CI - Your Branch

on:
  push:
    branches: [ your-branch ]
  pull_request:
    branches: [ your-branch ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm test -- --testPathPattern=your-branch
      - run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
EOF

git add .github/workflows/your-branch-ci.yml
git commit -m "Add CI workflow for your-branch"
git push origin your-branch
```

### Step 13: Update Documentation

Update all references to the old repository:

- [ ] Team wiki/docs
- [ ] Deployment guides
- [ ] Onboarding materials
- [ ] External documentation
- [ ] Links in other repos

### Step 14: Notify Team

Send announcement to team:

```
Subject: Migration Complete: separate-repo → hvpe-cloud-portal/your-branch

Hi Team,

We've successfully migrated `separate-repo` to the hvpe-cloud-portal 
repository as the `your-branch` branch.

What you need to do:
1. Clone hvpe-cloud-portal (if you haven't): 
   git clone https://github.com/bickfordd-bit/hvpe-cloud-portal.git

2. Checkout the branch: 
   git checkout your-branch

3. Install dependencies: 
   npm install

4. Copy your .env.local settings (see .env.example)

5. Start developing: 
   npm run dev

Resources:
- Branch Architecture: [Link to BRANCH_ARCHITECTURE.md]
- Quick Start Guide: [Link to BRANCH_QUICK_START.md]
- Migration was from commit: [commit hash]

Questions? See the Migration Guide or ask in #dev-chat.

Thanks!
```

## Common Migration Issues

### Issue: Import Paths Not Resolving

**Problem**: `Cannot find module '@/lib/something'`

**Solution**:
```bash
# Ensure tsconfig.json has path alias (it should already)
cat tsconfig.json | grep -A5 paths

# If missing, the default hvpe-cloud-portal config should have:
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Issue: Tests Failing

**Problem**: Tests that passed in old repo fail in new branch

**Solution**:
```bash
# Check test path patterns
npm test -- --testPathPattern=your-branch --verbose

# Update jest.config.ts if needed
# Ensure tests are in correct location: src/lib/your-branch/__tests__/
```

### Issue: Build Failures

**Problem**: Build fails with dependency errors

**Solution**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Check for peer dependency conflicts
npm list --depth=0

# Update next.config.ts if you had custom webpack config
```

### Issue: Environment Variables Not Working

**Problem**: Features that worked before now fail with missing env vars

**Solution**:
```bash
# Verify .env.local has all required variables
cat .env.local

# Check that variables are properly prefixed for client-side
# Only NEXT_PUBLIC_* vars are available in browser
# See: https://nextjs.org/docs/app/building-your-application/configuring/environment-variables
```

### Issue: Deployment Fails

**Problem**: Vercel deployment fails after migration

**Solution**:
1. Check Vercel project settings → Environment Variables
2. Ensure all secrets from old project are copied
3. Set correct branch in Git integration
4. Re-run deployment

## Rollback Plan

If migration fails and you need to rollback:

```bash
# Old repo is archived but still accessible
# 1. Un-archive the repository temporarily
# 2. Re-enable workflows
# 3. Deploy latest version
# 4. Investigate issues in hvpe-cloud-portal branch
# 5. Fix and retry migration
```

**Note**: Keep old repo accessible for at least 90 days after migration.

## Post-Migration Checklist

After successful migration:

- [ ] All tests passing in new branch
- [ ] Build succeeds
- [ ] Deployment works
- [ ] All team members can access new branch
- [ ] Issues/PRs migrated
- [ ] CI/CD configured
- [ ] Documentation updated
- [ ] Old repo archived
- [ ] Team notified
- [ ] Monitor for issues for 2 weeks
- [ ] After 90 days: Consider deleting old repo (with backups!)

## Need Help?

- 📖 See [BRANCH_ARCHITECTURE.md](./BRANCH_ARCHITECTURE.md)
- 🚀 See [BRANCH_QUICK_START.md](./BRANCH_QUICK_START.md)
- 💬 Ask in GitHub Discussions
- 🐛 Report issues with label `migration`

---

**Migration Template Version**: 1.0  
**Last Updated**: December 2025
