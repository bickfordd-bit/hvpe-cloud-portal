# OPTR Trade API Quick Start

## 🚀 5-Minute Setup

### 1. Install Python Dependencies
```bash
cd scripts/optr
pip install -r requirements.txt
```

### 2. Configure Environment
```bash
# Copy template
cp .env.example .env

# Edit .env with your credentials
nano .env
```

Required values:
- `OPTR_ADMIN_KEY` - Create a random secret (32+ chars)
- `ALPACA_API_KEY` - Get from Alpaca dashboard
- `ALPACA_API_SECRET` - Get from Alpaca dashboard

### 3. Start the Worker
```bash
python3 worker_http.py
```

Output: `OPTR Worker listening on port 8787...`

### 4. Configure Portal
Add to portal's `.env.local`:
```bash
OPTR_ADMIN_KEY=<same-as-worker>
OPTR_WORKER_URL=http://localhost:8787
```

### 5. Start Portal
```bash
npm run dev
```

### 6. Test It!
```bash
curl -X POST http://localhost:3000/api/optr/trade \
  -H "Content-Type: application/json" \
  -H "x-optr-admin-key: YOUR_KEY_HERE" \
  -d '{"symbol":"AAPL","mode":"dollars","dollars":10}'
```

## 📋 Quick Reference

### API Request Format
```json
{
  "symbol": "AAPL",          // Required: 1-10 chars
  "side": "buy",             // Optional: buy|sell (default: buy)
  "mode": "dollars",         // Optional: auto|dollars|shares (default: auto)
  "dollars": 10,             // For dollars/auto mode
  "shares": 0,               // For shares mode
  "min_dollars": 1           // Minimum order size (default: 1)
}
```

### Success Response
```json
{
  "success": true,
  "data": {
    "success": true,
    "symbol": "AAPL",
    "side": "buy",
    "shares_executed": 0.05,
    "dollars_executed": 10.0,
    "order_id": "abc-123",
    "filled_price": 200.0
  },
  "rid": "request-id-here"
}
```

### Error Response
```json
{
  "success": false,
  "error": "error message",
  "rid": "request-id-here"
}
```

## 🧪 CLI Testing (No API)

Test Alpaca integration directly:
```bash
cd scripts/optr
python3 run_trade.py --symbol AAPL --mode dollars --dollars 10
```

## 🔒 Security Checklist

- [ ] Use strong random OPTR_ADMIN_KEY
- [ ] Start with paper trading (default)
- [ ] Never commit .env files
- [ ] Use HTTPS in production
- [ ] Monitor rate limits

## 📊 Modes Explained

| Mode | When to Use | Example |
|------|-------------|---------|
| `dollars` | Trade specific dollar amount | $10 of AAPL |
| `shares` | Trade specific number of shares | 0.5 shares of TSLA |
| `auto` | Let system decide (dollars preferred) | Either $10 or 0.5 shares |

## 🛠️ Troubleshooting

**"Worker unreachable"**
- Check worker is running: `ps aux | grep worker_http`
- Verify OPTR_WORKER_URL is correct

**"Unauthorized"**
- Ensure OPTR_ADMIN_KEY matches between portal and worker
- Check you're sending x-optr-admin-key header

**"Invalid symbol"**
- Symbol must be 1-10 characters
- Check symbol is valid on Alpaca

**"Insufficient funds"**
- Check Alpaca account has buying power
- Reduce order size

## 📚 More Info

- **Full docs:** See [README.md](README.md)
- **Deployment:** See [DEPLOYMENT.md](DEPLOYMENT.md)
- **Integration tests:** Run `./test_integration.sh`

## 🎯 Common Use Cases

### Buy $10 of AAPL
```bash
curl -X POST http://localhost:3000/api/optr/trade \
  -H "Content-Type: application/json" \
  -H "x-optr-admin-key: $OPTR_ADMIN_KEY" \
  -d '{"symbol":"AAPL","mode":"dollars","dollars":10}'
```

### Buy 0.5 shares of TSLA
```bash
curl -X POST http://localhost:3000/api/optr/trade \
  -H "Content-Type: application/json" \
  -H "x-optr-admin-key: $OPTR_ADMIN_KEY" \
  -d '{"symbol":"TSLA","mode":"shares","shares":0.5}'
```

### Sell 1 share of NVDA
```bash
curl -X POST http://localhost:3000/api/optr/trade \
  -H "Content-Type: application/json" \
  -H "x-optr-admin-key: $OPTR_ADMIN_KEY" \
  -d '{"symbol":"NVDA","side":"sell","mode":"shares","shares":1}'
```

## 🚦 System Status

Check if everything is working:

```bash
# Portal health
curl http://localhost:3000/api/health

# Worker (requires auth)
curl -X POST http://localhost:8787 \
  -H "x-optr-admin-key: $OPTR_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"AAPL","mode":"dollars","dollars":1}'
```

---

**Ready to go live?** See [DEPLOYMENT.md](DEPLOYMENT.md) for production setup.
