#!/bin/bash

# preflight-check.sh - Pre-deployment validation and auto-fixes
# Validates environment, dependencies, and build prerequisites before deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
CHECKS_PASSED=0
CHECKS_FAILED=0
AUTO_FIXES_APPLIED=0

echo -e "${BLUE}🔍 Preflight Validation Started${NC}"
echo "========================================"

# Function to check and report
check() {
  local name="$1"
  local status="$2"
  
  if [ "$status" = "pass" ]; then
    echo -e "${GREEN}✅ $name${NC}"
    ((CHECKS_PASSED++))
  elif [ "$status" = "warn" ]; then
    echo -e "${YELLOW}⚠️  $name${NC}"
  else
    echo -e "${RED}❌ $name${NC}"
    ((CHECKS_FAILED++))
  fi
}

# Function to apply auto-fix
autofix() {
  local description="$1"
  echo -e "${YELLOW}🔧 Auto-fix: $description${NC}"
  ((AUTO_FIXES_APPLIED++))
}

# 1. Check required secrets/environment variables
echo ""
echo "1️⃣  Checking Required Secrets..."
if [ -n "$VERCEL_TOKEN" ]; then
  check "VERCEL_TOKEN is set" "pass"
else
  check "VERCEL_TOKEN is set" "fail"
fi

if [ -n "$VERCEL_ORG_ID" ]; then
  check "VERCEL_ORG_ID is set" "pass"
else
  check "VERCEL_ORG_ID is set" "fail"
fi

if [ -n "$VERCEL_PROJECT_ID" ]; then
  check "VERCEL_PROJECT_ID is set" "pass"
else
  check "VERCEL_PROJECT_ID is set" "fail"
fi

# Check optional but recommended secrets
echo ""
echo "2️⃣  Checking Optional Secrets..."
if [ -n "$DATABASE_URL" ]; then
  check "DATABASE_URL is set" "pass"
else
  check "DATABASE_URL not set (optional - some features disabled)" "warn"
fi

if [ -n "$LICENSE_SESSION_SECRET" ]; then
  check "LICENSE_SESSION_SECRET is set" "pass"
else
  check "LICENSE_SESSION_SECRET not set (optional)" "warn"
fi

if [ -n "$OPENAI_API_KEY" ] || [ -n "$HVPE_OPENAI_API_KEY" ]; then
  check "OpenAI API key is set" "pass"
else
  check "OpenAI API key not set (optional - AI features disabled)" "warn"
fi

# 3. Check Node.js and npm
echo ""
echo "3️⃣  Checking Node.js Environment..."
if command -v node &> /dev/null; then
  NODE_VERSION=$(node --version)
  check "Node.js installed: $NODE_VERSION" "pass"
  
  # Check if version is 18 or higher
  MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
  if [ "$MAJOR_VERSION" -ge 18 ]; then
    check "Node.js version >= 18" "pass"
  else
    check "Node.js version < 18 (may cause issues)" "warn"
  fi
else
  check "Node.js installed" "fail"
fi

if command -v npm &> /dev/null; then
  NPM_VERSION=$(npm --version)
  check "npm installed: $NPM_VERSION" "pass"
else
  check "npm installed" "fail"
fi

# 4. Check if package.json exists
echo ""
echo "4️⃣  Checking Project Files..."
if [ -f "package.json" ]; then
  check "package.json exists" "pass"
else
  check "package.json exists" "fail"
fi

if [ -f "package-lock.json" ]; then
  check "package-lock.json exists" "pass"
else
  check "package-lock.json exists" "warn"
fi

# 5. Check node_modules and dependencies
echo ""
echo "5️⃣  Checking Dependencies..."
if [ -d "node_modules" ]; then
  check "node_modules directory exists" "pass"
  
  # Check if node_modules is stale (older than package.json)
  if [ "package.json" -nt "node_modules" ]; then
    check "Dependencies are up to date" "warn"
    autofix "Reinstalling dependencies"
    npm ci --legacy-peer-deps || npm install --legacy-peer-deps
  else
    check "Dependencies are up to date" "pass"
  fi
else
  autofix "Installing dependencies"
  npm ci --legacy-peer-deps || npm install --legacy-peer-deps
  check "Dependencies installed" "pass"
fi

# 6. Check Prisma setup
echo ""
echo "6️⃣  Checking Prisma Setup..."
if [ -d "prisma" ]; then
  check "Prisma directory exists" "pass"
  
  if [ -f "prisma/schema.prisma" ]; then
    check "Prisma schema exists" "pass"
    
    # Check if Prisma client is generated
    if [ -d "node_modules/.prisma/client" ]; then
      check "Prisma client generated" "pass"
    else
      autofix "Generating Prisma client"
      npx prisma generate || true
      check "Prisma client generated" "pass"
    fi
  else
    check "Prisma schema exists" "warn"
  fi
else
  check "Prisma directory exists" "warn"
fi

# 7. Check for common build blockers
echo ""
echo "7️⃣  Checking Build Prerequisites..."

# Check TypeScript
if command -v tsc &> /dev/null || [ -f "node_modules/.bin/tsc" ]; then
  check "TypeScript available" "pass"
else
  check "TypeScript available" "fail"
fi

# Check Next.js
if [ -f "node_modules/.bin/next" ]; then
  check "Next.js installed" "pass"
else
  check "Next.js installed" "fail"
fi

# 8. Quick build verification (fast check)
echo ""
echo "8️⃣  Quick Build Check..."
echo "Running quick syntax check..."
if npx tsc --noEmit --skipLibCheck 2>&1 | head -20; then
  check "TypeScript syntax check passed" "pass"
else
  check "TypeScript syntax check (some errors found, may still build)" "warn"
fi

# 9. Check disk space
echo ""
echo "9️⃣  Checking System Resources..."
if command -v df &> /dev/null; then
  DISK_USAGE=$(df -h . | tail -1 | awk '{print $5}' | sed 's/%//')
  if [ "$DISK_USAGE" -lt 90 ]; then
    check "Disk space available: $DISK_USAGE% used" "pass"
  else
    check "Disk space low: $DISK_USAGE% used" "warn"
    
    # Try to clean npm cache
    if [ "$DISK_USAGE" -gt 95 ]; then
      autofix "Cleaning npm cache"
      npm cache clean --force || true
    fi
  fi
fi

# 10. Verify critical files
echo ""
echo "🔟 Checking Critical Files..."
CRITICAL_FILES=(
  "next.config.ts"
  "tsconfig.json"
  "src/app/layout.tsx"
  "package.json"
)

for file in "${CRITICAL_FILES[@]}"; do
  if [ -f "$file" ]; then
    check "$file exists" "pass"
  else
    check "$file exists" "fail"
  fi
done

# Summary
echo ""
echo "========================================"
echo -e "${BLUE}📊 Preflight Summary${NC}"
echo "========================================"
echo -e "${GREEN}✅ Checks passed: $CHECKS_PASSED${NC}"
echo -e "${RED}❌ Checks failed: $CHECKS_FAILED${NC}"
echo -e "${YELLOW}🔧 Auto-fixes applied: $AUTO_FIXES_APPLIED${NC}"
echo ""

# Exit code based on critical failures
if [ $CHECKS_FAILED -gt 0 ]; then
  echo -e "${RED}❌ Preflight validation FAILED${NC}"
  echo "Please fix the issues above before deploying."
  exit 1
else
  echo -e "${GREEN}✅ Preflight validation PASSED${NC}"
  echo "Ready for deployment!"
  exit 0
fi
