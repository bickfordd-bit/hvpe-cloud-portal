# HVPE Cloud Portal - Branch Architecture

## Overview

HVPE Cloud Portal serves as the central repository for all HVPE-related projects and applications. Rather than maintaining separate repositories, we use a **branch-based architecture** where each major feature set, product variant, or team workspace exists as a dedicated branch.

## Philosophy

- **Single Source of Truth**: All HVPE code lives in one repository
- **Shared Foundation**: Common infrastructure, utilities, and core features are shared across branches
- **Isolated Development**: Each branch can evolve independently while maintaining the ability to merge updates from main
- **Clear Ownership**: Each branch has a defined purpose and maintainer

## Branch Structure

### Main Branch: `main`

The production-ready, stable version of the HVPE Cloud Portal with core features:
- OPTR (Opportunity Analysis Pipeline)
- Bickford AI Chat
- Trading Ideas & Analysis
- License Management
- User Dashboard

### Feature & Product Branches

#### `bickford-mobile`
**Purpose**: Mobile application version of Bickford AI  
**Focus**: React Native or mobile-optimized web experience  
**Key Features**:
- Mobile-first UI/UX
- Offline capabilities
- Push notifications
- Touch-optimized interactions

#### `bickford`
**Purpose**: Core Bickford AI features and enhancements  
**Focus**: Advanced conversational AI, context management, personalization  
**Key Features**:
- Enhanced AI conversation flows
- Advanced context retention
- Bickford-specific integrations
- Specialized prompt engineering

#### `hvpetrader`
**Purpose**: Full-featured trading platform  
**Focus**: Advanced trading tools, real-time data, portfolio management  
**Key Features**:
- Real-time market data integration
- Advanced charting and technical analysis
- Portfolio tracking and optimization
- Trading signal generation via OPTR
- Risk management tools

#### `bickford-for-defense`
**Purpose**: Defense and government sector specialization  
**Focus**: DoD compliance, secure communication, defense-specific workflows  
**Key Features**:
- CMMC compliance features
- Secure communication channels
- Defense contract analysis (OPTR for DoD RFPs)
- Classification handling
- Integration with DoD systems

#### `penelope`
**Purpose**: AI-powered content generation platform  
**Focus**: Automated content creation, templates, multi-format output  
**Key Features**:
- Content generation engine
- Template management
- Multi-format export (email, PDF, web)
- Brand voice consistency
- Content optimization

### Personal & Team Branches

#### `dad`
**Purpose**: Personal workspace for family financial planning features  
**Focus**: Financial life setup, wealth tracking, family goals  
**Key Features**:
- Personal financial dashboard
- Wealth accumulation tracking
- Goal setting and progress
- Family-specific features

#### `derek-and-jenna`
**Purpose**: Shared workspace for Derek & Jenna's projects  
**Focus**: Collaborative features and experiments  
**Key Features**:
- Shared project management
- Collaborative AI tools
- Custom dashboards
- Integration experiments

#### `xavier`
**Purpose**: Xavier's personal development workspace  
**Focus**: Experimental features and personal projects  

#### `naomi`
**Purpose**: Naomi's personal development workspace  
**Focus**: Experimental features and personal projects  

## Branch Workflow

### Creating a New Branch

```bash
# Start from main
git checkout main
git pull origin main

# Create your branch
git checkout -b branch-name

# Push to remote
git push -u origin branch-name
```

### Staying Up to Date with Main

```bash
# From your branch
git checkout branch-name
git fetch origin
git merge origin/main

# Resolve any conflicts
# Test thoroughly
git push origin branch-name
```

### Merging Changes Back to Main

When features from a branch are ready for the main product:

1. Create a Pull Request from your branch to `main`
2. Request code review
3. Ensure all CI/CD checks pass
4. Merge when approved

## Branch Guidelines

### DO

✅ Keep your branch focused on its defined purpose  
✅ Regularly merge updates from `main` to stay current  
✅ Document branch-specific features in your branch's README  
✅ Use feature flags for experimental features  
✅ Write tests for branch-specific functionality  
✅ Keep dependencies up to date  

