#!/bin/bash

# JAKE DEPLOYMENT - ONE LINER QUICK START
# Usage: bash scripts/deploy-jake-quick.sh <VERCEL_TOKEN> <VERCEL_ORG_ID> <VERCEL_PROJECT_ID> <DATABASE_URL>

set -e

if [ $# -lt 4 ]; then
  echo "Usage: bash scripts/deploy-jake-quick.sh <VERCEL_TOKEN> <VERCEL_ORG_ID> <VERCEL_PROJECT_ID> <DATABASE_URL>"
  echo ""
  echo "Example:"
  echo "  bash scripts/deploy-jake-quick.sh abc123xyz org_123 proj_456 postgresql://user:pass@host/db"
  echo ""
  exit 1
fi

VERCEL_TOKEN="$1"
VERCEL_ORG_ID="$2"
VERCEL_PROJECT_ID="$3"
DATABASE_URL="$4"
LICENSE_SECRET="2ea392cfbba22268f2bb4639c9f8de2bdb486e9542484438a8d698dc022cb129"
REPO="bickfordd-bit/hvpe-cloud-portal"

echo "🚀 JAKE INSTANCE QUICK DEPLOY"
echo "=============================="
echo ""

# Check gh CLI
if ! command -v gh &> /dev/null || ! gh auth status &> /dev/null; then
  echo "❌ GitHub CLI required. Install: brew install gh && gh auth login"
  exit 1
fi

echo "📝 Adding GitHub secrets..."
gh secret set LICENSE_SESSION_SECRET --repo "$REPO" --body "$LICENSE_SECRET" 2>/dev/null || true
gh secret set VERCEL_TOKEN --repo "$REPO" --body "$VERCEL_TOKEN" 2>/dev/null || true
gh secret set VERCEL_ORG_ID --repo "$REPO" --body "$VERCEL_ORG_ID" 2>/dev/null || true
gh secret set VERCEL_PROJECT_ID --repo "$REPO" --body "$VERCEL_PROJECT_ID" 2>/dev/null || true
gh secret set DATABASE_URL --repo "$REPO" --body "$DATABASE_URL" 2>/dev/null || true
echo "✅ Secrets configured"

echo ""
echo "📝 Triggering deploy workflow..."
gh workflow run deploy-vercel.yml --repo "$REPO" --ref mobile
echo "✅ Deploy triggered → https://github.com/$REPO/actions"

echo ""
echo "📝 Setting Vercel env var..."
export VERCEL_TOKEN="$VERCEL_TOKEN"
vercel env add LICENSE_SESSION_SECRET --yes --production <<< "$LICENSE_SECRET" 2>/dev/null || true
echo "✅ Vercel configured"

echo ""
echo "📝 Triggering seed workflow..."
gh workflow run seed-jake-license.yml --repo "$REPO" --ref mobile -f environment=production
echo "✅ Seed triggered → https://github.com/$REPO/actions"

echo ""
echo "✅ AUTOMATION COMPLETE!"
echo ""
echo "Next steps (manual):"
echo "  1. Wait ~5-10 min for deploy to complete"
echo "  2. Wait ~1-2 min for seed to complete"
echo "  3. Smoke test in incognito: https://your-domain.com/t/jake"
echo ""
