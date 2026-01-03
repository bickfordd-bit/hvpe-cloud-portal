#!/bin/bash

# verify-deployment.sh - Post-deployment smoke tests and verification
# Validates that the deployment is healthy and accessible

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MAX_WAIT_TIME=60  # Maximum time to wait for deployment to be ready
CHECK_INTERVAL=5  # Seconds between checks

# Get deployment URL
DEPLOYMENT_URL="${1:-}"

# Try to read from file if not provided
if [ -z "$DEPLOYMENT_URL" ] && [ -f "/tmp/deployment-url.txt" ]; then
  DEPLOYMENT_URL=$(cat /tmp/deployment-url.txt)
fi

# Try to read from environment variable
if [ -z "$DEPLOYMENT_URL" ]; then
  DEPLOYMENT_URL="$VERCEL_DEPLOYMENT_URL"
fi

if [ -z "$DEPLOYMENT_URL" ]; then
  echo -e "${RED}❌ No deployment URL provided${NC}"
  echo "Usage: $0 <deployment-url>"
  echo "Or set DEPLOYMENT_URL environment variable"
  exit 1
fi

echo "========================================"
echo -e "${BLUE}🔍 Deployment Verification${NC}"
echo "========================================"
echo -e "URL: ${BLUE}$DEPLOYMENT_URL${NC}"
echo ""

# Counters
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_SKIPPED=0

# Test function
test_endpoint() {
  local name="$1"
  local path="$2"
  local expected_status="${3:-200}"
  local timeout="${4:-10}"
  
  local url="$DEPLOYMENT_URL$path"
  local status_code
  
  echo -ne "Testing $name... "
  
  # Make request with timeout
  status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time "$timeout" "$url" || echo "000")
  
  if [ "$status_code" = "$expected_status" ]; then
    echo -e "${GREEN}✅ PASS (HTTP $status_code)${NC}"
    ((TESTS_PASSED++))
    return 0
  elif [ "$status_code" = "000" ]; then
    echo -e "${RED}❌ FAIL (Timeout or connection error)${NC}"
    ((TESTS_FAILED++))
    return 1
  else
    echo -e "${YELLOW}⚠️  UNEXPECTED (HTTP $status_code, expected $expected_status)${NC}"
    ((TESTS_FAILED++))
    return 1
  fi
}

# Optional test (doesn't fail the build)
test_endpoint_optional() {
  local name="$1"
  local path="$2"
  local expected_status="${3:-200}"
  local timeout="${4:-10}"
  
  local url="$DEPLOYMENT_URL$path"
  local status_code
  
  echo -ne "Testing $name... "
  
  status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time "$timeout" "$url" || echo "000")
  
  if [ "$status_code" = "$expected_status" ]; then
    echo -e "${GREEN}✅ PASS (HTTP $status_code)${NC}"
    ((TESTS_PASSED++))
    return 0
  else
    echo -e "${YELLOW}⚠️  SKIPPED (HTTP $status_code, expected $expected_status - optional)${NC}"
    ((TESTS_SKIPPED++))
    return 0
  fi
}

# 1. Wait for deployment to be ready
echo "1️⃣  Waiting for deployment to be ready..."
elapsed=0
ready=false

while [ $elapsed -lt $MAX_WAIT_TIME ]; do
  if curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$DEPLOYMENT_URL" | grep -q "200\|301\|302\|404"; then
    ready=true
    break
  fi
  
  sleep $CHECK_INTERVAL
  elapsed=$((elapsed + CHECK_INTERVAL))
  echo -ne "  Waiting... ${elapsed}s/${MAX_WAIT_TIME}s\r"
done

echo ""

if [ "$ready" = true ]; then
  echo -e "${GREEN}✅ Deployment is responding${NC}"
  ((TESTS_PASSED++))
else
  echo -e "${RED}❌ Deployment not responding after ${MAX_WAIT_TIME}s${NC}"
  ((TESTS_FAILED++))
  exit 1
