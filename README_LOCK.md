# 🔐 LOCK System - Quick Start

**Status**: ✅ Production Ready  
**Verification**: 8/8 checks passed  
**Implementation**: December 18, 2025

---

## What Is LOCK?

A cryptographically-enforced specification system that:

1. **Locks** the entire application specification (`config/LOCK_SPEC.json`)
2. **Enforces** axioms at boot (FAIL-CLOSED if violated)
3. **Guards** routes by role (Jake, Billy)
4. **Binds** math formulas with drift detection (T2V$)
5. **Persists** all commands immutably (append-only ledger)
6. **Verifies** chain integrity on demand

---

## ✅ Verification Status

```bash
$ npx ts-node scripts/verify-lock.ts

✅ All 8 checks passed:
   ✓ Spec loads and parses
   ✓ All 7 axioms are true
   ✓ All 10 commands defined
   ✓ Routes configured
   ✓ T2V formula locked
   ✓ Trading controls set
   ✓ License keys configured
   ✓ Storage rules defined
```

---

## 📂 What Was Created

| File | Purpose | Status |
|---|---|---|
| `config/LOCK_SPEC.json` | Master specification | ✅ 368 lines |
| `src/lib/lock/*` | Boot validator | ✅ 84 lines |
| `src/lib/optr/t2v-spec.ts` | Formula binding | ✅ 95 lines |
| `src/lib/ledger/append.ts` | Event persistence | ✅ 142 lines |
| `src/app/api/lock/status/route.ts` | Status endpoint | ✅ 43 lines |
| `prisma/migrations/0_initial/` | Database setup | ✅ 23 lines SQL |
| `LOCK_SYSTEM.md` | Complete guide | ✅ 350+ lines |
| `LOCK_DEPLOYMENT.md` | Deployment guide | ✅ 300+ lines |
| `docs/LOCK_EXAMPLES.md` | 10 code examples | ✅ 400+ lines |

---

## 🚀 Deploy in 3 Steps

### 1. Set Database
```bash
export DATABASE_URL="postgresql://user:pass@host:5432/db"
```

### 2. Apply Migration
```bash
npx prisma migrate deploy
```

### 3. Start Server
```bash
npm run build
npm start
```

### 4. Verify
```bash
curl http://localhost:3000/api/lock/status | jq .
```

---

## 📖 Documentation

- **[LOCK_SYSTEM.md](./LOCK_SYSTEM.md)** — Complete guide + quick start
- **[LOCK_DEPLOYMENT.md](./LOCK_DEPLOYMENT.md)** — Deployment checklist
- **[docs/LOCK_EXAMPLES.md](./docs/LOCK_EXAMPLES.md)** — 10 code examples
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** — Technical overview

---

## 💻 Example Usage

### Record a DEFINE Event
```typescript
import { appendLedgerEvent } from "@/lib/ledger/append";

await appendLedgerEvent({
  tenant: "jake",
  command: "DEFINE",
  event_type: "CREATE",
  payload: {
    intent: "Reduce order processing time by 40%",
    target: "order_service",
    constraints: ["budget <= $500k"],
    success_criteria: ["response < 100ms"]
  }
});
```

### Score Paths by T2V$
```typescript
import { scorePaths } from "@/lib/optr/t2v-spec";

const scored = scorePaths([
  { id: "path_a", input: { V: 1M, T0: 30, deltaT: 5, Ch: 200, H: 40, R: 50k } },
  { id: "path_b", input: { V: 1M, T0: 30, deltaT: 2, Ch: 200, H: 20, R: 20k } }
]);

// Returns: [{ id, t2v_dollars, rank }] sorted ascending
// path_b wins (lower cost)
```

### Query Events
```typescript
import { getLedgerEvents } from "@/lib/ledger/append";

const events = await getLedgerEvents({
  tenant: "jake",
  command: "DEFINE",
  limit: 100
});
```

---

## 🔒 Enforcement Guarantees

| Layer | What | When | Consequence |
|---|---|---|---|
| **Boot** | Spec validation | App start | Crash if invalid |
| **Routes** | Role checks | Request | Redirect if not auth'd |
| **Math** | Formula drift | T2V$ call | Throw if drifted |
| **Ledger** | Command validation | Event append | Throw if invalid |
| **Chain** | Hash integrity | On demand | Returns errors |

---

## 📊 Specification

**Master Spec**: `config/LOCK_SPEC.json`

Contains:
- **7 Axioms**: PROMPTS_EQUALS_STORAGE, SUPPORT_ONLY, NO_NEW_MECHANISMS, etc.
- **10 Commands**: DEFINE, GAP, FREEZE, SIM, SCORE, OPTR, T2V, LEDGER, PROOF, SHIP
- **2 Tenants**: Jake (never_fail), Billy (can fail)
- **T2V Formula**: `T2V$ = (V / T0) * ΔT + Ch * H + R`
- **Trading Controls**: Billy hard cap $2k/order
- **Storage**: Append-only, CREATE/AMEND/SUPERSEDE

All locked at: **2025-12-18T00:00:00-05:00**

---

## 🧪 Test

### Run Verification
```bash
npx ts-node scripts/verify-lock.ts
```

### Check Lock Status
```bash
curl http://localhost:3000/api/lock/status
```

### Query Ledger
```typescript
import { getLedgerEvents } from "@/lib/ledger/append";
const events = await getLedgerEvents({ tenant: "jake" });
```

---

## ⚠️ Important

1. **DATABASE_URL Required** — Ledger needs PostgreSQL
2. **Boot Crashes If Invalid** — Fail-closed by design
3. **Spec Version Controlled** — Don't edit manually
4. **Middleware On Every Request** — Loads spec from cache
5. **Formula Locked** — T2V$ is immutable per spec

---

## 🎯 Next Steps

1. ✅ Review `LOCK_SYSTEM.md` for complete guide
2. ✅ Set `DATABASE_URL` environment variable
3. ✅ Run `npx prisma migrate deploy`
4. ✅ Deploy and verify `/api/lock/status`
5. ✅ Start using ledger for event tracking

---

## 📞 Reference

- **Spec Loader**: `src/lib/lock/spec.ts`
- **Boot Validator**: `src/lib/lock/validate.ts`
- **T2V Math**: `src/lib/optr/t2v-spec.ts`
- **Ledger API**: `src/lib/ledger/append.ts`
- **Status Endpoint**: `src/app/api/lock/status/route.ts`
- **Middleware Guards**: `middleware.ts`
- **Database**: `prisma/schema.prisma`

---

**Ready for Production** ✅
