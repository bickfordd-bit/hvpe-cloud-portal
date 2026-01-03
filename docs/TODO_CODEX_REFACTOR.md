# Codex Sync Refactor TODO

## Status
Temporarily disabled to unblock builds (2026-01-03)

**Build errors fixed:**
- ✅ Module not found: Can't resolve '$lib/supabase'
- ✅ Export verifyCodexSecret doesn't exist in target module
- ✅ Export syncCodexChanges doesn't exist in target module
- ✅ Export previewCodexChanges doesn't exist in target module

## What Needs Fixing

### 1. Import Paths
**Problem:** SvelteKit-style `$lib/*` imports don't work in Next.js

**Current (broken):**
```typescript
import { supabase } from '$lib/supabase';
import type { Database } from '$lib/database.types';
import { writeLedgerEntry } from '$lib/ledger';
```

**Required (Next.js):**
```typescript
import { supabase } from '@/lib/supabase'; // or create new Supabase client
import type { Database } from '@/lib/database.types'; // or define types
import { writeLedgerEntry } from '@/lib/bickford/ledger';
```

### 2. Missing Exports
**Problem:** API route imports functions that don't exist in sync.ts

**Required implementations:**

```typescript
/**
 * Verify the Codex webhook secret
 * Should check against CODEX_WEBHOOK_SECRET env var
 */
export function verifyCodexSecret(secret: string): boolean {
  return secret === process.env.CODEX_WEBHOOK_SECRET;
}

/**
 * Apply Codex changes to the repository
 * Should create git commits, update files, etc.
 */
export async function syncCodexChanges(task: CodexTask): Promise<SyncResult> {
  // 1. Validate task structure
  // 2. Apply each change (file edits, creates, deletes)
  // 3. Commit to git
  // 4. Write to ledger
  // 5. Return result with success/error
}

/**
 * Preview what would change without applying
 * Useful for approval workflows
 */
export async function previewCodexChanges(task: CodexTask): Promise<PreviewResult> {
  // 1. Parse task changes
  // 2. Generate diff preview
  // 3. Estimate impact
  // 4. Return preview data
}
```

### 3. Supabase Integration
**Problem:** Code references Supabase tables that may not exist

**Options:**
- A) Use existing Prisma models instead of Supabase
- B) Set up Supabase client for Next.js and create codex_tasks table
- C) Use file-based storage (similar to Bickford ledger)

**Recommended:** Option C - Use Bickford ledger for Codex task tracking
- Already proven reliable
- No database dependency
- Version controlled
- Integrates with existing persistence layer

### 4. Type Definitions
**Problem:** CodexTask type references Supabase Database types

**Required:**
```typescript
export type CodexTask = {
  id: string;
  taskId: string;
  description: string;
  changes: CodexChange[];
  metadata?: {
    createdAt: string;
    priority?: 'low' | 'medium' | 'high';
    autoApply?: boolean;
  };
};

export type CodexChange = {
  type: 'create' | 'edit' | 'delete';
  path: string;
  content?: string;
  oldContent?: string;
};

export type SyncResult = {
  success: boolean;
  taskId: string;
  changes: number;
  commitSha?: string;
  ledgerId?: string;
  error?: string;
};
```

## Implementation Plan

### Phase 1: Basic Refactor (Unblocks builds) ✅
- [x] Comment out broken code
- [x] Add stub exports
- [x] Update API route to return 503
- [x] Create this TODO doc

### Phase 2: Core Functionality (Next PR)
- [ ] Set up Next.js-compatible Supabase client OR
- [ ] Migrate to Bickford ledger-based storage
- [ ] Implement verifyCodexSecret()
- [ ] Implement basic syncCodexChanges()
- [ ] Add comprehensive types

### Phase 3: Advanced Features (Future)
- [ ] Implement previewCodexChanges()
- [ ] Add approval workflow
- [ ] Set up webhook integration tests
- [ ] Add rollback capability
- [ ] Integrate with existing Bickford ledger system

### Phase 4: Production Hardening
- [ ] Add rate limiting
- [ ] Implement task queuing
- [ ] Add monitoring/alerting
- [ ] Document webhook setup process
- [ ] Create security audit checklist

## References

### Files
- **Temporarily disabled:** `src/lib/codex/sync.ts`
- **API route:** `src/app/api/codex/sync/route.ts`
- **Original code:** Preserved in comments within sync.ts

### Related Systems
- **Bickford Ledger:** `.bick/ledger/` - Proven persistence system
- **Infinite Persistence:** `src/lib/persistence/infinite.ts` - Multi-layer storage
- **API Response:** `src/lib/apiResponse.ts` - Standard response format
- **Logger:** `src/lib/logger.ts` - Winston structured logging

### Documentation
- **Codex Integration:** `CODEX_INTEGRATION_CHECKLIST.md`
- **Codex Sync Guide:** `CODEX_SYNC.md`
- **Codex Webhook Setup:** `CODEX_WEBHOOK_SETUP.md`

## Success Criteria

Before re-enabling:
- [ ] All imports work in Next.js environment
- [ ] No SvelteKit-style imports remain
- [ ] All expected exports implemented
- [ ] Tests pass for sync functionality
- [ ] API returns proper responses (not 503)
- [ ] Can receive and process Codex webhooks
- [ ] Changes are logged to ledger
- [ ] Security: webhook secret verification works

## Priority
**Medium** - Not blocking core functionality, but needed for full Codex automation

The system can function without Codex sync:
- ✅ OPTR pipeline works
- ✅ Bickford chat/validation works  
- ✅ Trading/growth modes work
- ✅ License management works
- ❌ Automated code changes from Codex (manual for now)

## Timeline Estimate
- Phase 2: ~2-3 hours (core functionality)
- Phase 3: ~2-4 hours (advanced features)
- Phase 4: ~1-2 hours (hardening)
- **Total:** ~5-9 hours for complete refactor

## Questions to Resolve
1. Should we use Supabase or migrate to Prisma/ledger?
2. Do we want approval workflow or auto-apply?
3. What level of preview detail is needed?
4. Should changes be atomic or batched?
5. How do we handle merge conflicts?
