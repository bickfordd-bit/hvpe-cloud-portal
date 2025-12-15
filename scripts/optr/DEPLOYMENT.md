# OPTR Trade System Deployment Guide

This guide covers deploying the complete OPTR trade system including the Next.js API endpoint and Python Alpaca worker.

## Architecture Overview

```
Client (Browser/API Consumer)
    ↓ POST /api/optr/trade
Next.js API Endpoint (port 3000)
    ↓ HTTP POST with payload
Python Worker (port 8787)
    ↓ Alpaca API calls
Alpaca Trading Platform
```

## Prerequisites

### Next.js Portal
- Node.js 18+
- Next.js 16
- Environment variables configured

### Python Worker
- Python 3.8+
- pip for package management
- Alpaca account (paper or live)

## Environment Setup

### 1. Next.js Portal Environment Variables

Add to `.env.local` or deployment platform (Vercel, etc.):

```bash
# OPTR Trade API
OPTR_ADMIN_KEY=<strong-random-key>
OPTR_WORKER_URL=http://localhost:8787
OPTR_MAX_NOTIONAL=50  # optional, default 50
```

**Important:**
- Use a strong random key for `OPTR_ADMIN_KEY` (e.g., 32+ character random string)
- Set `OPTR_WORKER_URL` to the actual worker endpoint in production
- `OPTR_MAX_NOTIONAL` limits dollar amounts for non-shares mode orders

### 2. Python Worker Environment Variables

Create `scripts/optr/.env`:

```bash
# Authentication (must match portal)
OPTR_ADMIN_KEY=<same-as-portal>

# Alpaca credentials
ALPACA_API_KEY=<your-alpaca-key>
ALPACA_API_SECRET=<your-alpaca-secret>

# Environment selection
ALPACA_BASE_URL=https://paper-api.alpaca.markets  # paper trading
# ALPACA_BASE_URL=https://api.alpaca.markets      # live trading

# Optional
OPTR_WORKER_PORT=8787
```

## Installation

### Next.js Portal

Already included in the main application. No additional setup needed beyond environment variables.

### Python Worker

```bash
cd scripts/optr
pip install -r requirements.txt
```

For production, consider using a virtual environment:

```bash
cd scripts/optr
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# or: venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

## Running the System

### Development

1. **Start the Next.js dev server:**
   ```bash
   npm run dev
   # Runs on http://localhost:3000
   ```

2. **Start the Python worker:**
   ```bash
   cd scripts/optr
   source .env  # or use python-dotenv
   python3 worker_http.py
   # Worker listening on port 8787
   ```

3. **Test the integration:**
   ```bash
   cd scripts/optr
   ./test_integration.sh
   ```

### Production Deployment

#### Option 1: Single Server (Development/Testing)

Run both Next.js and Python worker on the same server:

```bash
# Terminal 1: Next.js
npm run build
npm start

# Terminal 2: Python worker
cd scripts/optr
python3 worker_http.py
```

Use a process manager like PM2 or systemd:

```bash
# PM2 example
pm2 start npm --name "hvpe-portal" -- start
pm2 start "cd scripts/optr && python3 worker_http.py" --name "optr-worker"
```

#### Option 2: Separate Services (Recommended for Production)

**Next.js Portal:**
- Deploy to Vercel, Netlify, or your hosting platform
- Set `OPTR_WORKER_URL` to worker endpoint (e.g., `https://optr-worker.example.com`)

**Python Worker:**
- Deploy as a separate service (AWS EC2, DigitalOcean, Heroku, etc.)
- Expose port 8787 (or custom port)
- Use reverse proxy (nginx) with SSL
- Consider Docker deployment (see below)

#### Option 3: Docker Deployment

Create `scripts/optr/Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY *.py .

EXPOSE 8787

CMD ["python3", "worker_http.py"]
```

Build and run:

```bash
docker build -t optr-worker scripts/optr
docker run -d \
  -p 8787:8787 \
  -e OPTR_ADMIN_KEY=<key> \
  -e ALPACA_API_KEY=<key> \
  -e ALPACA_API_SECRET=<secret> \
  -e ALPACA_BASE_URL=https://paper-api.alpaca.markets \
  --name optr-worker \
  optr-worker
```

## Security Considerations

