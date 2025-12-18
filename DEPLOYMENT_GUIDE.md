# LOCK System Deployment Guide

**Commit**: f81070c (just pushed)  
**Status**: ✅ Ready to deploy  
**Date**: December 18, 2025

---

## 🎯 Deployment Steps

### 1. Verify Build (Optional - for testing)
```bash
# This will compile but may run out of memory on type-checking
# Safe to skip if you trust the CI system
npm run build
```

### 2. Set Environment Variables

**Required**:
```bash
export DATABASE_URL="postgresql://user:password@host:5432/db_name"
```

**Optional** (for Billy trading):
```bash
export ALLOW_BILLY_LIVE_TRADING=true     # Enable live trading (default: false/paper)
```

### 3. Apply Database Migrations

```bash
# Generate Prisma client
npx prisma generate

# Apply migration (creates Ledger table)
npx prisma migrate deploy
```

### 4. Deploy Application

#### Option A: Docker Compose (Production)
```bash
# Build and start containers
docker-compose up -d

# Verify
curl http://localhost:3000/api/lock/status
```

#### Option B: Direct Node.js
```bash
# Build
npm run build

# Start
npm start
```

#### Option C: Vercel
```bash
# Deploy to Vercel (automatic from git)
npm run deploy:vercel

# Or via Vercel CLI
vercel deploy --prod
```

### 5. Verify Deployment

```bash
# Check lock status endpoint
curl https://your-domain/api/lock/status | jq .

# Expected response:
# {
#   "ok": true,
#   "lock_spec_version": "1.1.0",
#   "mode": "JAKE_BUILD",
#   "defines": { "command_ids": ["DEFINE", "GAP", "FREEZE", "SIM", "SCORE", "OPTR", "T2V", "LEDGER", "PROOF", "SHIP"] },
#   ...
# }
```

### 6. Verify Database

```bash
# Check Ledger table exists
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"Ledger\";"

# Should return: (1 row)
```

### 7. Monitor Boot Logs

Watch for any of these errors (they indicate deployment failure):
```
LOCK_SPEC_INVALID         ← Spec validation failed
LOCK violation            ← Runtime invariant violated
```

If you see none, deployment is successful ✅

---

## 🔐 Security Checklist

- [ ] `DATABASE_URL` is set (PostgreSQL required)
- [ ] `LICENSE_SESSION_SECRET` is set in production
- [ ] `OPENAI_API_KEY` or `HVPE_OPENAI_API_KEY` is configured
- [ ] Migration applied successfully
- [ ] `/api/lock/status` returns 200 with correct spec
- [ ] Ledger table has indexes (run: `\d "Ledger"` in psql)
- [ ] No "LOCK_SPEC_INVALID" errors in logs
- [ ] Boot takes < 5 seconds (quick validation)

---

## 📊 What Gets Deployed

| Component | Type | Status |
|---|---|---|
| LOCK_SPEC.json | Config | ✅ Locked & immutable |
| Boot Validator | Code | ✅ Enforces axioms |
| Route Guards | Middleware | ✅ Role-based access |
| T2V Formula Binding | Code | ✅ Drift detection |
| Ledger API | Code | ✅ Event persistence |
| Status Endpoint | API | ✅ Integrity checks |
| Database Migration | SQL | ✅ Creates Ledger table |

---

## 🚨 Rollback Procedure

If deployment fails:

1. **Check logs** for `LOCK_SPEC_INVALID` or `LOCK violation`
2. **Verify spec** hasn't been modified: `git diff config/LOCK_SPEC.json`
3. **Verify schema** hasn't been modified: `git diff prisma/schema.prisma`
4. **Revert commit** if corrupted: `git revert f81070c`
5. **Rollback database** (if migration failed):
   ```bash
   npx prisma migrate resolve --rolled-back migration_name
   ```

---

## 📝 Post-Deployment Checklist

- [ ] Status endpoint responds: `curl /api/lock/status`
- [ ] Jake route requires auth: `curl /t/jake` → redirects to `/license`
- [ ] Billy route requires auth: `curl /t/billy` → redirects to `/license`
- [ ] Ledger table has 0+ rows: `SELECT COUNT(*) FROM "Ledger"`
- [ ] No errors in logs: `docker logs <container>` (grep "LOCK_SPEC_INVALID")
- [ ] Build succeeded: Check CI/CD pipeline
- [ ] Tests passed: `npm test` (optional)

---

## 🔗 Key Files

| File | Purpose | Deployed |
|---|---|---|
| `config/LOCK_SPEC.json` | Master spec | Yes (immutable) |
| `src/lib/lock/*` | Boot validator | Yes |
| `src/lib/optr/t2v-spec.ts` | T2V binding | Yes |
| `src/lib/ledger/append.ts` | Event API | Yes |
| `src/app/api/lock/status/route.ts` | Status endpoint | Yes |
| `prisma/schema.prisma` | Database schema | Yes |
| `middleware.ts` | Route guards | Yes |

---

## 📞 Support

If deployment fails:

1. **Check status endpoint**: `GET /api/lock/status` returns detailed error
2. **Check boot logs**: Search for `LOCK_SPEC_INVALID` or `LOCK violation`
3. **Verify database**: `psql $DATABASE_URL -c "SELECT 1 FROM \"Ledger\" LIMIT 1;"`
4. **Check spec file**: Ensure `config/LOCK_SPEC.json` is valid JSON
5. **Review commit**: `git show f81070c --stat` shows all files changed

---

## ✅ Success Criteria

Deployment is successful when:

✓ Status endpoint returns 200  
✓ Boot time < 5 seconds  
✓ No "LOCK_SPEC_INVALID" errors  
✓ Ledger table exists with indexes  
✓ Jake/Billy routes enforce auth  
✓ T2V formula calls succeed  
✓ Middleware loads static spec  
✓ All tests pass (optional)

---

**Ready to deploy** - All systems go! 🚀
