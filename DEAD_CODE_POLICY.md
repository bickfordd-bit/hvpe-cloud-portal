# Dead Code Detection Policy

## Overview

This repository uses `ts-prune` to detect potentially unused exports. However, not all flagged exports are "dead code" - many are intentional parts of the public API or required by frameworks.

## Auto-Heal Workflow Filtering

The `.github/workflows/auto-heal.yml` workflow automatically filters out the following from dead code reports:

### Framework Requirements (False Positives)

These exports are **required** by Next.js and other frameworks:

- **Page components**: `page.tsx` files must export `default`
- **Layout components**: `layout.tsx` files must export `default` and `metadata`
- **API routes**: `route.ts` files must export HTTP method handlers (`GET`, `POST`, etc.) and config (`dynamic`, `runtime`)
- **Middleware**: `middleware.ts` must export `middleware` function and `config` object
- **Config files**: `next.config.ts`, `jest.config.ts` must export `default`

### Public API Exports (Intentional)

These exports are part of the public API and **should be kept** even if not currently used internally:

- **Type definitions**: All TypeScript types/interfaces (marked `(used in module)`)
- **Component exports**: All exports from `src/components/`
- **API response utilities**: `src/lib/apiResponse.ts` provides standardized API responses
- **Core types**: `src/lib/types.ts` defines shared types across the application

## Genuine Unused Exports

After filtering, the remaining exports fall into these categories:

### 1. Future API Features
Functions that are part of planned features but not yet integrated:
- `getPolicyById`, `listPolicies`, `getPoliciesForIntentType` - Policy engine API
- `getSession` - Session management (prepared for future use)
- `formatIntent` - Intent formatting utility

### 2. Utility Functions
Helper functions that may be used in development or testing:
- `verifyCanonHash`, `getCanonMeta`, `canonExists` - Canon verification utilities
- `validateEnv` - Environment validation (used at runtime, not import-time)
- `embedTexts` - Text embedding utility

### 3. Rate Limiters
Rate limiting instances exported for testing and monitoring:
- `loginRateLimiter`, `apiRateLimiter`

## Guidelines for Developers

### When to Keep an Export

Keep an export if it:
1. **Is part of the public API** - May be used by consumers of the library/package
2. **Is a utility function** - Useful for future features or debugging
3. **Is required by a framework** - Next.js, Jest, etc.
4. **Is a type definition** - Types should be exported for external use
5. **Is used in testing** - Even if not in production code

### When to Remove an Export

Remove an export if:
1. **It's truly obsolete** - Replaced by a better implementation
2. **It was experimental** - And the experiment is abandoned
3. **It has no clear purpose** - And no one can explain why it exists
4. **It's a duplicate** - Same functionality exists elsewhere

### How to Handle Dead Code Reports

1. **Review the filtered report** - Auto-heal workflow filters out false positives
2. **Check git history** - Understand why the export was added
3. **Ask the team** - Confirm if it's needed before removing
4. **Mark as ignored** - Add `// ts-prune-ignore-next` comment if intentionally unused
5. **Document the decision** - Update this file if keeping an unusual export

## Suppressing False Positives

To suppress a specific export from dead code detection, add a comment:

```typescript
// ts-prune-ignore-next
export function myIntentionallyUnusedExport() {
  // This is part of the public API but not used internally
}
```

## Maintenance

This policy should be reviewed quarterly to ensure:
- Filtering rules are still accurate
- Genuinely unused exports are removed
- Documentation stays up-to-date

Last reviewed: 2026-01-03
