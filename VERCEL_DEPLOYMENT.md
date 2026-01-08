# Vercel Deployment Guide - GitHub Integration

> **⚠️ IMPORTANT: Billing Required for Production**
>
> To deploy and run this app in production, your Vercel project must be on a paid plan with billing enabled.
>
> - Free-tier accounts may experience build failures, cold starts, or resource limits.
> - Upgrade your Vercel project to a paid plan at https://vercel.com/pricing and ensure billing is enabled in your project settings.
> - See [Vercel Billing Docs](https://vercel.com/docs/projects/billing) for details.

**Repository:** bickfordd-bit/hvpe-cloud-portal  
**Branch:** mobile  
**Status:** Ready to deploy

---

## Step-by-Step Instructions

### 1. Go to Vercel

Visit: https://vercel.com/new

### 2. Import Git Repository

- Click "Import Git Repository"
- Select "GitHub" as the provider
- Search for: `bickfordd-bit/hvpe-cloud-portal`
- Click "Import"

### 3. Configure Project

**Framework Preset:** Next.js (auto-detected)

**Build Settings:**

- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`
- Development Command: `npm run dev`

**Root Directory:** Leave as `.` (root)

### 4. Add Environment Variables

Click "Environment Variables" and add:

```bash
# Required
DATABASE_URL=postgresql://user:password@host:5432/database

# Codex Automation
CODEX_WEBHOOK_SECRET=d38c9f08d6b06e76efd600998fd765202efaabc109d09d2b8ad7728f4b93b12a

# OpenAI (use one or both)
OPENAI_API_KEY=sk-...
HVPE_OPENAI_API_KEY=sk-...

# Session Security (generate new: openssl rand -hex 32)
LICENSE_SESSION_SECRET=your_64_char_hex_secret

# Optional
STRIPE_SECRET_KEY=sk_...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
ADMIN_DASH_TOKEN=...
AI_WEBHOOK_SECRET=...
```

### 5. Deploy

- Click "Deploy"
- Vercel will:
  1. Clone the repository
  2. Install dependencies
  3. Run build (~48 seconds)
  4. Deploy to production

### 6. Post-Deployment

**Your URLs:**

- Production: `https://hvpe-cloud-portal.vercel.app`
- Or custom domain: `https://your-domain.com`

**Test endpoints:**

```bash
# Health check
curl https://hvpe-cloud-portal.vercel.app/api/health

# Bickford status
curl https://hvpe-cloud-portal.vercel.app/api/bickford

# Codex sync (with secret)
curl https://hvpe-cloud-portal.vercel.app/api/codex/sync

# Persistence API
curl https://hvpe-cloud-portal.vercel.app/api/persistence
```

### 7. Database Migration

After deployment, run migrations:

```bash
# If DATABASE_URL is set in Vercel
npx prisma migrate deploy
```

Or use Vercel CLI:

```bash
vercel env pull .env.local
npx prisma migrate deploy
```

---

## Automatic Deployments

**Every push to `mobile` branch triggers:**

1. Automatic build
2. Automatic deployment
3. Zero-downtime rollout
4. Instant rollback capability

**Monitor deployments:**
https://vercel.com/bickfordd-bit/hvpe-cloud-portal/deployments

---

## Environment Variable Management

**Add variables:**

```bash
vercel env add DATABASE_URL production
# Paste value when prompted
```

**List variables:**

```bash
vercel env ls
```

**Pull to local:**

```bash
vercel env pull .env.local
```

---

## Custom Domain Setup

1. Go to Project Settings → Domains
2. Add your domain: `your-domain.com`
3. Configure DNS:
   ```
   CNAME: your-domain.com → cname.vercel-dns.com
   ```
4. Wait for SSL certificate (automatic)

---

## Troubleshooting

### Build Fails

- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Test locally: `npm run build`

### Database Connection Issues

- Verify `DATABASE_URL` format
- Check Prisma schema is up to date
- Run migrations if needed

### API Errors

- Check environment variables
- Review function logs in Vercel dashboard
- Test locally with same env vars

---

## Monitoring

**Vercel Dashboard:**

- Real-time logs
- Performance metrics
- Error tracking
- Analytics

**Custom Monitoring:**

```bash
# Check ledger entries
curl https://your-domain.com/api/bickford/ledger

# Verify infinite persistence
curl https://your-domain.com/api/persistence?kind=deployment
```

---

## Rollback

If deployment has issues:

1. Go to Deployments tab
2. Find previous working deployment
3. Click "Promote to Production"
4. Instant rollback (no downtime)

---

## Next Steps

After successful deployment:

1. ✅ Test all API endpoints
2. ✅ Run database migrations
3. ✅ Configure custom domain (optional)
4. ✅ Set up monitoring alerts
5. ✅ Test Codex sync webhook
6. ✅ Verify infinite persistence

---

**Deployment Status:** Ready ✅  
**Last Updated:** 2025-12-19  
**Configuration:** vercel.json ✅  
**GitHub:** Synced ✅
