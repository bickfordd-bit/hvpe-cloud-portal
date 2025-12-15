# HVPE Cloud Portal - Branch Architecture Diagram

## Repository Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                    HVPE Cloud Portal Repository                  │
│                  github.com/bickfordd-bit/hvpe-cloud-portal     │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 │
                    ┌────────────┴────────────┐
                    │     main (production)    │
                    │   Core Portal Features   │
                    │  • OPTR                  │
                    │  • Bickford Chat         │
                    │  • License Management    │
                    │  • User Dashboard        │
                    └────────────┬────────────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
     ┌──────────▼──────────┐    │    ┌──────────▼──────────┐
     │  Product Branches    │    │    │  Personal Branches   │
     └──────────┬──────────┘    │    └──────────┬──────────┘
                │                │                │
                │                │                │
    ┌───────────┼────────────┐  │    ┌───────────┼──────────┐
    │           │            │  │    │           │          │
    ▼           ▼            ▼  ▼    ▼           ▼          ▼
┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐
│bickford│  │bickford│  │ hvpe   │  │ dad    │  │ derek  │  │ xavier │
│        │  │-mobile │  │ trader │  │        │  │  &     │  │        │
│        │  │        │  │        │  │        │  │ jenna  │  │        │
└────────┘  └────────┘  └────────┘  └────────┘  └────────┘  └────────┘
┌────────┐  ┌────────┐
│bickford│  │penelope│
│  for   │  │        │
│defense │  │        │
└────────┘  └────────┘
```

## Branch Relationships

### Upstream/Downstream Flow

```
┌────────────────────────────────────────────────────────────────┐
│                          MAIN BRANCH                            │
│                     (Production Source)                         │
└───┬────────────────────────────────────────────────────────┬───┘
    │                                                         │
    │ Weekly Sync ⟳                                  Weekly Sync ⟳
    │                                                         │
┌───▼──────────────────┐                       ┌─────────────▼─────┐
│  Product Branches     │                       │ Personal Branches  │
│  (Active Development) │                       │  (Experimentation) │
└───┬──────────────────┘                       └────────────────────┘
    │
    │ Feature PRs →
    │
┌───▼──────────────────────────────────────────────────────────────┐
│                      MAIN BRANCH                                  │
│                   (Production Ready)                              │
└───────────────────────────────────────────────────────────────────┘
```

### Development Workflow

```
                    Developer Workflow
                    ═════════════════

┌──────────────────────────────────────────────────────────┐
│ 1. Choose your branch                                     │
│    git checkout bickford                                  │
└──────────────────┬───────────────────────────────────────┘
                   │
┌──────────────────▼───────────────────────────────────────┐
│ 2. Create feature branch                                  │
│    git checkout -b bickford/new-feature                  │
└──────────────────┬───────────────────────────────────────┘
                   │
┌──────────────────▼───────────────────────────────────────┐
│ 3. Develop feature                                        │
│    • Code                                                 │
│    • Test                                                 │
│    • Commit                                               │
└──────────────────┬───────────────────────────────────────┘
                   │
┌──────────────────▼───────────────────────────────────────┐
│ 4. Create Pull Request                                    │
│    gh pr create --base bickford                          │
└──────────────────┬───────────────────────────────────────┘
                   │
┌──────────────────▼───────────────────────────────────────┐
│ 5. Code Review & CI/CD                                    │
│    • Automated tests run                                  │
│    • Team reviews code                                    │
│    • Preview deployment created                           │
└──────────────────┬───────────────────────────────────────┘
                   │
┌──────────────────▼───────────────────────────────────────┐
│ 6. Merge to Product Branch                                │
│    Merged into: bickford                                  │
└──────────────────┬───────────────────────────────────────┘
                   │
┌──────────────────▼───────────────────────────────────────┐
│ 7. Test in Branch Environment                             │
│    Deploy to: bickford.hvpe.app                          │
└──────────────────┬───────────────────────────────────────┘
                   │
┌──────────────────▼───────────────────────────────────────┐
│ 8. Promote to Main (when stable)                          │
│    PR: bickford → main                                    │
└──────────────────┬───────────────────────────────────────┘
                   │
