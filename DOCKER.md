# Docker Deployment Guide for HVPE Cloud Portal

## Quick Start

### Development (Local)
```bash
# Start all services (app + postgres)
docker-compose -f docker-compose.dev.yml up

# Access at http://localhost:3000
```

### Production (Local)
```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

---

## Building for GitHub Container Registry

### 1. Build the Image
```bash
# Build with proper tags
docker build -t ghcr.io/bickfordd-bit/hvpe-cloud-portal:latest \
             -t ghcr.io/bickfordd-bit/hvpe-cloud-portal:1.0.0 \
             .

# Or use buildx for multi-arch
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t ghcr.io/bickfordd-bit/hvpe-cloud-portal:latest \
  -t ghcr.io/bickfordd-bit/hvpe-cloud-portal:1.0.0 \
  --push \
  .
```

### 2. Authenticate with GitHub Container Registry
```bash
# Create a personal access token with write:packages scope
# Then login:
echo $GITHUB_TOKEN | docker login ghcr.io -u bickfordd-bit --password-stdin
```

### 3. Push to Registry
```bash
# Push latest
docker push ghcr.io/bickfordd-bit/hvpe-cloud-portal:latest

# Push version tag
docker push ghcr.io/bickfordd-bit/hvpe-cloud-portal:1.0.0
```

### 4. Pull from Registry
```bash
# Pull latest
docker pull ghcr.io/bickfordd-bit/hvpe-cloud-portal:latest

# Pull specific version
docker pull ghcr.io/bickfordd-bit/hvpe-cloud-portal:1.0.0

# Pull by digest (guaranteed same image)
docker pull ghcr.io/bickfordd-bit/hvpe-cloud-portal@sha256:...
```

---

## GitHub Actions CI/CD

Create `.github/workflows/docker-publish.yml`:

```yaml
name: Docker Build & Push

on:
  push:
    branches: [ main, ui-redesign-v1 ]
    tags: [ 'v*' ]
  pull_request:
    branches: [ main ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Log in to Container registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: ${{ github.event_name != 'pull_request' }}
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

---

## Environment Variables

### Required for Production
```bash
DATABASE_URL=postgresql://user:password@host:5432/database
OPENAI_API_KEY=sk-...
HVPE_OPENAI_API_KEY=sk-...
```

### Optional
```bash
OPTR_PASSCODE=your-secure-passcode
ADMIN_DASH_TOKEN=your-admin-token
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Create `.env` file:
```bash
# Copy from example
cp .env.example .env

# Edit with your values
nano .env
```

---

## Running in Production

### Using Docker Compose
```bash
# Start services
docker-compose up -d

# Run database migrations
docker-compose exec app npx prisma migrate deploy

# View logs
docker-compose logs -f

# Scale if needed
docker-compose up -d --scale app=3
```

### Using Docker Run
```bash
docker run -d \
  --name hvpe-portal \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e OPENAI_API_KEY="sk-..." \
  --restart unless-stopped \
  ghcr.io/bickfordd-bit/hvpe-cloud-portal:latest
```

### Using Kubernetes
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hvpe-portal
spec:
  replicas: 3
  selector:
    matchLabels:
      app: hvpe-portal
  template:
    metadata:
      labels:
        app: hvpe-portal
    spec:
      containers:
      - name: hvpe-portal
        image: ghcr.io/bickfordd-bit/hvpe-cloud-portal:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: hvpe-secrets
              key: database-url
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: hvpe-secrets
              key: openai-api-key
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
```

---

## Health Checks

The container includes a health check that monitors the `/api/health` endpoint:

```bash
# Check container health
docker inspect --format='{{.State.Health.Status}}' hvpe-portal

# View health check logs
docker inspect --format='{{json .State.Health}}' hvpe-portal | jq
```

---

## Troubleshooting

### Container won't start
```bash
# Check logs
docker logs hvpe-portal

# Check environment variables
docker exec hvpe-portal env

# Interactive shell
docker exec -it hvpe-portal sh
```

### Database connection issues
```bash
# Test connection from container
docker exec -it hvpe-portal sh -c 'node -e "require(\"@prisma/client\").PrismaClient().raw\`SELECT 1\`"'
```

### Performance issues
```bash
# Check resource usage
docker stats hvpe-portal

# Increase memory limit
docker run --memory="2g" --cpus="2" ...
```

---

## Image Optimization

Current image size: ~200MB (compressed)

### Further optimization:
1. Multi-stage builds (already implemented)
2. .dockerignore (already implemented)
3. Alpine base image (already implemented)
4. Layer caching in CI/CD (see GitHub Actions example)

---

## Security Best Practices

✅ Implemented:
- Non-root user (nextjs:nodejs)
- Health checks
- Minimal base image (Alpine)
- Container labels
- Read-only root filesystem (can be added with `--read-only`)

### Additional hardening:
```bash
docker run \
  --read-only \
  --tmpfs /tmp \
  --tmpfs /app/.next \
  --security-opt=no-new-privileges \
  --cap-drop=ALL \
  ghcr.io/bickfordd-bit/hvpe-cloud-portal:latest
```

---

## Monitoring & Logging

### Export logs to file
```bash
docker logs hvpe-portal > app.log 2>&1
```

### Use logging driver
```bash
docker run \
  --log-driver=json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  ...
```

### Integration with monitoring
- Datadog: `--label com.datadoghq.ad.logs='[...]'`
- Prometheus: Expose metrics on `/metrics`
- Grafana: Import container dashboards

---

## Backup & Restore

### Backup volumes
```bash
docker run --rm \
  -v hvpe_postgres_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/postgres_backup.tar.gz -C /data .
```

### Restore volumes
```bash
docker run --rm \
  -v hvpe_postgres_data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/postgres_backup.tar.gz -C /data
```

---

## Development Workflow

1. Make code changes locally
2. Test with development compose:
   ```bash
   docker-compose -f docker-compose.dev.yml up
   ```
3. Build production image:
   ```bash
   docker build -t hvpe-test .
   ```
4. Test production build:
   ```bash
   docker run -p 3000:3000 --env-file .env hvpe-test
   ```
5. Push to registry (see above)
6. Deploy to production

---

## Cleaning Up

```bash
# Stop and remove containers
docker-compose down

# Remove volumes (WARNING: deletes data)
docker-compose down -v

# Remove images
docker rmi ghcr.io/bickfordd-bit/hvpe-cloud-portal:latest

# Full cleanup
docker system prune -a --volumes
```

---

## Links

- GitHub Container Registry: https://github.com/bickfordd-bit/hvpe-cloud-portal/pkgs/container/hvpe-cloud-portal
- Docker Hub (if mirrored): https://hub.docker.com/r/bickfordtech/hvpe-portal
- Health Check: http://localhost:3000/api/health
