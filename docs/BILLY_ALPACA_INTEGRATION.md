# Billy Portal - Alpaca API Integration

This document describes the Alpaca API integration, Bickford Chat, and Performance Dashboard features added to Billy's portal at `/t/billy`.

## Features

### 1. Alpaca API Connection UI

Located in the `AlpacaConnect` component, this allows Billy to:

- Enter Alpaca API credentials directly through the UI
- Automatically validate credentials with Alpaca
- Store credentials securely in Vercel environment variables
- Use paper trading by default (safe simulation mode)

**Component:** `src/components/alpaca/AlpacaConnect.tsx`
**API Route:** `src/app/api/alpaca/connect/route.ts`

### 2. Performance Dashboard

The `AlpacaDashboard` component displays:

- **Account Summary:** Equity, Cash, and Buying Power
- **Live Positions:** Symbol, Quantity, Current Price, Market Value, and P&L
- **Auto-refresh:** Portfolio data updates every 30 seconds

**Component:** `src/components/alpaca/AlpacaDashboard.tsx`
**API Route:** `src/app/api/alpaca/portfolio/route.ts`

### 3. Bickford Chat (AI Assistant)

The `BickfordChat` component provides:

- ChatGPT-powered investment advice
- Conversational interface for portfolio questions
- Context-aware responses focused on paper trading
- Real-time chat with GPT-4

**Component:** `src/components/bickford/BickfordChat.tsx`
**API Route:** `src/app/api/bickford/chat/route.ts`

## Environment Variables

### Required Variables (Set in Vercel Project Settings)

```bash
# Vercel API integration (for storing Alpaca credentials)
VERCEL_TOKEN=<your_vercel_api_token>
VERCEL_PROJECT_ID=<your_vercel_project_id>

# OpenAI API key (for Bickford Chat)
OPENAI_API_KEY=<your_openai_key>
# OR
HVPE_OPENAI_API_KEY=<your_openai_key>  # Preferred
```

### Automatically Set Variables

These are set automatically when Billy connects Alpaca through the UI:

```bash
ALPACA_API_KEY_billy=<alpaca_api_key>
ALPACA_API_SECRET_billy=<alpaca_api_secret>
```

The credentials are:

- Stored encrypted in Vercel
- Scoped by tenant (suffix `_billy`)
- Applied to production and preview environments

## Getting Credentials

### Vercel API Token

1. Go to [Vercel Account Settings](https://vercel.com/account/tokens)
2. Create a new token with appropriate permissions
3. Add to Vercel project as `VERCEL_TOKEN`

### Vercel Project ID

1. Go to your Vercel project settings
2. Copy the Project ID from the "General" tab
3. Add to Vercel project as `VERCEL_PROJECT_ID`

### OpenAI API Key

1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add to Vercel project as `HVPE_OPENAI_API_KEY` or `OPENAI_API_KEY`

### Alpaca API Credentials

1. Sign up at [Alpaca Markets](https://alpaca.markets/)
2. Create paper trading API keys (not live trading keys)
3. Enter through Billy's portal UI (Connect Alpaca section)

## Security Features

### Session Gating

- All API routes verify BILLY role before executing
- Returns 401 Unauthorized if session is invalid or wrong role
- Session managed via `licenseSession.crypto.ts`

### Paper Trading Only

- All Alpaca API calls use `paper-api.alpaca.markets`
- No live trading possible through this integration
- Safe simulation environment for testing strategies

### Credential Storage

- Alpaca keys stored as encrypted environment variables in Vercel
- Never stored in database or client-side
- Tenant-scoped to prevent cross-user access

### API Endpoints

All endpoints are protected and return 401 if not authenticated as BILLY:

```
POST /api/alpaca/connect       - Store and validate Alpaca credentials
GET  /api/alpaca/portfolio     - Fetch account and position data
POST /api/bickford/chat        - Chat with AI investment assistant
```

## Usage Flow

1. **Connect Alpaca:**
   - Navigate to `/t/billy`
   - Enter Alpaca API key and secret
   - Click "Connect Alpaca"
   - Credentials are validated and stored

2. **View Portfolio:**
   - Dashboard automatically loads after connection
   - Shows real-time equity, cash, and positions
   - Refreshes every 30 seconds

3. **Chat with Bickford:**
   - Type investment questions in the chat box
   - Get AI-powered advice on portfolio management
   - Receive reminders about paper trading mode

## Testing

### Component Tests

```bash
# Run all component tests
npx jest AlpacaConnect.test.tsx
npx jest BickfordChat.test.tsx

# All tests should pass (10 total)
```

### Manual Testing

1. Start dev server: `npm run dev`
2. Navigate to: `http://localhost:3000/t/billy`
3. Test UI components (expect 401 errors without session)

## Troubleshooting

### "Vercel integration not configured"

- Ensure `VERCEL_TOKEN` and `VERCEL_PROJECT_ID` are set
- Check token has correct permissions

### "Invalid Alpaca credentials"

- Verify API keys are for paper trading
- Check keys are active in Alpaca dashboard

### Bickford Chat not responding

- Ensure `OPENAI_API_KEY` or `HVPE_OPENAI_API_KEY` is set
- Verify OpenAI API key has sufficient credits

### 401 Unauthorized errors

- Expected behavior when not logged in as BILLY
- Check session cookie is present and valid
- Verify role is set to "BILLY" in session

## Architecture

```
Billy Page (/t/billy)
├── AlpacaConnect
│   └── POST /api/alpaca/connect
│       ├── Validate credentials with Alpaca
│       └── Store in Vercel env vars
│
├── AlpacaDashboard
│   └── GET /api/alpaca/portfolio
│       ├── Fetch account data
│       └── Fetch positions
│
└── BickfordChat
    └── POST /api/bickford/chat
        ├── OpenAI GPT-4 integration
        └── Investment advice context
```

## Future Enhancements

Potential improvements for future releases:

- [ ] Add trade execution through UI
- [ ] Historical performance charts
- [ ] Portfolio allocation recommendations
- [ ] Risk analysis metrics
- [ ] Alert notifications for portfolio changes
- [ ] Multi-account support
- [ ] Live trading toggle (with additional safeguards)
