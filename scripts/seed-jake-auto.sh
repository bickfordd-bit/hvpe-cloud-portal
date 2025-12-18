#!/bin/bash

# JAKE LICENSE SEED SCRIPT (Automated)
# Requires: DATABASE_URL set as env var or passed as argument

set -e

if [ -z "$DATABASE_URL" ] && [ -z "$1" ]; then
  echo "Usage:"
  echo "  Option A: DATABASE_URL='postgresql://...' bash scripts/seed-jake-auto.sh"
  echo "  Option B: bash scripts/seed-jake-auto.sh 'postgresql://...'"
  exit 1
fi

DB_URL="${1:-$DATABASE_URL}"

echo "🌱 SEEDING JAKE LICENSE"
echo "======================="
echo ""

# Check ts-node available
if ! command -v npx &> /dev/null; then
  echo "❌ npx not found. Install Node.js"
  exit 1
fi

# Check Prisma schema exists
if [ ! -f "prisma/schema.prisma" ]; then
  echo "❌ prisma/schema.prisma not found"
  exit 1
fi

# Check seed script exists
if [ ! -f "scripts/seed-jake-license.ts" ]; then
  echo "❌ scripts/seed-jake-license.ts not found"
  exit 1
fi

echo "📝 Generating Prisma client..."
npx prisma generate > /dev/null 2>&1

echo "📝 Seeding database..."
DATABASE_URL="$DB_URL" npx ts-node scripts/seed-jake-license.ts

echo ""
echo "✅ JAKE LICENSE SEEDED"
echo "======================="
echo ""
echo "Key: BICK-JAKE-LIFETIME-0001"
echo "Role: JAKE"
echo "Mode: JAKE_BUILD"
echo "Tier: LIFETIME"
echo ""
echo "Ready for smoke testing!"
echo ""
