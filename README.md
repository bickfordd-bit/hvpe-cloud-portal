HVPE Cloud Portal – Next.js (App Router) with Stripe and Prisma-backed licensing.

## Environment
Set these in `.env.local` (and in Vercel Project Settings → Environment Variables):

- `DATABASE_URL` (Postgres)
- Other app-specific vars you already use (`STRIPE_SECRET_KEY`, webhook secrets, mail creds, etc.)
- `OPENAI_API_KEY` (for the in-portal HVPE chat dock)

## Prisma setup (Postgres)
1) Generate client (requires `DATABASE_URL` set):
```bash
npx prisma generate
```
2) Apply schema to your DB (creates License + LicenseRequest tables):
```bash
npx prisma migrate dev --name init_license_models
# In production, use: npx prisma migrate deploy
```

## License approval API
Endpoint: `POST /api/license/approve`
Payload:
```json
{ "requestId": "YOUR_PENDING_REQUEST_ID" }
```
Response (example):
```json
{ "success": true, "licenseKey": "HVPE-XXXXXX-XXXXXX-XXXXXX", "email": "user@example.com" }
```
Use from the live site (browser console or curl):
```bash
curl -X POST https://your-domain/api/license/approve \
  -H "Content-Type: application/json" \
  -d '{ "requestId": "..." }'
```

## Dev commands
- Install deps: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`

## HVPE chat dock
- API: `POST /api/hvpe-chat` (requires `OPENAI_API_KEY`)
- UI: floating chat button/dock on all pages via `HvpeChatDock`
