#!/bin/bash
set -e

echo "🔍 Verifying deployment configuration..."

# Check for conflicting configs
if [ -f "bickford/vercel.json" ]; then
  echo "❌ ERROR: Remove bickford/vercel.json (conflicts with root config)"
  exit 1
fi

# Check vercel.json is valid
if ! jq empty vercel.json 2>/dev/null; then
  echo "❌ ERROR: vercel.json is not valid JSON"
  exit 1
fi

# Check for deprecated builds property
if jq -e '.builds' vercel.json >/dev/null 2>&1; then
  echo "❌ ERROR: vercel.json still uses deprecated 'builds' property"
  exit 1
fi

# Check .vercelignore exists
if [ ! -f ".vercelignore" ]; then
  echo "⚠️  WARNING: .vercelignore not found (deployments may be larger)"
fi

# Test build locally
echo "📦 Testing local build..."
npm run build

echo "✅ All deployment checks passed!"
echo "Ready to deploy with: vercel --prod"
