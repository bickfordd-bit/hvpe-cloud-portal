#!/bin/bash
set -e

echo "🚀 Starting Vercel deployment preparation..."

# Generate Prisma client (disable telemetry via env var)
export CHECKPOINT_DISABLE=1
npx prisma generate || echo "⚠️  Prisma generation skipped (firewall block)"

# Build the application
echo "📦 Building Next.js application..."
npm run build

echo "✅ Build complete! Ready for deployment."
