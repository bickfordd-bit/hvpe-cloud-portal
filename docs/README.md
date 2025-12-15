# HVPE Cloud Portal Documentation

This directory contains architectural documentation, guides, and reference materials for the HVPE Cloud Portal project.

## 📁 Documentation Index

### Branch Architecture
- **[BRANCH_DIAGRAM.md](./BRANCH_DIAGRAM.md)** - Visual diagrams and architecture illustrations

### Agent Architecture
- **[AGENT_ARCHITECTURE.md](./AGENT_ARCHITECTURE.md)** - Complete guide to building AI agents

### Root Documentation
Navigate to the root directory for main documentation:

- **[BRANCH_ARCHITECTURE.md](../BRANCH_ARCHITECTURE.md)** - Complete branch architecture guide
- **[BRANCH_QUICK_START.md](../BRANCH_QUICK_START.md)** - Quick start for developers
- **[BRANCH_IMPLEMENTATION_SUMMARY.md](../BRANCH_IMPLEMENTATION_SUMMARY.md)** - Implementation details
- **[MIGRATION_GUIDE.md](../MIGRATION_GUIDE.md)** - Migrate from separate repositories
- **[README.md](../README.md)** - Main project README

### GitHub-Specific
Navigate to `.github/` for workflow documentation:

- **[.github/BRANCH_STRATEGY.md](../.github/BRANCH_STRATEGY.md)** - GitHub workflows and PR process
- **[.github/BRANCH_WORKFLOWS.md](../.github/BRANCH_WORKFLOWS.md)** - CI/CD automation

### OPTR Documentation
- **[DOD_DIGITAL_THREAD_GOVERNANCE.md](./DOD_DIGITAL_THREAD_GOVERNANCE.md)** - DoD digital thread governance
- **[DOD_OPEN_GOV_CONNECTION.md](./DOD_OPEN_GOV_CONNECTION.md)** - Open government connections
- **[DOD_OPTR_PUBLIC_RECORD.md](./DOD_OPTR_PUBLIC_RECORD.md)** - OPTR public record documentation
- **[DOD_POLICY_REFERENCES.md](./DOD_POLICY_REFERENCES.md)** - DoD policy references
- **[OPTR_MATHEMATICAL_FRAMEWORK.md](./OPTR_MATHEMATICAL_FRAMEWORK.md)** - Mathematical framework
- **[OPTR_T2V_FRAMEWORK.md](./OPTR_T2V_FRAMEWORK.md)** - Time-to-value framework

## 🗂️ Documentation Structure

```
docs/
├── README.md (this file)
├── AGENT_ARCHITECTURE.md (agent building guide)
├── BRANCH_DIAGRAM.md (branch architecture visuals)
├── DOD_*.md (Defense/OPTR documentation)
└── OPTR_*.md (OPTR framework docs)

Root/
├── BRANCH_ARCHITECTURE.md (branch guide)
├── BRANCH_QUICK_START.md (getting started)
├── BRANCH_IMPLEMENTATION_SUMMARY.md (implementation details)
├── MIGRATION_GUIDE.md (repository migration)
├── README.md (main readme)
├── CONTRIBUTING.md (contribution guidelines)
└── .env.example (environment variables)

.github/
├── BRANCH_STRATEGY.md (GitHub strategy)
├── BRANCH_WORKFLOWS.md (CI/CD)
└── copilot-instructions.md (AI agent instructions)
```

## 🎯 Quick Links

### For New Developers
1. Start with [BRANCH_QUICK_START.md](../BRANCH_QUICK_START.md)
2. Read [BRANCH_ARCHITECTURE.md](../BRANCH_ARCHITECTURE.md) for full context
3. Check [.env.example](../.env.example) for configuration

### For Team Leads
1. Review [BRANCH_ARCHITECTURE.md](../BRANCH_ARCHITECTURE.md) for branch ownership
2. Read [.github/BRANCH_STRATEGY.md](../.github/BRANCH_STRATEGY.md) for GitHub workflows
3. See [.github/BRANCH_WORKFLOWS.md](../.github/BRANCH_WORKFLOWS.md) for CI/CD

### For Migration
1. Follow [MIGRATION_GUIDE.md](../MIGRATION_GUIDE.md) step-by-step
2. Use [scripts/create-branches.sh](../scripts/create-branches.sh) for setup
3. Reference [BRANCH_IMPLEMENTATION_SUMMARY.md](../BRANCH_IMPLEMENTATION_SUMMARY.md) for details

### For Building Agents
1. Start with [AGENT_ARCHITECTURE.md](./AGENT_ARCHITECTURE.md) for complete guide
2. Review existing agents in `src/lib/optr/processor.ts` (OPTR)
3. Check `src/lib/ai/openaiClient.ts` for AI integration patterns

### For OPTR Work
1. See [OPTR_MATHEMATICAL_FRAMEWORK.md](./OPTR_MATHEMATICAL_FRAMEWORK.md) for core concepts
2. Read [DOD_OPTR_PUBLIC_RECORD.md](./DOD_OPTR_PUBLIC_RECORD.md) for DoD context
3. Check [OPTR_T2V_FRAMEWORK.md](./OPTR_T2V_FRAMEWORK.md) for time-to-value

## 📚 External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Prisma Docs](https://www.prisma.io/docs/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Vercel Docs](https://vercel.com/docs)

## 🤝 Contributing to Documentation

When updating documentation:

1. Keep documentation in sync across related files
2. Update this README index when adding new docs
3. Use clear, concise language
4. Include code examples where helpful
5. Add diagrams for complex concepts
6. Cross-reference related documentation

## 📝 Documentation Style Guide

### Headings
- Use `#` for main title
- Use `##` for major sections
- Use `###` for subsections
- Use `####` for detailed items

### Code Blocks
- Always specify language: ```bash, ```typescript, etc.
- Include comments for complex code
- Show expected output when relevant

### Links
- Use relative paths for internal links
- Use descriptive link text (not "click here")
- Verify links work before committing

### Formatting
- Use **bold** for emphasis
- Use `code` for commands, variables, filenames
- Use > for important callouts
- Use ✅ ❌ ⚠️ for visual indicators

## 🔍 Finding Information

### Search Tips
```bash
# Search all markdown files
grep -r "search term" *.md

# Find files by name
find . -name "*BRANCH*.md"

# Search in specific directory
grep -r "pattern" docs/
```

### Common Topics

| Topic | Files |
|-------|-------|
| Branch setup | BRANCH_ARCHITECTURE.md, create-branches.sh |
| Getting started | BRANCH_QUICK_START.md, README.md |
| GitHub workflows | .github/BRANCH_*.md |
| Environment vars | .env.example |
| Migration | MIGRATION_GUIDE.md |
| Agent building | docs/AGENT_ARCHITECTURE.md |
| OPTR | docs/OPTR_*.md, docs/DOD_*.md |
| Architecture | BRANCH_DIAGRAM.md, BRANCH_ARCHITECTURE.md |

## ❓ Need Help?

- 💬 [GitHub Discussions](https://github.com/bickfordd-bit/hvpe-cloud-portal/discussions)
- 🐛 [Report Issues](https://github.com/bickfordd-bit/hvpe-cloud-portal/issues)
- 📧 Email: support@hvpe.app (if applicable)
- 🔒 Security: See [SECURITY.md](../SECURITY.md)

---

**Last Updated**: December 2025  
**Maintained By**: HVPE Core Team
