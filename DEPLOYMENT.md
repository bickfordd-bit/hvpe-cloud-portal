# Deployment Guide

Complete guide for deploying HVPE Cloud Portal across all environments.

---

## Quick Deploy

### Local Development
```bash
make dev              # Start dev server on port 3000
make docker-dev       # Start with Docker Compose
```

### Docker Registry (GitHub Container Registry)
```bash
make docker-build     # Build image locally
make docker-push      # Push to ghcr.io
make docker-build-multi # Build & push multi-platform
```

### Vercel Production
```bash
make deploy-vercel    # Deploy to Vercel production
```

### Local Docker Production
```bash
make docker-compose-up    # Start with docker-compose.yml
make docker-compose-down  # Stop containers
```

---

## Deployment Options

### 1. **Vercel** (Recommended for Web)
**Best for:** Fast global CDN, automatic deployments, preview URLs

```bash
# Manual deployment
make deploy-vercel

# Or using Vercel CLI
vercel --prod
```

**Environment Variables Required:**
- `DATABASE_URL` - PostgreSQL connection
- `OPENAI_API_KEY` or `HVPE_OPENAI_API_KEY`
- `STRIPE_SECRET_KEY` (optional)
- `TWILIO_*` (optional for SMS)
- `ADMIN_DASH_TOKEN` (for admin features)

**Deployment Link:** vercel.json configured

---

### 2. **Docker + GHCR** (GitHub Container Registry)
**Best for:** Self-hosted, Kubernetes, scalable deployments

```bash
# Build for current platform
make docker-build

# Build for multiple platforms (requires buildx)
make docker-build-multi

# Push to registry
make docker-push

# Or build and push multi-platform in one command
make docker-push-multi
```

**Registry:** `ghcr.io/bickfordd-bit/hvpe-cloud-portal`

**Pull and run:**
```bash
docker pull ghcr.io/bickfordd-bit/hvpe-cloud-portal:latest
docker run -d -p 3000:3000 \
  -e DATABASE_URL="..." \
  -e OPENAI_API_KEY="..." \
  ghcr.io/bickfordd-bit/hvpe-cloud-portal:latest
```

---

### 3. **Docker Compose** (Local/Production)

#### Development with Hot Reload
```bash
make docker-dev           # Use docker-compose.dev.yml
make docker-dev-build     # Rebuild images first
```

**File:** `docker-compose.dev.yml`
- Hot reload on code changes
- Volume mounts for live editing
- Database service (PostgreSQL optional)

#### Production
```bash
make docker-compose-up      # Start all services
make docker-compose-logs    # View logs
make docker-compose-down    # Stop services
```

**File:** `docker-compose.yml`
- Production-optimized images
- Health checks enabled
- Restart policies configured
- Environment-based secrets

---

### 4. **Direct Node.js** (Minimal)

```bash
# Build
make build

# Run
make start
```

**Requirements:**
- Node.js 18+
- PostgreSQL (if using database)
- Environment variables in `.env.local`

---

## GitHub Actions Workflow

**File:** `.github/workflows/docker-publish.yml`

Automatically builds and pushes Docker images on:
- Push to main/production branches
- Manual workflow dispatch
- Tagged releases

**Workflow Steps:**
1. Checkout code
2. Setup Docker buildx
3. Build multi-platform image
4. Push to GHCR
5. Update image metadata

---

## Environment Setup

### Required Variables
```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# AI/OpenAI
OPENAI_API_KEY="sk-..."
# or
HVPE_OPENAI_API_KEY="sk-..."

# Optional - Payments
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Optional - SMS
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+1..."

# Security
ADMIN_DASH_TOKEN="secure-token-here"
AI_WEBHOOK_SECRET="webhook-secret"
SESSION_SECRET="random-string"
```

### Development (.env.local)
```bash
# Use for local development
DATABASE_URL="postgresql://localhost/hvpe_dev"
OPENAI_API_KEY="sk-..."
NODE_ENV="development"
```

### Production (.env.production)
```bash
# Use for production deployments
DATABASE_URL="postgresql://prod-host/hvpe"
OPENAI_API_KEY="sk-prod-..."
NODE_ENV="production"
```

---

## Deployment Checklist

### Before Deploying

**Code Quality:**
- [ ] Tests pass locally: `npm test`
- [ ] Linter passes: `npm run lint`
- [ ] No console errors in dev
- [ ] All environment variables set

