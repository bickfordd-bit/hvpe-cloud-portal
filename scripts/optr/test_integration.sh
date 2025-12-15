#!/bin/bash
# Integration test script for OPTR trade API
# Tests the full flow from API endpoint to Python worker
#
# Prerequisites:
# - Next.js dev server running on port 3000
# - Python worker running on port 8787
# - Environment variables set:
#   - OPTR_ADMIN_KEY
#   - ALPACA_API_KEY
#   - ALPACA_API_SECRET

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="${API_URL:-http://localhost:3000/api/optr/trade}"
ADMIN_KEY="${OPTR_ADMIN_KEY:-test-key}"

echo -e "${YELLOW}OPTR Trade API Integration Test${NC}\n"

# Test 1: Missing authentication
echo -e "${YELLOW}Test 1: Missing authentication${NC}"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"AAPL","mode":"dollars","dollars":10}')

status=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$status" = "401" ]; then
  echo -e "${GREEN}✓ Correctly rejected unauthorized request${NC}\n"
else
  echo -e "${RED}✗ Expected 401, got $status${NC}"
  echo "$body"
  exit 1
fi

# Test 2: Invalid symbol
echo -e "${YELLOW}Test 2: Invalid symbol${NC}"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "x-optr-admin-key: $ADMIN_KEY" \
  -d '{"symbol":"TOOLONGSYMBOL","mode":"dollars","dollars":10}')

status=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$status" = "400" ]; then
  echo -e "${GREEN}✓ Correctly rejected invalid symbol${NC}\n"
else
  echo -e "${RED}✗ Expected 400, got $status${NC}"
  echo "$body"
  exit 1
fi

# Test 3: Shares mode without shares
echo -e "${YELLOW}Test 3: Shares mode without shares${NC}"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "x-optr-admin-key: $ADMIN_KEY" \
  -d '{"symbol":"AAPL","mode":"shares","shares":0}')

status=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$status" = "400" ]; then
  echo -e "${GREEN}✓ Correctly rejected shares mode without shares${NC}\n"
else
  echo -e "${RED}✗ Expected 400, got $status${NC}"
  echo "$body"
  exit 1
fi

# Test 4: Notional cap enforcement
echo -e "${YELLOW}Test 4: Notional cap enforcement${NC}"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "x-optr-admin-key: $ADMIN_KEY" \
  -d '{"symbol":"AAPL","mode":"dollars","dollars":100}')

status=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$status" = "400" ]; then
  echo -e "${GREEN}✓ Correctly enforced notional cap${NC}\n"
else
  echo -e "${RED}✗ Expected 400, got $status${NC}"
  echo "$body"
  exit 1
fi

# Test 5: Valid request (will fail if worker not running)
echo -e "${YELLOW}Test 5: Valid request format${NC}"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "x-optr-admin-key: $ADMIN_KEY" \
  -H "x-request-id: test-request-123" \
  -d '{"symbol":"AAPL","mode":"dollars","dollars":10}')

status=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$status" = "200" ]; then
  echo -e "${GREEN}✓ Request accepted and forwarded to worker${NC}"
  echo "Response: $body"
elif [ "$status" = "503" ]; then
  echo -e "${YELLOW}⚠ Worker unreachable (expected if not running)${NC}"
  echo "Response: $body"
else
  echo -e "${RED}✗ Unexpected status: $status${NC}"
  echo "$body"
  exit 1
fi

echo -e "\n${GREEN}Integration tests completed!${NC}"
echo -e "${YELLOW}Note: Test 5 requires the Python worker to be running to fully succeed.${NC}"
