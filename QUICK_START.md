# Quick Reference — HVPE Cloud Portal (Post-Deployment)

## ✅ What's Ready

### LOCK System (Commit f81070c)
- Specification immutable at `config/LOCK_SPEC.json` (2025-12-18)
- 7 axioms, 10 commands, T2V formula bound
- Boot validation crashes if spec invalid
- Append-only ledger ready (needs DATABASE_URL)

### UI State Fix (Commits c4ccd3d → 05e6b86)
- Root page enforces redirect funnel: no dashboard before role resolved
- Jake page: minimalist Decision Continuity UI
- Billy page: trading-focused Portfolio UI (Account | Invest | Positions)
- Session verified at 3 layers (middleware → page → role page)

### Verification
```bash
npm run build                          # ✓ 48s, 0 errors
npx ts-node scripts/verify-lock.ts     # ✓ 8/8 checks
npx ts-node scripts/verify-ui-state.ts # ✓ 10/10 checks
```

---

## 🚀 Deployment Steps

```bash
# 1. Set environment variables
export DATABASE_URL="postgresql://..."
export LICENSE_SESSION_SECRET="$(openssl rand -hex 32)"
export OPENAI_API_KEY="sk-..."

# 2. Apply migrations
npm install
npx prisma migrate deploy

# 3. Build and test
npm run build
npm run health-check

# 4. Deploy (choose one)
npm run deploy:vercel    # Vercel
docker build -t app .    # Docker
kubectl apply -f k8s/    # Kubernetes
```

---

## 📍 Key Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | `app/page.tsx` | Entry point - redirects by role |
| `/license` | (existing) | Login/license key entry |
| `/t/jake` | `app/t/jake/page.tsx` | Jake Build (Decision Continuity) |
| `/t/billy` | `app/t/billy/page.tsx` | Billy Build (Portfolio) |
| `/api/health` | (existing) | Health check endpoint |
| `/api/lock/status` | (existing) | LOCK system status + integrity |

---

## 🔐 Session Flow

```
User login (POST /api/license/verify)
  ↓
Backend verifies key + creates JWT
  ↓
Set cookie: bick_license=<JWT>
  ↓
GET / (root page)
  ↓
getSession() reads & verifies cookie
  ↓
Redirect by role:
  - JAKE → /t/jake
  - BILLY → /t/billy
  - Invalid → /license
```

---

## 📋 Files to Review

### Core Implementation
- `config/LOCK_SPEC.json` — Master specification (locked)
- `src/lib/licenseSession.crypto.ts` — Session management
- `src/app/page.tsx` — Entry point funnel
- `src/app/t/jake/page.tsx` — Jake UI
- `src/app/t/billy/page.tsx` — Billy UI

### Documentation
- `DEPLOYMENT_GUIDE.md` — How to deploy
- `UI_STATE_FIX.md` — Architecture & session flow
- `SYSTEM_STATUS.md` — Overall system status
- `docs/LOCK_SYSTEM.md` — LOCK system details

### Verification
- `scripts/verify-lock.ts` — LOCK system checks
- `scripts/verify-ui-state.ts` — UI state checks

---

## 🔍 Troubleshooting

### Build fails: "Can't resolve '@/lib/licenseSession'"
- Ensure path alias `@/` maps to `src/` in `tsconfig.json`
- Check file exists: `src/lib/licenseSession.crypto.ts`

### Session always null
- Check `LICENSE_SESSION_SECRET` is set in `.env.local`
- Verify cookie name: `bick_license` (set by login endpoint)
- Check expiration: `exp` in JWT claims (unix seconds)

### User redirected to /license after login
- Verify JWT signature: check `LICENSE_SESSION_SECRET` matches backend
- Check role in JWT: should be "JAKE" or "BILLY"
- Verify cookie is set: check browser DevTools → Application → Cookies

### Database errors during migration
- Ensure `DATABASE_URL` is set and database is accessible
- Check migrations folder: `prisma/migrations/`
- Run: `npx prisma migrate status` to see migration state

---

## 📊 Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| Build Time | 48s | Turbopack on Next.js 16 |
| TypeScript Errors | 0 | In LOCK/UI files |
| LOCK Checks | 8/8 | Verification script passing |
| UI Checks | 10/10 | Verification script passing |
| Route Layers | 3 | Middleware → Page → Role page |
| Session Verification | 3 | Defense in depth |
| Spec Commands | 10 | DEFINE, GAP, FREEZE, SIM, etc. |
| Spec Axioms | 7 | IMMUTABLE, APPEND_ONLY, etc. |

---

## 🎯 Next Actions

1. **Pre-deployment**: Set `DATABASE_URL` and run migrations
2. **Staging test**: Verify Jake and Billy flows work
3. **Production**: Deploy with full environment setup
4. **Monitor**: Check logs for LOCK violations (should be none)
5. **Iterate**: Update features based on usage

---

## 📞 Support

- **LOCK system questions**: See `docs/LOCK_SYSTEM.md`
- **Deployment questions**: See `DEPLOYMENT_GUIDE.md`
- **Session/auth questions**: See `UI_STATE_FIX.md`
- **Overall status**: See `SYSTEM_STATUS.md`

---

**Last Updated**: Commit 223ebbe (docs: comprehensive system status)
**Build Status**: ✓ Compiled successfully in 48s
**Production Ready**: ✅ (pending DATABASE_URL setup)
