# Financial Life Management - Setup Guide

## Overview
"Our Life in Your Pocket" - Real-time financial tracking synced with Google Sheets

## Features
✅ Real-time sync with Google Sheets (every 30 seconds)
✅ Budget period tracking across multiple dates
✅ Income tracking (Jenna & Derek)
✅ Expense categorization
✅ Net worth dashboard (Savings + Stock)
✅ Action items / Todo list
✅ Financial health metrics
✅ Mobile-responsive design

## Access URLs
- **Jenna's Instance:** `https://your-domain/life`
- **Derek's Instance:** `https://your-domain/life`

Both URLs sync from the same Google Sheet, so changes appear instantly on both devices.

---

## Google Sheets Setup

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable "Google Sheets API"

### Step 2: Create API Key (Simple Method - Read Only)
1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > API Key**
3. Copy the API key
4. (Optional) Restrict the key to only Google Sheets API

### Step 3: Set Environment Variables

Add to your `.env` file or deployment environment:

```bash
# Google Sheets Configuration
GOOGLE_SHEETS_ID="your-spreadsheet-id"
GOOGLE_SHEETS_API_KEY="your-api-key"
```

**Finding your Spreadsheet ID:**
From your Google Sheets URL:
```
https://docs.google.com/spreadsheets/d/1ABC...XYZ/edit
                                     ^^^^^^^^
                                This is your ID
```

### Step 4: Share Your Sheet
1. Open your Google Sheet
2. Click **Share**
3. Change to **"Anyone with the link can view"** (for API key method)
4. Copy the link

---

## Google Sheets Format

Your sheet should follow this structure (matches your current format):

```
| A      | B     | C      | D     | E      | F     |
|--------|-------|--------|-------|--------|-------|
| 12/12  |       |        |       |        |       |
| Jenna  | 4179  | Derek  | 3780  |        |       |
| bus    | 300   |        |       |        |       |
| DCRA   | 451   |        |       |        |       |
| Delta  | $1,419|        |       |        |       |
|        |       |        |       |        |       |
| 12/17  |       |        |       |        |       |
| Derek  | 3780  |        |       |        |       |
| discover | -1000 |      |       |        |       |
| ...    |       |        |       |        |       |
|        |       |        |       |        |       |
| savings| 3500  |        |       |        |       |
| Stock  | 9301  |        |       |        |       |
|        |       |        |       |        |       |
| refill out bus form |  |        |       |        |       |
| do DCRA today |       |        |       |        |       |
```

The system automatically parses:
- Date headers (12/12, 12/17, etc.)
- Income entries (Jenna/Derek with amounts)
- Expense entries (category + amount)
- Delta calculations
- Asset totals (savings, Stock)
- Todo items

---

## Advanced Setup (Service Account - Full Access)

For write access or private sheets:

### Step 1: Create Service Account
1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > Service Account**
3. Name it "Financial Tracker"
4. Click **Create and Continue**
5. Skip role assignment
6. Click **Done**

### Step 2: Create Key
1. Click on your service account
2. Go to **Keys** tab
3. Click **Add Key > Create New Key**
4. Choose **JSON**
5. Download the key file

### Step 3: Set Environment Variable
```bash
GOOGLE_SHEETS_CREDENTIALS='{"type":"service_account","project_id":"...","private_key":"...",...}'
```

(Paste the entire JSON contents as a single-line string)

### Step 4: Share Sheet with Service Account
1. Open your Google Sheet
2. Click **Share**
3. Add the service account email (found in the JSON: `client_email`)
4. Give "Viewer" or "Editor" permission

---

## Instance Configuration

### For Jenna's Phone
1. Save this URL as home screen icon: `https://your-domain/life`
2. Opens full-screen app experience
3. Auto-syncs every 30 seconds
4. Works offline with last cached data

### For Derek's Phone
Same URL - both see the same data in real-time!

### Custom Per-User Views (Optional)
To show different data for different users, modify the API:

```typescript
// In src/app/api/finance/sync/route.ts
export async function GET(request: NextRequest) {
  const user = request.headers.get('x-user'); // 'jenna' or 'derek'
  
  // Filter or customize data based on user
  // ...
}
```

---

## Deployment

### Vercel
```bash
vercel env add GOOGLE_SHEETS_ID
vercel env add GOOGLE_SHEETS_API_KEY
vercel deploy --prod
```

### Docker
```bash
docker build -t financial-life .
docker run -e GOOGLE_SHEETS_ID="..." -e GOOGLE_SHEETS_API_KEY="..." -p 3000:3000 financial-life
```

### Traditional Hosting
```bash
export GOOGLE_SHEETS_ID="your-id"
export GOOGLE_SHEETS_API_KEY="your-key"
npm run build
npm start
```

---

## Mobile App Experience

### iOS (Safari)
1. Open `https://your-domain/life` in Safari
2. Tap the **Share** button
3. Scroll down and tap **"Add to Home Screen"**
4. Tap **"Add"**
5. Now you have a full-screen app icon!

### Android (Chrome)
1. Open `https://your-domain/life` in Chrome
2. Tap the **⋮** menu
3. Tap **"Add to Home screen"**
4. Tap **"Add"**
5. App icon appears on home screen!

---

## Security Notes

✅ **API Key Method:** Read-only access, sheet must be shared publicly
✅ **Service Account:** Full access, sheet can be private
✅ **Data in Transit:** HTTPS encrypted
✅ **No Data Storage:** App reads directly from Google Sheets
✅ **Session-Based:** No user accounts or passwords needed

---

## Troubleshooting

### "Google Sheets credentials not configured"
- Check that `GOOGLE_SHEETS_ID` and `GOOGLE_SHEETS_API_KEY` are set
- Restart your server after adding env vars

### "Failed to fetch financial data"
- Check that your Google Sheets ID is correct
- Verify the sheet is shared (for API key method)
- Check that Google Sheets API is enabled in Cloud Console

### Data not updating
- App syncs every 30 seconds automatically
- Click "Sync Now" button to force refresh
- Check browser console for errors

### Empty or wrong data
- Verify your sheet structure matches the expected format
- Check that date headers are in format "12/12" (MM/DD)
- Expense categories should match expected names

---

## Customization

### Change Sync Interval
Edit `src/app/life/page.tsx`:
```typescript
const interval = setInterval(fetchData, 30000); // 30 seconds
//                                       ^^^^^ Change this (in milliseconds)
```

### Add New Expense Categories
Edit `src/app/api/finance/sync/route.ts`:
```typescript
['bus', 'DCRA', 'discover', 'YOUR_NEW_CATEGORY']
```

### Customize Colors
Edit `src/app/life/page.tsx` - look for Tailwind color classes:
- `from-blue-600` → Change blue to your preferred color
- `bg-emerald-600` → Change accent colors

---

## Support

For issues or questions:
- Check the browser console for errors
- Verify Google Sheets API quota (1,000 requests per 100 seconds)
- Ensure sheet format matches expected structure

---

**Built with Bickford Technologies - Your Life, Your Pocket** 💙
