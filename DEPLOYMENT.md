# HVPE Cloud Portal — Deployment Guide

Complete guide for deploying HVPE Cloud Portal to various platforms.

## Quick Deploy

```bash
# Deploy everywhere with one command
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

## Deployment Platforms

### 1. Vercel (Recommended for Production)

**Pros**: Zero config, automatic HTTPS, global CDN, serverless functions  
**Best for**: Production web hosting

#### Setup

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Login**:
```bash
vercel login
```

3. **Deploy**:
```bash
# Preview deployment
./scripts/deploy-vercel.sh

# Production deployment
./scripts/deploy-vercel.sh production
```

#### Environment Variables

Set these in Vercel Dashboard (Settings → Environment Variables):

```bash
HVPE_OPENAI_API_KEY=sk-proj-YOUR_KEY
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
ADMIN_DASH_TOKEN=your-secure-token
STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_KEY
```

#### Custom Domain

1. Add domain in Vercel dashboard
2. Update DNS records (A/CNAME)
3. Wait for SSL certificate provisioning

**Cost**: Free tier available, Pro starts at $20/month

---

### 2. GitHub Container Registry (GHCR)

**Pros**: Free for public repos, integrated with GitHub Actions  
**Best for**: Docker image hosting

#### Setup

1. **Create GitHub Personal Access Token**:
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Generate token with `write:packages` scope

2. **Login**:
```bash
export GITHUB_TOKEN=ghp_YOUR_TOKEN
echo $GITHUB_TOKEN | docker login ghcr.io -u bickfordd-bit --password-stdin
```

3. **Deploy**:
```bash
./scripts/deploy-ghcr.sh
```

#### Pull and Run

```bash
# Pull latest image
docker pull ghcr.io/bickfordd-bit/hvpe-cloud-portal:latest

# Run container
docker run -p 3000:3000 \
  --env-file .env.local \
  ghcr.io/bickfordd-bit/hvpe-cloud-portal:latest
```

**Cost**: Free for public repositories

---

### 3. Docker Hub

**Pros**: Most popular Docker registry, good for public images  
**Best for**: Wide distribution

#### Setup

1. **Login**:
```bash
docker login
```

2. **Deploy**:
```bash
./scripts/deploy-docker-hub.sh
```

#### Pull and Run

```bash
docker pull bickforddbit/hvpe-cloud-portal:latest
docker run -p 3000:3000 --env-file .env.local bickforddbit/hvpe-cloud-portal:latest
```

**Cost**: Free for public images, paid plans for private images

---

### 4. Local Docker Compose

**Pros**: Full control, easy local development/testing  
**Best for**: Self-hosted deployments, development

#### Development Mode (Hot Reload)

```bash
./scripts/deploy-local.sh
# Select option 1 (Development)
```

Features:
- Hot reload on code changes
- Source code mounted as volume
- Debugging enabled

#### Production Mode

```bash
./scripts/deploy-local.sh
# Select option 2 (Production)
```

Features:
- Optimized build
- No source code mounting
- Production-ready configuration

#### Manual Control

```bash
# Development
docker-compose -f docker-compose.dev.yml up -d

# Production
docker-compose -f docker-compose.yml up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f

# Rebuild
docker-compose build --no-cache
```

**Cost**: Free (you provide infrastructure)

---

### 5. Kubernetes (Enterprise)

**Pros**: High availability, auto-scaling, load balancing  
**Best for**: Large-scale enterprise deployments

#### Prerequisites

- Kubernetes cluster (GKE, EKS, AKS, or self-hosted)
- `kubectl` CLI installed
- Cluster access configured

#### Setup

1. **Create secrets**:
```bash
# Copy example
cp k8s/secrets.yaml.example k8s/secrets.yaml

# Edit with your values
nano k8s/secrets.yaml

# Apply
kubectl apply -f k8s/secrets.yaml
```

2. **Deploy**:
```bash
kubectl apply -f k8s/deployment.yaml
```

3. **Check status**:
```bash
kubectl get pods
kubectl get services
kubectl logs -f deployment/hvpe-cloud-portal
```

4. **Access**:
```bash
# Get external IP
kubectl get service hvpe-cloud-portal

# Port forward for testing
kubectl port-forward service/hvpe-cloud-portal 3000:80
```

#### Scaling

```bash
# Manual scaling
kubectl scale deployment hvpe-cloud-portal --replicas=5