### DON'T

❌ Make breaking changes to shared core utilities without coordination  
❌ Let your branch diverge too far from main (merge regularly)  
❌ Store secrets or credentials in code  
❌ Modify `.github/` workflows without discussing with the team  
❌ Delete shared components that other branches might use  

## Environment Configuration

Each branch may require different environment variables. See `.env.example` for the base configuration.

### Branch-Specific Variables

- **bickford-mobile**: `MOBILE_API_URL`, `PUSH_NOTIFICATION_KEY`
- **hvpetrader**: `ALPACA_API_KEY`, `MARKET_DATA_URL`, `OPTR_WORKER_URL`
- **bickford-for-defense**: `DOD_API_KEY`, `CMMC_COMPLIANCE_MODE`, `CLASSIFICATION_LEVEL`
- **penelope**: `CONTENT_STORAGE_URL`, `TEMPLATE_ENGINE_URL`

## Deployment

### Branch-Specific Deployments

Each branch can be deployed independently:

- **Main**: Production at `hvpe-cloud-portal.vercel.app`
- **bickford-mobile**: Mobile app stores + `mobile.hvpe.app`
- **hvpetrader**: `trader.hvpe.app`
- **bickford-for-defense**: `defense.hvpe.app` (restricted access)
- **penelope**: `penelope.hvpe.app`

Use Vercel's branch deployments or custom deployment scripts for preview environments.

## Collaboration & Communication

### Branch Ownership

| Branch | Primary Owner | Purpose |
|--------|---------------|---------|
| main | Core Team | Production portal |
| bickford-mobile | Mobile Team | Mobile app |
| bickford | AI Team | Core AI features |
| hvpetrader | Trading Team | Trading platform |
| bickford-for-defense | Defense Team | DoD version |
| penelope | Content Team | Content generation |
| dad | Personal | Family features |
| derek-and-jenna | Personal | Shared projects |
| xavier | Personal | Personal projects |
| naomi | Personal | Personal projects |

### Communication Channels

- **General Discussion**: GitHub Discussions
- **Bug Reports**: GitHub Issues (label with branch name)
- **Feature Requests**: GitHub Issues with `enhancement` label
- **Urgent Issues**: Direct message branch owner

## CI/CD

### Automated Checks

All branches should pass:
- ✅ TypeScript compilation
- ✅ Linting (ESLint)
- ✅ Tests (Jest)
- ✅ Build verification

### Branch-Specific Tests

Configure branch-specific test suites in `jest.config.ts` using test patterns:
- `**/*.test.ts` - All branches
- `**/mobile.test.ts` - Mobile branch only
- `**/defense.test.ts` - Defense branch only

## Migration Guide

### Moving from Separate Repo to Branch

If you have an existing separate repository:

1. **Create the branch** in hvpe-cloud-portal
2. **Copy your code** into appropriate directories
3. **Update imports** to use `@/` path alias
4. **Merge common code** with existing utilities
5. **Configure environment** variables
6. **Test thoroughly**
7. **Archive old repo** (don't delete immediately)

### Example Migration

```bash
# Clone your old repo
git clone https://github.com/user/old-repo.git /tmp/old-repo

# In hvpe-cloud-portal
git checkout -b new-branch

# Copy relevant files (adjust paths as needed)
cp -r /tmp/old-repo/src/* ./src/
cp -r /tmp/old-repo/components/* ./src/components/

# Commit
git add .
git commit -m "Migration from old-repo"
git push -u origin new-branch
```

## Future Branches

As new products or major features are developed, additional branches may be created following this same structure. Consult with the core team before creating new long-lived branches.

## Questions?

- 📖 See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines
- 🐛 Report issues at https://github.com/bickfordd-bit/hvpe-cloud-portal/issues
- 💬 Discuss at https://github.com/bickfordd-bit/hvpe-cloud-portal/discussions

---

**Last Updated**: December 2025  
**Maintained By**: HVPE Core Team
