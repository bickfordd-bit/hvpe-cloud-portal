# Dead Code Analysis

## Overview
This document explains the "dead code" warnings from ts-prune and which exports are intentionally kept.

## Understanding ts-prune Warnings

ts-prune analyzes TypeScript exports and flags those without explicit `import` statements. However, it doesn't understand:

1. **Next.js Framework Conventions** - implicit usage by the framework
2. **Dynamic Imports** - runtime module loading
3. **Public API Exports** - intentional library interfaces
4. **Future Features** - code prepared for upcoming functionality

## Categories of Flagged Exports

### 1. Next.js Framework Requirements (FALSE POSITIVES)

These are **required** by Next.js and are NOT dead code:

#### Page Components
- **Pattern**: `src/app/**/page.tsx` - default exports
- **Why**: Next.js App Router automatically imports default exports from `page.tsx` files
- **Action**: KEEP ALL

#### API Routes  
- **Pattern**: `src/app/api/**/route.ts` - GET, POST, PUT, DELETE, PATCH exports
- **Why**: Next.js automatically maps named HTTP method exports to API endpoints
- **Action**: KEEP ALL

#### Middleware
- **File**: `middleware.ts`
- **Exports**: `middleware`, `config`
- **Why**: Next.js automatically loads and executes middleware
- **Action**: KEEP

#### Configuration Files
- **Files**: `next.config.ts`, `jest.config.ts`, `tailwind.config.js`
- **Why**: Framework/tool configuration files require specific export formats
- **Action**: KEEP

#### Route Segment Config
- **Exports**: `dynamic`, `runtime`, `revalidate`, etc.
- **Why**: Next.js route segment configuration options
- **Action**: KEEP

### 2. Type Definitions (INTENTIONAL)

Exports marked "(used in module)" are type definitions used within their own files or across the codebase:

- `APIResponse`, `APIError`, `ApiResponse` - Standard response interfaces
- `CanonRule`, `PolicyConstraint`, `ExecutionStatus` - Domain types
- `BickfordConfig`, `Result`, `Awaitable` - Configuration and utility types

**Action**: KEEP - These are part of the type system

### 3. Public API Exports (INTENTIONAL)

Library functions and constants exported for potential use:

#### apiResponse.ts
- `createSuccessResponse` - Not currently used, but part of planned API standardization
- `createErrorResponse` - Same as above
- `ErrorCodes` - Error code constants for future use

**Action**: KEEP for now - Part of planned API refactoring

#### Rate Limiters
- `loginRateLimiter`, `apiRateLimiter` - Prepared for future auth implementation

**Action**: KEEP - Part of security infrastructure

### 4. Feature-Specific Unused Code (CANDIDATES)

These may be genuinely unused and could be removed if confirmed:

#### Canon/Canon Functions
- `verifyCanonHash`, `getCanonMeta`, `canonExists` - May be unused
- **Verification needed**: Search for usage in native modules or tests

#### OPTR Functions
- `getPolicyById`, `listPolicies`, `getPoliciesForIntentType`
- **Verification needed**: May be used in future OPTR enhancements

#### Ledger Functions
- `appendLedgerEvent`, `getLedgerEvents`, `verifyLedgerChain`
- **Note**: May be called from CLI tools or native modules

#### Component Exports
- `BidSubmissionTracker`, `DashboardPage` components
- **Verification needed**: May be used in native app or future features

## Recommendation

### Immediate Actions
1. ✅ Document this analysis
2. ✅ Update auto-heal workflow to filter false positives
3. ⏳ Create tracking issue for genuine unused code review

### Future Actions
1. Conduct thorough search including:
   - Native modules (packages/)
   - CLI scripts
   - Test files
   - Dynamic imports
2. Remove confirmed dead code in targeted PRs
3. Consider adding `@public` JSDoc tags to intentional exports

## Auto-Heal Workflow Updates

The auto-heal workflow now:
1. Filters out Next.js framework patterns
2. Filters out "(used in module)" type definitions
3. Only reports genuinely suspicious exports

This reduces noise and focuses attention on actual dead code candidates.

## How to Handle Dead Code Reports

When you see a dead code report:

1. **Don't panic** - Most are false positives
2. **Check the category** - Use this document to understand context
3. **Verify usage** - Search codebase including native modules
4. **Remove conservatively** - Only delete confirmed unused exports
5. **Test thoroughly** - Ensure build and tests pass

## References

- ts-prune documentation: https://github.com/nadeesha/ts-prune
- Next.js App Router conventions: https://nextjs.org/docs/app
- Bickford Constitution: See `.github/copilot-instructions.md`