fi

echo ""

# 2. Test critical endpoints
echo "2️⃣  Testing Critical Endpoints..."
test_endpoint "Homepage" "/" "200"
test_endpoint "Health Check" "/api/health" "200"

echo ""

# 3. Test API endpoints (optional - may require auth)
echo "3️⃣  Testing API Endpoints..."
test_endpoint_optional "Lock Status API" "/api/lock/status" "200"
test_endpoint_optional "Bickford API" "/api/bickford" "200"

echo ""

# 4. Test static assets
echo "4️⃣  Testing Static Assets..."
test_endpoint_optional "Favicon" "/favicon.ico" "200"

echo ""

# 5. Response time check
echo "5️⃣  Testing Response Time..."
echo -ne "Measuring response time... "

response_time=$(curl -s -o /dev/null -w "%{time_total}" --max-time 10 "$DEPLOYMENT_URL" || echo "999")

# Convert to milliseconds
response_time_ms=$(echo "$response_time * 1000" | bc | cut -d'.' -f1)

if [ "$response_time_ms" -lt 5000 ]; then
  echo -e "${GREEN}✅ PASS (${response_time_ms}ms)${NC}"
  ((TESTS_PASSED++))
elif [ "$response_time_ms" -lt 10000 ]; then
  echo -e "${YELLOW}⚠️  SLOW (${response_time_ms}ms)${NC}"
  ((TESTS_PASSED++))
else
  echo -e "${RED}❌ TOO SLOW (${response_time_ms}ms)${NC}"
  ((TESTS_FAILED++))
fi

echo ""

# 6. SSL/TLS check
echo "6️⃣  Testing SSL/TLS..."
if echo "$DEPLOYMENT_URL" | grep -q "https://"; then
  echo -ne "Checking SSL certificate... "
  
  hostname=$(echo "$DEPLOYMENT_URL" | sed 's|https://||' | cut -d'/' -f1)
  
  if echo | openssl s_client -connect "$hostname:443" -servername "$hostname" 2>&1 | grep -q "Verify return code: 0"; then
    echo -e "${GREEN}✅ PASS (Valid SSL certificate)${NC}"
    ((TESTS_PASSED++))
  else
    echo -e "${YELLOW}⚠️  WARNING (SSL verification issue - may be expected for some providers)${NC}"
    ((TESTS_SKIPPED++))
  fi
else
  echo -e "${YELLOW}⚠️  SKIPPED (Not HTTPS)${NC}"
  ((TESTS_SKIPPED++))
fi

echo ""

# 7. Check for common errors in response
echo "7️⃣  Checking Response Content..."
echo -ne "Checking for error indicators... "

response_body=$(curl -s "$DEPLOYMENT_URL" || echo "")

if echo "$response_body" | grep -iq "error\|exception\|cannot\|failed\|not found" | head -1; then
  echo -e "${YELLOW}⚠️  WARNING (Potential error in response)${NC}"
  echo "Response snippet:"
  echo "$response_body" | grep -i "error\|exception\|cannot\|failed" | head -3
  ((TESTS_SKIPPED++))
else
  echo -e "${GREEN}✅ PASS (No obvious errors)${NC}"
  ((TESTS_PASSED++))
fi

echo ""

# Summary
echo "========================================"
echo -e "${BLUE}📊 Verification Summary${NC}"
echo "========================================"
echo -e "${GREEN}✅ Tests passed: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Tests failed: $TESTS_FAILED${NC}"
echo -e "${YELLOW}⚠️  Tests skipped: $TESTS_SKIPPED${NC}"
echo ""
echo -e "Deployment URL: ${BLUE}$DEPLOYMENT_URL${NC}"
echo ""

# Exit based on results
if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ Deployment verification PASSED${NC}"
  echo "Deployment is healthy and ready!"
  exit 0
else
  echo -e "${RED}❌ Deployment verification FAILED${NC}"
  echo "Please check the failed tests above."
  exit 1
fi
