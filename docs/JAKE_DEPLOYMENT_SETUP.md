# Jake Instance Deployment Setup

## Required GitHub Secrets

Add these to your GitHub repository settings (`Settings > Secrets and variables > Actions`):

### Existing Secrets (verify they exist)
- `VERCEL_TOKEN` — Vercel API token
- `VERCEL_ORG_ID` — Vercel organization ID
- `VERCEL_PROJECT_ID` — Vercel project ID

### New Secrets (for Jake instance)

#### `LICENSE_SESSION_SECRET` (Required)
- **Purpose**: Sign/verify JWT session cookies for license authentication
- **Value**: Generate with:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- **Visibility**: Set for both `production` and `preview` environments in Vercel
- **Rotation**: No specific expiration, but rotate annually for security

#### `DATABASE_URL` (If not already set)
- **Purpose**: Connect to production PostgreSQL for seeding Jake license
- **Value**: Your PostgreSQL connection string
- **Format**: `postgresql://user:password@host:port/database`
- **Visibility**: Required for seed workflow

#### `SLACK_WEBHOOK` (Optional)
- **Purpose**: Send deployment and seed notifications to Slack
- **Value**: Your Slack incoming webhook URL
- **Visibility**: Only needed if you enable Slack notifications

---

## Deployment Flow

### 1. Push to `mobile` branch
```bash
git push origin mobile
```

### 2. GitHub Actions Auto-Trigger
- `.github/workflows/deploy-vercel.yml` runs automatically
- Checks for `LICENSE_SESSION_SECRET` in secrets
- Builds and deploys to Vercel production

### 3. Manual Seed Workflow (One-time or as needed)
Go to: **Actions > Seed Jake License (Production) > Run workflow**

- Select environment: `production` or `preview`
- This seeds `BICK-JAKE-LIFETIME-0001` into your database

---

## Setup Checklist

- [ ] Add `LICENSE_SESSION_SECRET` to GitHub secrets (production + preview)
- [ ] Verify `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` exist
- [ ] Verify `DATABASE_URL` is set in secrets
- [ ] Push to `mobile` branch
- [ ] Verify deploy completes in Vercel dashboard
- [ ] Run seed workflow (Actions tab) to insert Jake license
- [ ] Test in incognito: `/t/jake` → `/license?next=/t/jake` → enter key → redirects to `/t/jake` ✅

---

## Troubleshooting

### Deploy fails: "LICENSE_SESSION_SECRET not found"
→ Add the secret to GitHub and Vercel environment variables

### Seed fails: "DATABASE_URL not found"
→ Add `DATABASE_URL` to GitHub secrets, and ensure it's set in Vercel prod env

### Jake page shows "Access denied"
→ Run seed workflow to insert license into database

### Cookie not persisting
→ Verify `LICENSE_SESSION_SECRET` matches between GitHub and Vercel env vars

---

## Vercel Environment Setup (if needed manually)

If not using GitHub Actions secrets sync, set in Vercel dashboard:

**Vercel Project > Settings > Environment Variables**

Add:
```
LICENSE_SESSION_SECRET = (your 64-char hex value)
```

Set availability:
- ✓ Production
- ✓ Preview
- ✓ Development

---

## Post-Deployment Smoke Test

Once deployed:

```bash
# In incognito window, visit:
https://your-vercel-domain.com/t/jake

# Should redirect to:
https://your-vercel-domain.com/license?next=/t/jake

# Enter key:
BICK-JAKE-LIFETIME-0001

# Should land on and persist at:
https://your-vercel-domain.com/t/jake
```

Refresh the page multiple times to verify session cookie persists.

---

## Key Rotation (Optional)

If you need to rotate `LICENSE_SESSION_SECRET`:

1. Generate new value: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
2. Update GitHub secret
3. Update Vercel environment variable
4. Re-deploy: `git push origin mobile`
5. Existing sessions become invalid (users redirected to `/license`)

