# OPTR Alpaca Trading Worker

Python-based trade execution service for OPTR trades via Alpaca API with comprehensive safety guards.

## Installation

```bash
pip install -r requirements.txt
```

## Components

### 1. `optr_alpaca_execute.py` - Trade Executor
Core execution logic with all safety checks:
- Paper-only enforcement
- Symbol allowlist
- Per-order notional cap
- Per-day notional cap
- Alpaca API integration

### 2. `worker_http.py` - HTTP Server
HTTP server that accepts trade requests from the Next.js API route.

**Start the worker:**
```bash
python3 worker_http.py
```

Runs on port 8787 by default (configurable via `OPTR_WORKER_PORT`).

### 3. `run_trade.py` - CLI Tool
Command-line interface for direct trade execution.

**Examples:**
```bash
# Market buy $50 of AAPL
python3 run_trade.py --symbol AAPL --side buy --notional 50

# Buy 10 shares
python3 run_trade.py --symbol AAPL --side buy --qty 10

# Limit buy
python3 run_trade.py --symbol AAPL --side buy --qty 10 --type limit --limit-price 150.00
```

## Environment Variables

### Required
- `ALPACA_API_KEY` - Alpaca API key
- `ALPACA_SECRET_KEY` - Alpaca secret key
- `ALPACA_BASE_URL` - Alpaca API endpoint
  - Paper: `https://paper-api.alpaca.markets`
  - Live: `https://api.alpaca.markets`

### Safety Guards (Optional)
- `OPTR_SYMBOL_ALLOWLIST` - Comma-separated allowed symbols (e.g., `AAPL,MSFT,GOOGL`)
- `OPTR_MAX_NOTIONAL` - Max dollars per order (default: 50)
- `OPTR_MAX_NOTIONAL_PER_DAY` - Max total dollars per day (default: unlimited)
- `OPTR_ALLOW_LIVE` - Enable live trading (default: false, paper only)

### HTTP Worker
- `OPTR_ADMIN_KEY` - Authentication key (matches Next.js API)
- `OPTR_WORKER_PORT` - HTTP server port (default: 8787)

## Safety Features

1. **Paper-Only Enforcement**: Blocks live trading unless `OPTR_ALLOW_LIVE=true`
2. **Symbol Allowlist**: Restricts trading to approved symbols
3. **Notional Caps**: Limits order size and daily volume
4. **Request Authentication**: Requires admin key for HTTP requests
5. **Explicit Error Reasons**: Returns machine-readable failure codes without stack traces

## Testing Safety Guards

```bash
# Test paper-only enforcement (should block)
python3 optr_alpaca_execute.py '{"symbol":"AAPL","side":"buy","notional":50}'

# Test with paper URL (should pass paper check)
ALPACA_BASE_URL="https://paper-api.alpaca.markets" \
python3 optr_alpaca_execute.py '{"symbol":"AAPL","side":"buy","notional":50}'

# Test symbol allowlist (should block AAPL)
ALPACA_BASE_URL="https://paper-api.alpaca.markets" \
OPTR_SYMBOL_ALLOWLIST="MSFT,GOOGL" \
python3 optr_alpaca_execute.py '{"symbol":"AAPL","side":"buy","notional":50}'

# Test notional cap (should block $50 order)
ALPACA_BASE_URL="https://paper-api.alpaca.markets" \
OPTR_MAX_NOTIONAL="30" \
python3 optr_alpaca_execute.py '{"symbol":"AAPL","side":"buy","notional":50}'
```

## Production Deployment

1. **Set environment variables** in your production environment
2. **Start the HTTP worker** as a background service:
   ```bash
   nohup python3 worker_http.py > worker.log 2>&1 &
   ```
3. **Configure Next.js** with `OPTR_WORKER_URL=http://localhost:8787`
4. **Enable monitoring** by tailing worker.log for structured JSON logs

## Error Codes

- `live_trading_blocked` - Live trading not allowed
- `symbol_not_allowed` - Symbol not in allowlist
- `exceeds_max_notional` - Order exceeds per-order cap
- `exceeds_daily_notional` - Daily limit reached
- `missing_credentials` - Alpaca credentials not set
- `insufficient_funds` - Insufficient buying power
- `market_closed` - Market is closed
- `symbol_not_found` - Invalid symbol
- `execution_failed` - Other execution error
