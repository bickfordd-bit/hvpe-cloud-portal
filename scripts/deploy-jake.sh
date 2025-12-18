#!/bin/bash

# JAKE INSTANCE DEPLOYMENT AUTOMATION SCRIPT
# This script automates all the setup and deployment steps

set -e  # Exit on error

echo "🚀 JAKE INSTANCE AUTO-DEPLOY SETUP"
echo "===================================="
echo ""
echo "This script will:"
echo "  1. Verify all files are in place"
echo "  2. Set up GitHub secrets"
echo "  3. Trigger Vercel deployment"
echo "  4. Seed Jake license"
echo "  5. Smoke test"
echo ""
echo "Prerequisites:"
echo "  ✓ GitHub CLI (gh) installed and authenticated"
echo "  ✓ Vercel CLI installed"
echo "  ✓ VERCEL_TOKEN from https://vercel.com/account/tokens"
echo "  ✓ DATABASE_URL for your PostgreSQL instance"
echo ""

# Check prerequisites
if ! command -v gh &> /dev/null; then
  echo "❌ GitHub CLI not found. Install with: brew install gh (macOS) or apt install gh (Linux)"
  exit 1
fi

if ! gh auth status &> /dev/null; then
  echo "❌ GitHub CLI not authenticated. Run: gh auth login"
  exit 1
fi

if ! command -v vercel &> /dev/null; then
  echo "⚠️  Vercel CLI not found. Install with: npm install -g vercel"
fi

echo "✅ Prerequisites met"
echo ""

# Step 1: Get credentials from user
echo "📝 STEP 1: Collecting credentials..."
echo ""

read -p "Enter your VERCEL_TOKEN (https://vercel.com/account/tokens): " VERCEL_TOKEN
if [ -z "$VERCEL_TOKEN" ]; then
  echo "❌ VERCEL_TOKEN is required"
  exit 1
fi

read -p "Enter your VERCEL_ORG_ID: " VERCEL_ORG_ID
if [ -z "$VERCEL_ORG_ID" ]; then
  echo "❌ VERCEL_ORG_ID is required"
  exit 1
fi

read -p "Enter your VERCEL_PROJECT_ID: " VERCEL_PROJECT_ID
if [ -z "$VERCEL_PROJECT_ID" ]; then
  echo "❌ VERCEL_PROJECT_ID is required"
  exit 1
fi

read -p "Enter your DATABASE_URL (postgresql://...): " DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL is required"
  exit 1
fi

LICENSE_SECRET="2ea392cfbba22268f2bb4639c9f8de2bdb486e9542484438a8d698dc022cb129"

echo ""
echo "✅ Credentials collected"
echo ""

# Step 2: Add GitHub secrets using gh CLI
echo "📝 STEP 2: Adding GitHub secrets..."
echo ""

REPO="bickfordd-bit/hvpe-cloud-portal"

gh secret set LICENSE_SESSION_SECRET \
  --repo "$REPO" \
  --body "$LICENSE_SECRET" \
  2>&1 || echo "⚠️  LICENSE_SESSION_SECRET may already exist"

gh secret set VERCEL_TOKEN \
  --repo "$REPO" \
  --body "$VERCEL_TOKEN" \
  2>&1 || echo "⚠️  VERCEL_TOKEN may already exist"

gh secret set VERCEL_ORG_ID \
  --repo "$REPO" \
  --body "$VERCEL_ORG_ID" \
  2>&1 || echo "⚠️  VERCEL_ORG_ID may already exist"

gh secret set VERCEL_PROJECT_ID \
  --repo "$REPO" \
  --body "$VERCEL_PROJECT_ID" \
  2>&1 || echo "⚠️  VERCEL_PROJECT_ID may already exist"

gh secret set DATABASE_URL \
  --repo "$REPO" \
  --body "$DATABASE_URL" \
  2>&1 || echo "⚠️  DATABASE_URL may already exist"

echo "✅ GitHub secrets configured"
echo ""

# Step 3: Trigger GitHub Actions workflow
echo "📝 STEP 3: Triggering Vercel deployment..."
echo ""

gh workflow run deploy-vercel.yml \
  --repo "$REPO" \
  --ref mobile

echo "✅ Deploy workflow triggered"
echo "   Monitor at: https://github.com/$REPO/actions"
echo ""

# Step 4: Wait for deployment
echo "⏳ Waiting for deployment to complete (~5-10 minutes)..."
echo ""
echo "You can monitor progress at:"
echo "  GitHub: https://github.com/$REPO/actions/workflows/deploy-vercel.yml"
echo "  Vercel: https://vercel.com/dashboard"
echo ""

# Give user time to check
echo "Press Enter when deploy is COMPLETE (all green checkmarks)..."
read -p "> "

echo ""
echo "📝 STEP 4: Setting Vercel environment variable..."
echo ""

# Step 5: Set Vercel env var (requires VERCEL_TOKEN)
export VERCEL_TOKEN="$VERCEL_TOKEN"

vercel env add LICENSE_SESSION_SECRET \
  --yes \
  --production \
  <<< "$LICENSE_SECRET" 2>&1 || echo "⚠️  LICENSE_SESSION_SECRET may already exist in Vercel"

echo "✅ Vercel environment variable configured"
echo ""

# Step 6: Seed Jake license
echo "📝 STEP 5: Seeding Jake license..."
echo ""

gh workflow run seed-jake-license.yml \
  --repo "$REPO" \
  --ref mobile \
  -f environment=production

echo "✅ Seed workflow triggered"
echo "   Monitor at: https://github.com/$REPO/actions"
echo ""

echo "⏳ Waiting for seed to complete (~1-2 minutes)..."
echo ""
echo "Press Enter when seed is COMPLETE (check logs for ✅)..."
read -p "> "

echo ""
echo "📝 STEP 6: Smoke test (manual)..."
echo ""
echo "Open an INCOGNITO window and test:"
echo ""
echo "  1. Visit: https://your-vercel-domain.com/t/jake"
echo "     → Should redirect to /license?next=/t/jake"
echo ""
echo "  2. Enter key: BICK-JAKE-LIFETIME-0001"
echo "     → Should land on /t/jake and show environment"
echo ""
echo "  3. Refresh page (Ctrl+R)"
echo "     → Should stay on /t/jake (cookie persists)"
echo ""
echo "  4. Try invalid key: BICK-INVALID-KEY"
echo "     → Should show error message"
echo ""

read -p "Did all 4 tests pass? (yes/no): " SMOKE_RESULT

if [ "$SMOKE_RESULT" = "yes" ]; then
  echo ""
  echo "🎉 SUCCESS! Jake instance is fully deployed and working!"
  echo ""
  echo "Summary:"
  echo "  ✅ GitHub secrets configured"
  echo "  ✅ Vercel deployed"
  echo "  ✅ Jake license seeded"
  echo "  ✅ Smoke tests passed"
  echo ""
  echo "Future deployments:"
  echo "  git push origin mobile"
  echo "  (Workflow auto-triggers, then manually run seed if needed)"
  echo ""
else
  echo ""
  echo "⚠️  Smoke tests failed. Troubleshooting:"
  echo ""
  echo "Check logs:"
  echo "  GitHub: https://github.com/$REPO/actions"
  echo "  Vercel: https://vercel.com/dashboard"
  echo ""
  echo "Common issues:"
  echo "  • LICENSE_SESSION_SECRET not in Vercel env vars"
  echo "  • Database not seeded yet"
  echo "  • Vercel build failed"
  echo ""
fi