### Critical
1. **Never expose the worker endpoint publicly without authentication**
2. **Use HTTPS for all production endpoints**
3. **Rotate `OPTR_ADMIN_KEY` periodically**
4. **Keep Alpaca credentials secure** (use secrets manager in production)
5. **Implement network-level access controls** (firewall rules, security groups)

### Recommended
1. Add IP whitelisting to worker
2. Implement request signing beyond simple key auth
3. Monitor for unusual trading patterns
4. Set up alerts for failed authentication attempts
5. Use separate Alpaca keys for paper and live trading

### Rate Limiting
- Portal implements 30 req/min per IP (in-memory)
- Consider adding rate limiting at reverse proxy level
- Monitor Alpaca API rate limits

## Monitoring

### Logs

**Portal (Next.js):**
- Structured JSON logs via Winston
- Check stderr/stdout or log files
- Key log messages:
  - "Trade request received"
  - "Trade request completed"
  - "Worker returned error"
  - "Failed to reach worker"

**Worker (Python):**
- Logs to stderr
- Key log messages:
  - "[Worker] POST / ..."
  - "[Worker] Unexpected error: ..."
  - Error responses don't leak stack traces

### Health Checks

**Portal:**
```bash
curl http://localhost:3000/api/health
```

**Worker:**
Send a test request (requires auth):
```bash
curl -X POST http://localhost:8787 \
  -H "x-optr-admin-key: $OPTR_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"AAPL","mode":"dollars","dollars":1}'
```

### Metrics to Monitor
- Request rate (requests/min)
- Success/failure ratio
- Average response time
- Worker availability
- Alpaca account balance
- Order fill rates

## Troubleshooting

### "Worker unreachable" errors
- Check worker is running: `ps aux | grep worker_http`
- Verify `OPTR_WORKER_URL` is correct
- Check network connectivity between services
- Review worker logs for startup errors

### Authentication failures
- Verify `OPTR_ADMIN_KEY` matches between portal and worker
- Check headers are being sent correctly
- Review portal logs for "Unauthorized trade request attempt"

### Alpaca API errors
- Check credentials are correct
- Verify `ALPACA_BASE_URL` is set correctly
- Check account has sufficient buying power
- Review Alpaca API status page
- Ensure symbol is valid and tradable

### Rate limit exceeded
- Wait 1 minute for rate limit window to reset
- Reduce request frequency
- Consider implementing request queuing

## Testing

### Unit Tests
```bash
# Portal endpoint tests
npm test -- route.test.ts
```

### Integration Tests
```bash
# Requires both services running
cd scripts/optr
./test_integration.sh
```

### Manual Testing
```bash
# Using curl
curl -X POST http://localhost:3000/api/optr/trade \
  -H "Content-Type: application/json" \
  -H "x-optr-admin-key: $OPTR_ADMIN_KEY" \
  -d '{
    "symbol": "AAPL",
    "mode": "dollars",
    "dollars": 10
  }'

# Using CLI (bypasses portal, direct to Alpaca)
cd scripts/optr
python3 run_trade.py --symbol AAPL --mode dollars --dollars 10
```

## Maintenance

### Updating Dependencies

**Next.js:**
```bash
npm update
npm audit fix
```

**Python:**
```bash
cd scripts/optr
pip install --upgrade -r requirements.txt
```

### Log Rotation

Configure log rotation for production:
- Next.js: Winston transports handle rotation
- Python: Use system log rotation (logrotate)

### Backup and Recovery

- No persistent state in worker (stateless)
- Portal rate limiting is in-memory (resets on restart)
- Trade history is in Alpaca account (accessible via API)

## Going Live

Before switching from paper to live trading:

1. ✅ Test thoroughly with paper trading
2. ✅ Verify all validations work correctly
3. ✅ Set up monitoring and alerts
4. ✅ Configure proper security measures
5. ✅ Test with small dollar amounts first
6. ✅ Document rollback procedures
7. ✅ Set `ALPACA_BASE_URL=https://api.alpaca.markets`
8. ✅ Update Alpaca credentials to live keys
9. ✅ Monitor closely for first few hours/days

## Support

For issues or questions:
- Check logs first (portal and worker)
- Review Alpaca API documentation
- Test with paper trading first
- Verify environment variables are set correctly
