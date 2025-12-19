#!/bin/bash
# Test Codex Sync Endpoint

set -e

CODEX_SECRET="${CODEX_WEBHOOK_SECRET}"
if [ -z "$CODEX_SECRET" ]; then
  echo "Error: CODEX_WEBHOOK_SECRET not set"
  echo "Generate one with: openssl rand -hex 32"
  exit 1
fi

API_URL="${API_URL:-http://localhost:3000}"
ENDPOINT="$API_URL/api/codex/sync"

echo "=== Testing Codex Sync ==="
echo "Endpoint: $ENDPOINT"
echo

# Test 1: Health check
echo "1. Health check..."
curl -s "$ENDPOINT" | jq .
echo

# Test 2: Preview mode
echo "2. Testing preview mode..."
curl -s -X POST "$ENDPOINT?preview=true" \
  -H "x-codex-secret: $CODEX_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "test-'$(date +%s)'",
    "description": "Test sync from script",
    "timestamp": "'$(date -Iseconds)'",
    "changes": [
      {
        "type": "create",
        "path": ".codex-test.txt",
        "content": "Test file created at '$(date)'\n"
      }
    ]
  }' | jq .
echo

# Test 3: Actual sync (commented out for safety)
echo "3. To test actual sync (creates real commit), uncomment in script"
# Uncomment below to test real sync:
# echo "Running actual sync..."
# curl -s -X POST "$ENDPOINT" \
#   -H "x-codex-secret: $CODEX_SECRET" \
#   -H "Content-Type: application/json" \
#   -d '{
#     "taskId": "test-'$(date +%s)'",
#     "description": "Test sync from script",
#     "timestamp": "'$(date -Iseconds)'",
#     "changes": [
#       {
#         "type": "create",
#         "path": ".codex-test.txt",
#         "content": "Test file created at '$(date)'\n"
#       }
#     ]
#   }' | jq .

echo "=== Tests Complete ==="
