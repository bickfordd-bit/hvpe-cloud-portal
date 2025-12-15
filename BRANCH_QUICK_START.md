# Branch Quick Start Guide

> **TL;DR**: HVPE Cloud Portal uses branches instead of separate repos. Pick your branch, checkout, code, commit, push. 🚀

## 🏃 Quick Start

### New to the project?

```bash
# 1. Clone the repo
git clone https://github.com/bickfordd-bit/hvpe-cloud-portal.git
cd hvpe-cloud-portal

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env.local
# Edit .env.local with your values

# 4. Start development server
npm run dev

# 5. Open http://localhost:3000
```

### Working on a specific branch?

```bash
# Checkout your branch
git checkout bickford-mobile  # or hvpetrader, penelope, etc.

# Make sure it's up to date
git pull origin bickford-mobile

# Start coding!
npm run dev
```

## 🌳 Available Branches

### Product Branches (Active Development)

| Branch | Purpose | Deploy URL | Owner |
|--------|---------|------------|-------|
| **main** | Production portal | hvpe-cloud-portal.vercel.app | Core Team |
| **bickford** | Core AI features | bickford.hvpe.app | AI Team |
| **bickford-mobile** | Mobile app | mobile.hvpe.app | Mobile Team |
| **hvpetrader** | Trading platform | trader.hvpe.app | Trading Team |
| **bickford-for-defense** | DoD version | defense.hvpe.app | Defense Team |
| **penelope** | Content generation | penelope.hvpe.app | Content Team |

### Personal Branches (Experimentation)

| Branch | Purpose | Owner |
|--------|---------|-------|
| **dad** | Family financial features | Personal |
| **derek-and-jenna** | Shared projects | Personal |
| **xavier** | Personal experiments | Personal |
| **naomi** | Personal experiments | Personal |

## 🔧 Common Tasks

### Create a feature in your branch

```bash
# From your branch, create a feature branch
git checkout bickford
git checkout -b bickford/my-feature

# Work on your feature
# ... code code code ...

# Commit your changes
git add .
git commit -m "feat: add amazing feature"

# Push to remote
git push -u origin bickford/my-feature

# Create PR back to bickford branch
gh pr create --base bickford --title "My amazing feature"
```

### Sync your branch with main

```bash
# Get latest from main
git checkout main
git pull origin main

# Switch to your branch
git checkout bickford

# Merge main into your branch
git merge main

# If conflicts, resolve them
# ... fix conflicts ...
git add .
git commit -m "Merge main into bickford"

# Push to remote
git push origin bickford
```

### Test your changes

```bash
# Run linter
npm run lint

# Run all tests
npm test

# Run branch-specific tests
npm test -- --testPathPattern=bickford

# Build to ensure no errors
npm run build
```

### Deploy preview

```bash
# Push to your branch - auto deploys preview
git push origin bickford

# Check deployment status
gh run list --workflow=branch-ci.yml

# View deployment URL in PR comments or Vercel dashboard
```

## 📋 Development Checklist

Before creating a PR:

- [ ] Code follows style guidelines (`npm run lint`)
- [ ] Tests pass (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Branch is synced with main
- [ ] Environment variables documented (if new)
- [ ] README updated (if needed)
- [ ] No secrets committed
- [ ] Changes tested locally

## 🚨 Common Issues

### "Branch not found"

```bash
# Create the branch locally from remote
git fetch origin
git checkout -b bickford origin/bickford
```

### "Merge conflicts"

```bash
# Show conflicting files
git status

# Edit files to resolve conflicts
# Look for <<<<<<< HEAD markers

# After resolving
git add .
git commit -m "Resolve merge conflicts"
```

### "Tests failing in CI but pass locally"

1. Check Node version matches CI (see `.github/workflows/`)
2. Ensure all dependencies are in package.json (not global)
3. Check environment variables are set in CI
4. Run tests with `npm ci` instead of `npm install`

### "Deploy failed"

1. Check Vercel dashboard for error logs
2. Ensure DATABASE_URL is set in Vercel project settings
3. Verify all required env vars are configured
4. Check build logs in GitHub Actions

## 🎯 Branch-Specific Setup

### Bickford Mobile

```bash
git checkout bickford-mobile
npm install

# Add to .env.local:
# MOBILE_API_URL=http://localhost:3000
# MOBILE_PUSH_NOTIFICATION_KEY=...

npm run dev
```

### HVPE Trader

```bash
git checkout hvpetrader
npm install

# Add to .env.local:
# ALPACA_API_KEY=PK...
# ALPACA_SECRET_KEY=...
# OPTR_WORKER_URL=http://localhost:8787

# Start Python worker (for trading)
cd scripts/optr
python3 worker_http.py

# In another terminal, start Next.js
npm run dev
```

### Bickford for Defense

```bash
git checkout bickford-for-defense
npm install

# Add to .env.local:
# DOD_API_KEY=...
# CMMC_COMPLIANCE_MODE=true
# SAM_API_KEY=...

npm run dev
```

### Penelope

```bash
git checkout penelope
npm install

# Add to .env.local:
# PENELOPE_MODEL=gpt-4-turbo-preview
# CONTENT_STORAGE_URL=...

npm run dev
```

## 📚 Learn More

### Documentation

- 📖 [BRANCH_ARCHITECTURE.md](./BRANCH_ARCHITECTURE.md) - Full branch architecture guide
- 🔄 [.github/BRANCH_STRATEGY.md](./.github/BRANCH_STRATEGY.md) - GitHub workflows and strategy
- ⚙️ [.github/BRANCH_WORKFLOWS.md](./.github/BRANCH_WORKFLOWS.md) - CI/CD workflows
- 🔧 [.env.example](./.env.example) - Environment variables template
- 📘 [README.md](./README.md) - Main project README
- 🤝 [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines

### External Resources

- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Git Branch Strategy](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)
- [GitHub Flow](https://guides.github.com/introduction/flow/)

## 💬 Get Help

### Something not working?

1. **Check documentation** - Most answers are in BRANCH_ARCHITECTURE.md
2. **Search issues** - Someone may have had the same problem
3. **Ask the team** - Create a GitHub Discussion
4. **Report bugs** - Open an issue with details

### Contacts

- **General Questions**: GitHub Discussions
- **Bug Reports**: GitHub Issues
- **Security Issues**: security@hvpe.app (see SECURITY.md)
- **Branch Owner**: See BRANCH_ARCHITECTURE.md

## 🎉 Tips for Success

### DO ✅

- Commit often with clear messages
- Write tests for new features
- Keep branch synced with main
- Document your changes
- Ask for help when stuck
- Review your own PR before requesting review

### DON'T ❌

- Commit secrets or API keys
- Force push to shared branches
- Make breaking changes without discussion
- Ignore failing tests
- Let branch diverge too far from main
- Merge without review (for product branches)

## 🚀 Ready to Code?

```bash
# Pick your branch
git checkout [your-branch]

# Start coding
npm run dev

# Open your editor
code .

# Have fun! 🎉
```

---

**Questions?** Open a [GitHub Discussion](https://github.com/bickfordd-bit/hvpe-cloud-portal/discussions) or check [BRANCH_ARCHITECTURE.md](./BRANCH_ARCHITECTURE.md).

**Need access to a branch?** Contact the branch owner (see BRANCH_ARCHITECTURE.md).

**Found a bug?** [Open an issue](https://github.com/bickfordd-bit/hvpe-cloud-portal/issues/new).
