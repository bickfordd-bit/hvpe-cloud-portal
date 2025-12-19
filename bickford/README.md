# Bickford Live Filing

A minimalist, real-time chunk streaming and filing system with automatic classification.

## 🎯 Features

- **Real-time Streaming**: Watch message chunks appear in real-time as they're generated
- **Automatic Classification**: AI-powered bucket classification (Code, Decisions, Risks, Metrics, Tasks, Notes)
- **Visual Filing**: Animated chunks "drop" into buckets with smooth transitions
- **Live Updates**: WebSocket-powered real-time updates across all components
- **Drawer Interface**: Click any bucket to view filed chunks with timestamps
- **Clean UI**: Minimalist black and white design focused on clarity

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       User Browser                           │
│                      (Next.js App)                           │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Chat Input   │  │ Stream Area  │  │ Bucket Tiles │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  ▲                  │              │
│         │                  │                  │              │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
          │ HTTP POST        │ WebSocket        │ HTTP GET
          ▼                  │                  ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Server (Express)                     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ POST /chat   │  │ WS Server    │  │ GET /buckets │     │
│  │ (Fake LLM)   │  │ (port 3002)  │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  ▲                                 │
└─────────┼──────────────────┼─────────────────────────────────┘
          │                  │
          │ Publish          │ Broadcast
          ▼                  │
┌─────────────────────────────────────────────────────────────┐
│                     Redis Streams                            │
│                  (Event Bus: bickford:events)                │
└─────────────────────────────────────────────────────────────┘
          │                  ▲
          │ Consumer         │
          ▼                  │
┌─────────────────────────────────────────────────────────────┐
│                     Worker Process                           │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Redis        │  │ Classifier   │  │ WS Client    │     │
│  │ Consumer     │  │              │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                  │              │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                     PostgreSQL                               │
│                  (Buckets + Chunks)                          │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- npm 9+

### Local Development

1. **Clone and navigate**:
   ```bash
   cd bickford
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start infrastructure** (Postgres + Redis):
   ```bash
   npm run db
   ```

4. **Initialize database**:
   ```bash
   npm run db:init
   ```

5. **Start all services**:
   ```bash
   npm run dev
   ```

6. **Open browser**:
   ```
   http://localhost:3000
   ```

7. **Test the system**:
   - Type: "architect bickford with code and make decisions about risk management with metrics tracking and task planning"
   - Watch chunks stream in real-time
   - See them automatically file into buckets
   - Click any bucket to view filed chunks

### Alternative: Start Services Individually

```bash
# Terminal 1 - API Server
cd apps/api
npm run dev

# Terminal 2 - Worker
cd apps/worker
npm run dev

# Terminal 3 - Web App
cd apps/web
npm run dev
```

## 📋 Classification Rules

Chunks are automatically classified into buckets based on content:

| Bucket | Trigger Words | Example |
|--------|---------------|---------|
| **Code** | "code", "\`\`\`" | "Let's write some code to handle this" |
| **Decisions** | "decision", "choose" | "We need to make a decision about the architecture" |
| **Risks** | "risk", "security" | "There's a security risk we should address" |
| **Metrics** | "metric", "%", "$" | "The conversion rate is 15% with $50K revenue" |
| **Tasks** | "todo", "task" | "Add this to the task list for tomorrow" |
| **Notes** | _(default)_ | "This is an interesting observation" |

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 3** - Utility-first styling
- **WebSocket API** - Real-time updates

### Backend
- **Express 4** - HTTP API server
- **ws 8** - WebSocket server
- **Node.js 20** - Runtime
- **TypeScript 5** - Type safety

### Infrastructure
- **PostgreSQL 16** - Relational database
- **Redis 7** - Streams for event bus
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

## 📦 Project Structure

```
bickford/
├── apps/
│   ├── web/          # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/           # Next.js pages
│   │   │   └── components/    # React components
│   │   ├── package.json
│   │   └── next.config.js
│   │
│   ├── api/          # Express API server
│   │   ├── src/
│   │   │   ├── index.ts       # Main server
│   │   │   ├── db.ts          # Postgres client
│   │   │   └── redis.ts       # Redis client
│   │   └── package.json
│   │
│   └── worker/       # Background worker
│       ├── src/
│       │   ├── index.ts       # Main worker
│       │   ├── classifier.ts  # Bucket classifier
│       │   ├── db.ts          # Postgres client
│       │   └── redis.ts       # Redis client
│       └── package.json
│
├── packages/
│   └── shared/       # Shared TypeScript types
│       └── src/
│           └── types.ts
│
├── docker-compose.yml       # Local development
├── docker-compose.prod.yml  # Production deployment
├── init.sql                 # Database schema
├── nginx.conf              # Reverse proxy config
├── deploy.sh               # VPS deployment script
├── Dockerfile.web          # Web app container
├── Dockerfile.api          # API server container
├── Dockerfile.worker       # Worker container
├── Dockerfile.railway      # Railway deployment
├── vercel.json            # Vercel config
├── railway.json           # Railway config
└── package.json           # Root workspace config
```

## 🚢 Deployment Options

### 1. VPS Deployment (Docker Compose)

**Requirements**: VPS with Docker installed

```bash
# On your VPS
git clone <repo>
cd bickford

# Copy and configure environment
cp .env.example .env
nano .env  # Edit with your values

