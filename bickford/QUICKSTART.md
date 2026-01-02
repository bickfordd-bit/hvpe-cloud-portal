# Bickford Live Filing - Quick Start Guide

## Prerequisites

- **Node.js 20+**
- **Docker & Docker Compose**
- **npm 9+**

## Installation (5 minutes)

### 1. Navigate to Project

```bash
cd bickford
```

### 2. Install Dependencies

```bash
npm install
```

This installs all workspace dependencies for web, api, worker, and shared packages.

### 3. Start Infrastructure

```bash
npm run db
```

This starts PostgreSQL and Redis using Docker Compose.

### 4. Initialize Database

```bash
npm run db:init
```

This creates the `buckets` and `chunks` tables and inserts the 6 default buckets.

### 5. Start All Services

```bash
npm run dev
```

This starts:
- **API Server** on http://localhost:3001
- **WebSocket Server** on ws://localhost:3002  
- **Worker Process** (background)
- **Web App** on http://localhost:3000

## Testing the System

### 1. Open Browser

Navigate to: **http://localhost:3000**

You should see:
- Black header with "Bickford" title
- Green connection indicator (top-right)
- Empty stream area with placeholder text
- Chat input at bottom
- 6 bucket tiles at bottom (all showing "0")

### 2. Send a Test Message

Type in the chat input:

```
architect bickford with code and make decisions about risk management with metrics tracking and task planning
```

Press **Send** or hit **Enter**.

### 3. Watch the Magic ✨

**What You'll See:**

1. **Streaming Phase** (3-6 seconds):
   - 6-10 chunk cards appear in the stream area
   - Each chunk appears with a 300-800ms delay
   - Each card shows: "Chunk ID: xxxxxxxx..." and the content

2. **Filing Phase** (starts immediately after first chunk):
   - Cards animate with a "drop" effect
   - Cards disappear from stream area
   - Bucket counts increment in real-time
   - Visual feedback: cards scale down and move downward

3. **Final State**:
   - Stream area is clear
   - Bucket tiles show counts:
     - **Notes**: 2
     - **Code**: 1
     - **Decisions**: 1
     - **Risks**: 1
     - **Metrics**: 1
     - **Tasks**: 1

### 4. View Filed Chunks

Click on any bucket tile (e.g., "Code" or "Risks"):

- Left sidebar drawer opens
- Shows all chunks filed in that bucket
- Each chunk displays:
  - Timestamp
  - Full content
- Click the **×** button to close

## Example Messages to Try

### Full Stack Test
```
write code to handle security risks with 95% metrics and add this task to our list
```

**Expected Buckets**:
- Code: "write code to"
- Risks: "security risks"
- Metrics: "95% metrics"
- Tasks: "add this task"

### Decision Making
```
we need to choose between options and make a decision about the architecture
```

**Expected Buckets**:
- Decisions: "choose between options", "make a decision"

### Risk Analysis
```
identify security vulnerabilities and assess the risk of data breaches
```

**Expected Buckets**:
- Risks: "security vulnerabilities", "risk of data breaches"

### Metrics Dashboard
```
track 40% conversion rate and $50K monthly revenue with 85% retention
```

**Expected Buckets**:
- Metrics: All chunks (contains %, $)

### Task Planning
```
add this to the todo list and create a task for the sprint
```

**Expected Buckets**:
- Tasks: Both chunks

## How It Works

### Architecture Flow

1. **User sends message** → API Server
2. **API generates chunks** (fake LLM) → Publishes to Redis Streams
3. **API broadcasts** `chunk_created` → WebSocket clients
4. **UI displays chunks** in stream area (animated cards)
5. **Worker consumes events** from Redis
6. **Worker classifies chunks** → Determines bucket
7. **Worker saves to database** → PostgreSQL
8. **Worker broadcasts** `chunk_filed` → WebSocket clients
9. **UI animates filing** → Chunk drops into bucket
10. **UI updates bucket count** and removes chunk from stream

### Classification Rules

| Bucket | Trigger | Example |
|--------|---------|---------|
| **Code** | "code", "\`\`\`" | "write code" |
| **Decisions** | "decision", "choose" | "make a decision" |
| **Risks** | "risk", "security" | "security risk" |
| **Metrics** | "metric", "%", "$" | "40% growth" |
| **Tasks** | "todo", "task" | "add this task" |
| **Notes** | _(default)_ | Everything else |

## Troubleshooting

### WebSocket Shows "Disconnected"

**Problem**: Red indicator in top-right corner

**Solutions**:
1. Check API server is running: `curl http://localhost:3001/health`
2. Check WebSocket port 3002 is not blocked
3. Restart API server: Stop and run `npm run dev:api`

### Chunks Not Filing

**Problem**: Chunks appear but don't disappear

**Solutions**:
1. Check worker is running: Look for worker output in terminal
2. Check Redis is running: `docker compose ps`
3. Check worker logs for errors
4. Restart worker: Stop and run `npm run dev:worker`

### No Chunks Appearing

**Problem**: Send message but nothing happens

**Solutions**:
1. Check browser console for errors (F12)
2. Verify API server is running: `curl http://localhost:3001/health`
3. Check network tab for failed requests
4. Restart all services: `npm run dev`

## Stopping the System

### Stop All Services

```bash
# Press Ctrl+C in terminal running npm run dev
```

### Stop Individual Services

```bash
# Find processes
ps aux | grep node

# Kill specific process
kill <PID>
```

### Stop Database

```bash
npm run db:down
```

This stops and removes PostgreSQL and Redis containers.

## Development Workflow

### Work on Frontend Only

```bash
# Terminal 1: Keep database running
npm run db

# Terminal 2: Just run API + Worker
npm run dev:api & npm run dev:worker

# Terminal 3: Run web with hot reload
cd apps/web
npm run dev
```

### Work on API Only

```bash
# Terminal 1: Database
npm run db

# Terminal 2: API with auto-reload
cd apps/api
npm run dev
```

### Work on Worker Only

```bash
# Terminal 1: Database + API
npm run db
cd apps/api && npm run dev

# Terminal 2: Worker with auto-reload
cd apps/worker
npm run dev
```

## Next Steps

### Deploy to Production

See **README.md** for deployment options:
- VPS with Docker Compose
- Vercel + Railway
- AWS ECS
- Kubernetes

### Customize Classification

Edit `apps/worker/src/classifier.ts` to add new rules:

```typescript
// Add custom rule
if (lowerContent.includes('urgent')) {
  return 'Tasks';
}
```

### Add New Buckets

1. Add to `init.sql`:
   ```sql
   INSERT INTO buckets (name) VALUES ('MyBucket');
   ```

2. Update classifier in `classifier.ts`

3. Redeploy database: `npm run db:init`

## Support

For issues:
1. Check logs in terminal
2. Check browser console (F12)
3. Review **README.md** troubleshooting section
4. Check Docker container logs: `docker compose logs -f`

---

**Enjoy using Bickford Live Filing! 🚀**