**Database:**
- [ ] Migrations up to date: `npm run migrate:deploy`
- [ ] Backup created (production)
- [ ] Database connection verified

**Security:**
- [ ] Secrets not committed
- [ ] ADMIN_DASH_TOKEN set
- [ ] API keys rotated
- [ ] HTTPS enabled (production)

**Build:**
- [ ] Production build succeeds: `npm run build`
- [ ] Docker image builds: `make docker-build`
- [ ] No warnings in build output

**Testing:**
- [ ] Unit tests pass
- [ ] Integration tests pass (if available)
- [ ] Manual smoke test in preview

---

## Deployment Scenarios

### Scenario 1: Deploy to Vercel Production

```bash
# Ensure changes are committed
git add -A
git commit -m "Ready for production deployment"
git push origin main

# Deploy to Vercel
make deploy-vercel

# Verify deployment
curl https://hvpe-cloud-portal.vercel.app/api/health
```

### Scenario 2: Deploy Docker to Production Server

```bash
# Build multi-platform image
make docker-build-multi

# Push to registry
make docker-push

# On production server
docker pull ghcr.io/bickfordd-bit/hvpe-cloud-portal:latest
docker-compose -f docker-compose.yml up -d

# Check health
curl http://localhost:3000/api/health
```

### Scenario 3: Deploy with Docker Compose Locally

```bash
# Start development environment
make docker-dev-build

# View logs
make docker-compose-logs

# Stop when done
make docker-compose-down
```

---

## Health Checks

### API Health Endpoint
```bash
curl http://localhost:3000/api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-14T12:00:00Z",
  "uptime": "23h45m",
  "database": "connected",
  "environment": "production"
}
```

### Manual Health Check
```bash
make health-check
```

---

## Rollback Procedures

### Vercel Rollback
```bash
# View deployment history
vercel list

# Promote previous deployment
vercel --prod [deployment-url]
```

### Docker Rollback
```bash
# Stop current version
docker-compose down

# Pull previous image
docker pull ghcr.io/bickfordd-bit/hvpe-cloud-portal:previous-tag

# Start previous version
docker-compose up -d
```

---

## Monitoring & Logs

### Local Development
```bash
make docker-compose-logs
npm run dev  # Outputs to terminal
```

### Production Docker
```bash
make docker-logs
make docker-compose-logs
```

### Vercel
- Dashboard: https://vercel.com/dashboard
- Real-time logs available
- Performance analytics included

---

## Performance Optimization

### Build Optimization
- Next.js 16 Turbopack for fast builds
- Bundle analysis: `npm run build -- --analyze`
- Code splitting automatic

### Runtime Optimization
- Node.js memory: Adjust in docker-compose.yml
- Database connection pooling
- CDN caching (Vercel automatic)

### Database Optimization
- Prisma query optimization
- Index creation on frequently queried fields
- Connection pooling: `DATABASE_URL` with `?schema=public`

---

## Troubleshooting

### Build Fails
```bash
# Clean and rebuild
make clean
npm install
npm run build
```

### Docker Push Fails
```bash
# Check Docker login
docker login ghcr.io

# Verify credentials
cat ~/.docker/config.json
```

### Vercel Deployment Fails
```bash
# Check build logs in Vercel dashboard
# Verify environment variables are set
# Check Node.js version compatibility
```

### Health Check Fails
```bash
# Check if app is running
lsof -i :3000

# View logs
npm run dev  # with logging enabled
make docker-compose-logs
```

---

## Cost Considerations

**Vercel:** 
- Free tier: Unlimited deployments, 12 serverless function hours/month
- Pro: $20/month, more function hours
- Pricing: https://vercel.com/pricing

**Docker + Self-hosted:**
- Server cost: ~$5-50/month (VPS)
- GHCR: Free for public images
- Database: $15-100+/month (PostgreSQL)

**Hybrid (Vercel + Docker):**
- Web app on Vercel (fast, cheap)
- API on Docker (scalable, controlled)
- Database separate (managed service)

---

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Docker Documentation](https://docs.docker.com)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Docker Compose Reference](https://docs.docker.com/compose/reference/)

---

## Support

For deployment issues:
1. Check health endpoint: `/api/health`
2. View logs: `make docker-logs` or Vercel dashboard
3. Verify environment variables
4. Check database connectivity
5. Review build output for warnings