# Deploy
./deploy.sh
```

Services will be available at:
- Web UI: http://your-vps-ip:80
- API: http://your-vps-ip:3001
- WebSocket: ws://your-vps-ip:3002

**SSL Setup**: Uncomment SSL section in `nginx.conf` and place certificates in `./certs/`

### 2. Vercel + Railway

**Vercel** (Frontend):
```bash
cd apps/web
vercel --prod
```

**Railway** (API + Worker + Database):
1. Create new Railway project
2. Add PostgreSQL and Redis services
3. Deploy using `Dockerfile.railway`
4. Set environment variables in Railway dashboard
5. Update Vercel environment variables with Railway URLs

### 3. AWS (ECS + RDS + ElastiCache)

```bash
# Build and push images
docker build -f Dockerfile.web -t your-registry/bickford-web .
docker build -f Dockerfile.api -t your-registry/bickford-api .
docker build -f Dockerfile.worker -t your-registry/bickford-worker .

docker push your-registry/bickford-web
docker push your-registry/bickford-api
docker push your-registry/bickford-worker
```

Create ECS task definitions using the pushed images and configure:
- RDS PostgreSQL instance
- ElastiCache Redis cluster
- Application Load Balancer
- Environment variables

### 4. Kubernetes (Optional)

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/
```

Example `k8s/deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bickford-web
spec:
  replicas: 2
  selector:
    matchLabels:
      app: bickford-web
  template:
    metadata:
      labels:
        app: bickford-web
    spec:
      containers:
      - name: web
        image: your-registry/bickford-web:latest
        ports:
        - containerPort: 3000
        env:
        - name: NEXT_PUBLIC_API_URL
          value: "http://bickford-api:3001"
        - name: NEXT_PUBLIC_WS_URL
          value: "ws://bickford-api:3002"
---
apiVersion: v1
kind: Service
metadata:
  name: bickford-web
spec:
  selector:
    app: bickford-web
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

## 🧪 Testing

### Manual Testing

1. **Send a test message**:
   ```
   "Let's write some code to make decisions about security risks with 25% metrics improvement and add this task to the backlog. Also note that we should review this later."
   ```

2. **Expected behavior**:
   - Message chunks appear in stream area (6-10 chunks)
   - Each chunk animates and "drops" into appropriate bucket
   - Bucket counts increment in real-time
   - Clicking a bucket shows filed chunks with timestamps

### Expected Classifications

| Input | Expected Bucket |
|-------|----------------|
| "write some code" | Code |
| "make a decision" | Decisions |
| "security risk" | Risks |
| "25% improvement" | Metrics |
| "add this task" | Tasks |
| "note that" | Notes |

## 🔧 Development Commands

### Root Level
```bash
npm install          # Install all workspace dependencies
npm run dev         # Start all services concurrently
npm run db          # Start Postgres + Redis
npm run db:init     # Initialize database schema
npm run db:down     # Stop database services
npm run build       # Build all packages
```

### Individual Services
```bash
npm run dev:web     # Start web app only
npm run dev:api     # Start API server only
npm run dev:worker  # Start worker only
```

### Docker Commands
```bash
docker compose up -d                          # Start local dev
docker compose -f docker-compose.prod.yml up # Start production
docker compose logs -f                        # View logs
docker compose down                           # Stop services
```

## 🌐 Environment Variables

### Required Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/bickford

# Redis
REDIS_URL=redis://host:6379

# API Configuration
API_PORT=3001
WS_PORT=3002

# Public URLs (for frontend)
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3002
```

### Production Variables

For production deployments, update URLs to your actual domains:

```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_WS_URL=wss://ws.yourdomain.com
```

## 🐛 Troubleshooting

### WebSocket Connection Issues

**Symptom**: "Disconnected" indicator in UI

**Solutions**:
1. Check API server is running on port 3002
2. Verify `NEXT_PUBLIC_WS_URL` environment variable
3. Check browser console for WebSocket errors
4. Ensure no firewall blocking port 3002

### Database Connection Errors

**Symptom**: Worker or API crashes on start

**Solutions**:
1. Verify Postgres is running: `docker compose ps`
2. Check `DATABASE_URL` is correct
3. Run database initialization: `npm run db:init`
4. Check Postgres logs: `docker compose logs postgres`

### Redis Connection Errors

**Symptom**: Events not processing

**Solutions**:
1. Verify Redis is running: `docker compose ps`
2. Check `REDIS_URL` is correct
3. Test Redis: `docker compose exec redis redis-cli ping`

### Chunks Not Filing

**Symptom**: Chunks stream but don't file into buckets

**Solutions**:
1. Check worker is running and connected to WebSocket
2. Verify worker logs: `docker compose logs worker`
3. Check Redis consumer group: `docker compose exec redis redis-cli XINFO GROUPS bickford:events`
4. Restart worker: `docker compose restart worker`

## 📊 Performance Notes

- **Fake LLM**: Generates 6-10 chunks per message with 300-800ms delays
- **WebSocket**: Sub-100ms latency for real-time updates
- **Database**: Indexed queries for fast bucket retrieval
- **Redis Streams**: Durable message delivery with consumer groups

## 🔐 Security Considerations

### Production Checklist

- [ ] Enable SSL/TLS (HTTPS/WSS)
- [ ] Set strong database passwords
- [ ] Use environment variables for secrets
- [ ] Enable PostgreSQL SSL mode
- [ ] Configure Redis authentication
- [ ] Set up firewall rules
- [ ] Enable CORS restrictions in API
- [ ] Use secure WebSocket (WSS)
- [ ] Regular security updates
- [ ] Monitor logs for suspicious activity

## 📝 License

This project is part of the HVPE Cloud Portal and follows the same license terms.

## 🤝 Contributing

This is a prototype demonstration of the Bickford Live Filing concept. For production use cases or contributions, please contact the HVPE team.

## 📧 Support

For issues or questions:
- Check the troubleshooting section above
- Review Docker Compose logs
- Verify all services are running
- Check browser console for frontend errors

---

Built with ❤️ by the Bickford Team