# Auto-scaling
kubectl autoscale deployment hvpe-cloud-portal --min=3 --max=10 --cpu-percent=70
```

#### Ingress (HTTPS)

The included ingress configuration uses:
- **cert-manager** for automatic SSL certificates (Let's Encrypt)
- **nginx-ingress** for load balancing

Install prerequisites:
```bash
# cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# nginx-ingress
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml
```

**Cost**: Varies by cloud provider (GKE: ~$75/month minimum)

---

## CI/CD Automation

### GitHub Actions Workflows

Automatically deploy on push:

#### Vercel
`.github/workflows/deploy-vercel.yml` - Deploys on push to `main` or `ui-redesign-v1`

#### Docker
`.github/workflows/docker-publish.yml` - Builds and pushes Docker images on tag/release

### Setup GitHub Secrets

Add these secrets in GitHub repo settings:

```
VERCEL_TOKEN           # Vercel CLI token
VERCEL_ORG_ID          # From .vercel/project.json
VERCEL_PROJECT_ID      # From .vercel/project.json
GITHUB_TOKEN           # Auto-provided by GitHub Actions
DOCKER_USERNAME        # Docker Hub username
DOCKER_PASSWORD        # Docker Hub password or token
```

---

## Environment Variables Reference

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `HVPE_OPENAI_API_KEY` | OpenAI API key (preferred) | `sk-proj-...` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_SECRET` | Session encryption key | Generate with `openssl rand -base64 32` |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Fallback OpenAI key | - |
| `ADMIN_DASH_TOKEN` | Admin UI password | - |
| `STRIPE_SECRET_KEY` | Payment processing | - |
| `TWILIO_*` | SMS notifications | - |
| `AI_WEBHOOK_SECRET` | Voice-to-code auth | - |
| `OPENAI_TPM_LIMIT` | Rate limit (tokens/min) | 90000 |
| `OPENAI_RPM_LIMIT` | Rate limit (requests/min) | 3500 |

---

## Post-Deployment

### Health Checks

```bash
# API health
curl https://your-domain.com/api/health

# OpenAI key status (requires admin token)
curl https://your-domain.com/api/admin/openai-status \
  -H "x-admin-token: YOUR_ADMIN_TOKEN"
```

### Monitoring

1. **Vercel**: Built-in analytics at vercel.com/dashboard
2. **Docker**: Use `docker stats` or Prometheus
3. **Kubernetes**: Use built-in dashboard or Grafana

### Logs

```bash
# Vercel
vercel logs

# Docker
docker logs <container-id>

# Kubernetes
kubectl logs -f deployment/hvpe-cloud-portal
```

### Database Migrations

```bash
# Development
npx prisma migrate dev

# Production
npx prisma migrate deploy
```

---

## Troubleshooting

### Vercel Build Fails

**Issue**: Build timeout or out of memory

**Fix**:
```bash
# Increase build timeout in vercel.json
{
  "build": {
    "env": {
      "NODE_OPTIONS": "--max-old-space-size=4096"
    }
  }
}
```

### Docker Container Won't Start

**Issue**: Missing environment variables

**Fix**:
```bash
# Check logs
docker logs <container-id>

# Ensure .env.local is mounted
docker run -p 3000:3000 --env-file .env.local <image>
```

### Kubernetes Pods CrashLooping

**Issue**: Health checks failing

**Fix**:
```bash
# Check logs
kubectl logs -f <pod-name>

# Increase initialDelaySeconds in deployment.yaml
livenessProbe:
  initialDelaySeconds: 60  # Increase from 30
```

### OpenAI Rate Limits

**Issue**: 429 Too Many Requests

**Fix**:
```bash
# Upgrade OpenAI tier or adjust limits in .env.local
OPENAI_TPM_LIMIT=200000  # Tier 2
OPENAI_RPM_LIMIT=10000
```

---

## Rollback Procedures

### Vercel

```bash
# List deployments
vercel list

# Rollback to specific deployment
vercel rollback <deployment-url>
```

### Docker

```bash
# Pull previous version
docker pull ghcr.io/bickfordd-bit/hvpe-cloud-portal:<previous-tag>

# Restart with previous version
docker-compose restart
```

### Kubernetes

```bash
# Rollback deployment
kubectl rollout undo deployment/hvpe-cloud-portal

# Rollback to specific revision
kubectl rollout undo deployment/hvpe-cloud-portal --to-revision=2
```

---

## Security Checklist

- [ ] All secrets in environment variables (not hardcoded)
- [ ] HTTPS enabled (Vercel auto, use ingress for K8s)
- [ ] ADMIN_DASH_TOKEN set and secure
- [ ] Database has SSL enabled
- [ ] Rate limiting configured
- [ ] CORS configured properly
- [ ] CSP headers enabled
- [ ] OpenAI key rotated monthly

---

## Cost Estimates

### Small Deployment (Vercel + Managed DB)
- Vercel Pro: $20/month
- Neon Postgres: $19/month
- OpenAI API: $50/month (estimated)
- **Total**: ~$90/month

### Medium Deployment (Docker + VPS)
- DigitalOcean Droplet (4GB): $24/month
- Managed Postgres: $15/month
- OpenAI API: $200/month
- **Total**: ~$240/month

### Enterprise Deployment (Kubernetes)
- GKE Cluster: $75/month
- Cloud SQL: $50/month
- Load Balancer: $20/month
- OpenAI API: $500/month
- **Total**: ~$650/month

---

## Support

- Documentation: `README.md`, `DOCKER.md`
- Issues: https://github.com/bickfordd-bit/hvpe-cloud-portal/issues
- Security: See `SECURITY.md`

---

**Last Updated**: 2025-12-14  
**Version**: 1.0.0

