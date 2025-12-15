# OPTR Alpaca Trade Execution

Python scripts for executing trades via Alpaca Trading API.

## Files

- **optr_alpaca_execute.py** - Core execution logic with Alpaca TradingClient
- **run_trade.py** - CLI wrapper for testing trades locally
- **worker_http.py** - HTTP server that receives trade requests from Next.js API
- **requirements.txt** - Python dependencies

## Setup

### Install Dependencies

```bash
pip install -r requirements.txt
```

This installs `alpaca-py` package for Alpaca API integration.

### Environment Variables

#### Required for all scripts:
- `ALPACA_API_KEY` - Your Alpaca API key
- `ALPACA_API_SECRET` - Your Alpaca API secret

#### Optional:
- `ALPACA_BASE_URL` - Alpaca API endpoint (default: `https://paper-api.alpaca.markets` for paper trading)

#### Required for HTTP worker:
- `OPTR_ADMIN_KEY` - Shared secret with Next.js API endpoint
- `OPTR_WORKER_PORT` - HTTP server port (default: 8787)

## Usage

### CLI Testing

Test trade execution directly without the HTTP server:

```bash
# Buy $10 worth of AAPL
python3 run_trade.py --symbol AAPL --side buy --mode dollars --dollars 10

# Buy 0.5 shares of TSLA
python3 run_trade.py --symbol TSLA --side buy --mode shares --shares 0.5

# Sell 1 share of NVDA
python3 run_trade.py --symbol NVDA --side sell --mode shares --shares 1
```

**Options:**
- `--symbol` (required): Stock ticker symbol
- `--side`: `buy` or `sell` (default: `buy`)
- `--mode`: `auto`, `dollars`, or `shares` (default: `auto`)
- `--dollars`: Dollar amount for notional orders
- `--shares`: Number of shares (supports fractional)
- `--min-dollars`: Minimum dollar threshold (default: 1.0)
- `--request-id`: Optional tracking ID

### HTTP Worker

Start the worker to receive requests from the Next.js API:

```bash
export OPTR_ADMIN_KEY="your-secret-key"
export ALPACA_API_KEY="your-alpaca-key"
export ALPACA_API_SECRET="your-alpaca-secret"
export ALPACA_BASE_URL="https://paper-api.alpaca.markets"  # optional
export OPTR_WORKER_PORT="8787"  # optional

python3 worker_http.py
```

The worker will listen on the configured port (default 8787) and process trade requests.

**API Endpoint:**
```
POST http://localhost:8787/
```

**Headers:**
- `Content-Type: application/json`
- `x-optr-admin-key: <your-secret-key>`
- `x-request-id: <optional-tracking-id>`

**Request Body:**
```json
{
  "symbol": "AAPL",
  "side": "buy",
  "mode": "dollars",
  "dollars": 10,
  "shares": 0,
  "min_dollars": 1,
  "request_id": "optional-uuid"
}
```

**Response (Success):**
```json
{
  "success": true,
  "symbol": "AAPL",
  "side": "buy",
  "mode": "dollars",
  "shares_executed": 0.05,
  "dollars_executed": 10.0,
  "order_id": "abc123",
  "filled_price": 200.0,
  "request_id": "uuid"
}
```

**Response (Failure):**
```json
{
  "success": false,
  "symbol": "AAPL",
  "side": "buy",
  "mode": "dollars",
  "shares_executed": 0,
  "dollars_executed": 0,
  "error": "insufficient_funds",
  "reason": "insufficient_funds",
  "request_id": "uuid"
}
```

## Paper Trading vs Live Trading

By default, the scripts use Alpaca's paper trading environment (`https://paper-api.alpaca.markets`).

To use live trading:
```bash
export ALPACA_BASE_URL="https://api.alpaca.markets"
```

**Warning:** Live trading uses real money. Always test with paper trading first!

## Error Handling

The executor provides explicit error reasons:
- `invalid_symbol` - Symbol not found or not valid
- `invalid_shares` - Invalid shares value for shares mode
- `invalid_dollars` - Invalid dollar amount for dollars mode
- `below_min_dollars` - Order below minimum threshold
- `insufficient_funds` - Not enough buying power
- `symbol_not_tradable` - Symbol exists but cannot be traded
- `alpaca_api_error` - Generic Alpaca API error
- `fill_timeout` - Order not filled within timeout
- `max_retries` - Max retry attempts exceeded
- `unknown_error` - Unexpected error

## Fractional Shares

Alpaca supports fractional shares for many stocks. You can trade as little as 0.0001 shares.

```bash
python3 run_trade.py --symbol AAPL --mode shares --shares 0.1
```

## Retry Logic

The executor automatically retries transient errors (rate limits, timeouts) up to 3 times with exponential backoff.

## Security Notes

- Never expose the HTTP worker publicly without authentication
- Use strong values for `OPTR_ADMIN_KEY`
- Keep your Alpaca API credentials secure
- The worker does not leak stack traces in responses
- All errors are logged to stderr for debugging
