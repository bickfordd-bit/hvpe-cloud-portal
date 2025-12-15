# T2V Portal Artifacts - Migration Notes

## Database Migration Commands

After merging this PR, run the following commands to apply the database schema changes:

```bash
# Generate the Prisma client with new models
npx prisma generate

# Create and apply the database migration
npx prisma migrate dev --name add_t2v_deltas_and_defensibility
```

## What's New

### Database Models

1. **T2VDelta** - Time-to-Value delta tracking
   - Tracks baseline and improved values for engagements
   - Supports confidence scoring (0-1)
   - Indexed by accountId, engagementId, and updatedAt

2. **DefensibilitySnapshot** - Defensibility scoring system
   - Four levers: durability, wildcard, alignment, scalability (0-1 each)
   - Auto-computed score (sum of levers) and multiple (3 + 2*score)
   - Indexed by accountId, stream, and createdAt

### API Endpoints

1. **T2V Delta Ledger**
   - `GET /api/t2v-deltas?accountId=<id>&engagementId=<id>` - List deltas (limit 500)
   - `POST /api/t2v-deltas` - Create delta (requires accountId, baselineValue)
   - `PATCH /api/t2v-deltas/[id]` - Update delta (improvedValue, unit, source, confidence, notes)

2. **Defensibility API**
   - `GET /api/defensibility?accountId=<id>&stream=<stream>` - List snapshots (limit 200)
   - `POST /api/defensibility` - Create snapshot (requires accountId + 4 levers 0-1)

3. **Conversion Summary (Stub)**
   - `GET /api/conversions/summary?range=90d` - Returns static conversion data

### Mobile API Key Authentication

- Added `src/lib/auth/mobileKey.ts` guard helper
- Wired into `/api/ai/run` POST endpoint
- Checks `x-optr-mobile-key` header against `MOBILE_API_KEY` env var
- If `MOBILE_API_KEY` is not set, auth check is bypassed (dev mode)

### Dashboard

- New T2V dashboard at `/dashboard/optr/t2v`
- Server-side rendered table of T2V deltas
- Shows baseline, improved, delta, confidence, and notes
- Back link to main OPTR dashboard

## Environment Variables

Add to `.env.local` (optional):

```bash
# Mobile API key for securing /api/ai/run endpoint
MOBILE_API_KEY=your-secure-key-here
```

## Testing

Example API usage:

```bash
# Create a T2V delta
curl -X POST http://localhost:3000/api/t2v-deltas \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "demo",
    "engagementId": "eng_001",
    "baselineValue": 30.0,
    "unit": "days",
    "source": "manual entry",
    "confidence": 0.8
  }'

# Update with improved value
curl -X PATCH http://localhost:3000/api/t2v-deltas/<delta-id> \
  -H "Content-Type: application/json" \
  -d '{
    "improvedValue": 12.0,
    "notes": "After optimization sprint"
  }'

# Create defensibility snapshot
curl -X POST http://localhost:3000/api/defensibility \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "demo",
    "stream": "product_a",
    "durabilityLever": 0.8,
    "wildcardLever": 0.6,
    "alignmentLever": 0.9,
    "scalabilityLever": 0.7
  }'
```

## Known Pre-existing Issues

The build currently fails due to unrelated pre-existing issues:
- Winston logger using `fs` in client components
- Missing `xlsx` package dependency
- Wrong import in `bickford-chat` route
- Google Fonts network access issues

These issues exist on the base branch and are not introduced by this PR.