┌──────────────────▼───────────────────────────────────────┐
│ 9. Production Deployment                                  │
│    Deploy to: hvpe-cloud-portal.vercel.app               │
└──────────────────────────────────────────────────────────┘
```

## Branch-Specific Features

### Product Branches

```
┌──────────────────────────────────────────────────────────────────┐
│                         bickford                                  │
│  ┌────────────────────────────────────────────────────┐         │
│  │ • Enhanced AI conversation flows                    │         │
│  │ • Advanced context management                       │         │
│  │ • Personality customization                         │         │
│  │ • Multi-modal interactions                          │         │
│  └────────────────────────────────────────────────────┘         │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                       bickford-mobile                             │
│  ┌────────────────────────────────────────────────────┐         │
│  │ • React Native / Expo                              │         │
│  │ • Offline mode                                      │         │
│  │ • Push notifications                                │         │
│  │ • Touch-optimized UI                                │         │
│  └────────────────────────────────────────────────────┘         │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                        hvpetrader                                 │
│  ┌────────────────────────────────────────────────────┐         │
│  │ • Alpaca trading integration                        │         │
│  │ • Real-time market data                             │         │
│  │ • Portfolio tracking                                │         │
│  │ • OPTR signal execution                             │         │
│  │ • Risk management                                   │         │
│  └────────────────────────────────────────────────────┘         │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                   bickford-for-defense                            │
│  ┌────────────────────────────────────────────────────┐         │
│  │ • CMMC compliance                                   │         │
│  │ • SAM.gov integration                               │         │
│  │ • CAC/PIV authentication                            │         │
│  │ • Classification handling                           │         │
│  │ • Audit logging                                     │         │
│  └────────────────────────────────────────────────────┘         │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                         penelope                                  │
│  ┌────────────────────────────────────────────────────┐         │
│  │ • AI content generation                             │         │
│  │ • Template management                               │         │
│  │ • Multi-format export (PDF, DOCX, HTML)            │         │
│  │ • Brand voice consistency                           │         │
│  │ • Content optimization                              │         │
│  └────────────────────────────────────────────────────┘         │
└──────────────────────────────────────────────────────────────────┘
```

## Deployment Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                      GitHub Repository                          │
│                 bickfordd-bit/hvpe-cloud-portal                │
└────────┬───────────────────────────────────────────┬───────────┘
         │                                           │
         │ Push to branch                            │ Push to main
         │                                           │
┌────────▼────────────────────┐     ┌────────────────▼──────────┐
│   Branch CI/CD              │     │   Production CI/CD         │
│   • Build                   │     │   • Build                  │
│   • Test                    │     │   • Test                   │
│   • Security Scan           │     │   • Security Scan          │
│   • Deploy Preview          │     │   • Deploy Production      │
└────────┬────────────────────┘     └────────────────┬──────────┘
         │                                            │
┌────────▼────────────────────┐     ┌────────────────▼──────────┐
│   Branch Environments        │     │   Production Environment   │
│   • bickford.hvpe.app       │     │   hvpe-cloud-portal       │
│   • trader.hvpe.app         │     │   .vercel.app             │
│   • mobile.hvpe.app         │     │                            │
│   • defense.hvpe.app        │     │   ✅ Fully tested          │
│   • penelope.hvpe.app       │     │   ✅ Approved              │
│                              │     │   ✅ Monitored             │
│   🔧 Testing & Development   │     │                            │
└─────────────────────────────┘     └───────────────────────────┘
```

## Collaboration Model

```
┌─────────────────────────────────────────────────────────────┐
│                      Team Structure                          │
└─────────────────────────────────────────────────────────────┘

┌───────────────┐
│   Core Team   │
│   (main)      │
└───────┬───────┘
        │
        ├─────────────────┬─────────────────┬──────────────┐
        │                 │                 │              │
┌───────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐  ┌────▼─────┐
│  AI Team     │  │ Trading Team │  │ Mobile Team │  │ Defense  │
│  (bickford)  │  │ (hvpetrader) │  │ (bickford-  │  │ Team     │
│              │  │              │  │  mobile)    │  │ (defense)│
└──────────────┘  └──────────────┘  └──────────────┘  └──────────┘

┌───────────────┐  ┌─────────────────────────────────────────────┐
│ Content Team  │  │        Personal Contributors                │
│ (penelope)    │  │  dad, derek-and-jenna, xavier, naomi       │
└───────────────┘  └─────────────────────────────────────────────┘
```

## Merge Strategy

```
Feature Branch ──→ Product Branch ──→ Main Branch ──→ Production
                                                            │
                                                            │
                         ┌──────────────────────────────────┘
                         │
                         ↓
              Other Product Branches (sync)
              • bickford
              • hvpetrader
              • bickford-mobile
              • bickford-for-defense
              • penelope
```

## Key Principles

1. **Single Source of Truth**: One repository for all HVPE code
2. **Branch Isolation**: Features develop independently in branches
3. **Regular Sync**: Product branches stay current with main
4. **Quality Gates**: CI/CD ensures code quality before merge
5. **Clear Ownership**: Each branch has defined maintainers
6. **Flexible Architecture**: Easy to add new branches as needed

## Getting Started

See [BRANCH_QUICK_START.md](../BRANCH_QUICK_START.md) for step-by-step instructions.

---

**Last Updated**: December 2025  
**See Also**: [BRANCH_ARCHITECTURE.md](../BRANCH_ARCHITECTURE.md), [BRANCH_STRATEGY.md](../.github/BRANCH_STRATEGY.md)
