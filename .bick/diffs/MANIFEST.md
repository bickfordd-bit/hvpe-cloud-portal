# Bickford Codex - All Diffs Manifest

**Generated:** 2025-12-19T11:49:00-05:00  
**Session:** Bickford Mode Activation + Multi-Repo Integration  
**Branch:** mobile  
**Total Changes:** 359 lines across 5 modified files + 8 new files

---

## Modified Files (5)

### 1. README.md (24 lines changed)
**File:** `01-readme-expo.diff`  
**Purpose:** Added Expo/React Native setup documentation  
**Summary:** Added "Bickford Live Filing (Expo)" section with `npm install` and `npx expo start` instructions

### 2. src/app/api/hvpe-chat/route.ts (79 lines changed)
**File:** `02-hvpe-chat-mode.diff`  
**Purpose:** Mode precedence over persona  
**Summary:** Refactored to prioritize `body.mode` over `body.persona`, returns `{reply, mode}` in response

### 3. src/app/api/bickford-chat/route.ts (98 lines changed)
**File:** `03-bickford-chat-unified.diff`  
**Purpose:** Unified agent integration + real OPTR  
**Summary:** 
- Added `buildUnifiedAgentPrompt()` call
- Added `recordChatHistory()` for persistence
- Replaced mock OPTR with real `runOptr()` from processor
- Integrated persona/mode handling

### 4. middleware.ts (38 lines changed)
**File:** `04-middleware-observability.diff`  
**Purpose:** Bickford route observability  
**Summary:**
- Added `BICKFORD_ROUTES` constant for `/api/bickford` paths
- Logs `x-bickford-ts` and `x-bickford-kind` headers on mutation requests
- Preserves existing LICENSE_COOKIE and STATIC_LOCK_SPEC logic

### 5. prisma/schema.prisma (120 lines changed)
**File:** `05-prisma-chat-models.diff`  
**Purpose:** Three-tier chat architecture + decision ledger  
**Summary:**
- Added `BickfordLedger` (kind, subject, payload, hash, parentId)
- Added `ChatLog` (flat log with userId, message, response)
- Added `ChatMessageLog` (grouped messages, no foreign keys)
- Added `ChatSession` + `ChatMessage` (full relational model)
- Added `ChatArchive` + `GlobalChatArchive` (conversation archival)
- Extended `AIPatchLog` with `repoRoot` field
- Added hybrid fields to `ChatMessage`: agentId, persona, mode

---

## New Files (8)

### Core Bickford Activation

1. **bickford.mode.json**
   - Executable activation artifact
   - Runtime flags: AUTO, PROMPTS_AS_STORAGE, OPTR_TTV, MANDATORY_TIMESTAMPS
   - Authority lock with timestamp

2. **src/lib/bickford/guardrails.ts**
   - `assertTimestampedAuthority(obj, path)` - throws if no ts field
   - `validateDecision(decision)` - checks kind/subject/payload
   - `checkOPTR_TTV(action)` - 90% effort removal rule

3. **src/lib/bickford/runtime.ts**
   - `loadBickfordMode()` - singleton config loader
   - `isBickfordMode()` - boolean mode check
   - `getBickfordFlag(flag)` - flag accessor
   - `enforceBickford(data, context)` - guardrails wrapper

4. **src/lib/bickford/ledger.ts**
   - `writeLedgerEntry(decision)` - SHA256 hashed persistence
   - `queryLedger(opts)` - time-based queries
   - `verifyLedgerIntegrity(entryId)` - rehash validation

### API Endpoints

5. **src/app/api/bickford/route.ts**
   - GET: Returns mode config status
   - POST: Writes ledger entry with validation

6. **src/app/api/bickford/ledger/route.ts**
   - GET: Query ledger (kind, subject, after, before, limit)

### Documentation & Ledger

7. **.bick/ledger/2025-12-19/** (11 JSON files)
   - Immutable decision history
   - Entries: activation, patches applied, schema evolution, repo verification
   - Each entry: id, ts, kind, subject, payload, hash, parentId

8. **BICKFORD_ACTIVATION.md**
   - Complete activation documentation
   - Setup instructions
   - Guardrails reference
   - API usage examples

---

## Combined Patch

**File:** `00-combined-all-diffs.patch` (12KB)  
Contains all diffs from files 2-5 above (excludes README)

---

## Application Instructions

### Apply All Changes
```bash
cd /workspaces/hvpe-cloud-portal

# Apply modified files
git apply .bick/diffs/00-combined-all-diffs.patch
git apply .bick/diffs/01-readme-expo.diff

# Add new Bickford files
git add bickford.mode.json
git add src/lib/bickford/
git add src/app/api/bickford/
git add .bick/
git add BICKFORD_ACTIVATION.md

# Commit
git commit -m "feat: Bickford mode activation + chat refactor + Expo setup"
```

### Regenerate Prisma Client
```bash
npx prisma generate
```

### Run Migration (when DATABASE_URL set)
```bash
npx prisma migrate dev --name add_bickford_and_chat_models
```

---

## Verification Commands

```bash
# Validate mode config
node -e "console.log(JSON.parse(require('fs').readFileSync('bickford.mode.json')))"

# Check Prisma client
npx prisma validate

# List ledger entries
ls -lh .bick/ledger/2025-12-19/

# Test API endpoint (requires dev server)
curl http://localhost:3000/api/bickford
```

---

## Missing Dependencies

These files are imported but not yet created:

1. **src/lib/chat/unifiedAgent.ts**
   - Export: `buildUnifiedAgentPrompt(opts)`
   - Used by: bickford-chat route

2. **src/lib/chat/history.ts**
   - Export: `recordChatHistory(entry)`
   - Used by: bickford-chat route

---

## Status Summary

- **Modified:** 5 files (README, hvpe-chat, bickford-chat, middleware, schema)
- **Created:** 8 files/directories (config, guardrails, runtime, ledger, APIs, docs)
- **Staged:** 3 files (README, hvpe-chat, bickford-chat)
- **Unstaged:** 2 files (middleware, schema)
- **Untracked:** 8 Bickford files
- **Prisma:** Client regenerated 6x, migrations pending
- **Ledger:** 11 immutable decision entries
- **Total LOC:** ~500 lines of new code + 359 lines modified

---

## Next Actions

1. ✅ All diffs extracted and documented
2. ⏳ Commit changes (user decision)
3. ⏳ Implement missing dependencies (unifiedAgent, history)
4. ⏳ Run database migration
5. ⏳ External repo integration (repos don't exist yet)
