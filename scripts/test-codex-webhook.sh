#!/bin/bash
# Test Codex webhook integration
# Usage: ./scripts/test-codex-webhook.sh [local|staging|production]

set -e

ENV="${1:-local}"
WEBHOOK_SECRET="d38c9f08d6b06e76efd600998fd765202efaabc109d09d2b8ad7728f4b93b12a"

case "$ENV" in
  local)
    BASE_URL="http://localhost:3000"
    ;;
  staging)
    BASE_URL="https://hvpe-cloud-portal-staging.vercel.app"
    ;;
  production)
    BASE_URL="https://hvpe-cloud-portal.vercel.app"
    ;;
  *)
    echo "Usage: $0 [local|staging|production]"
    exit 1
    ;;
esac

WEBHOOK_URL="${BASE_URL}/api/codex/sync"

echo "🔧 Testing Codex Webhook: $WEBHOOK_URL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test 1: Health check
echo -e "\n✓ Test 1: Endpoint exists (GET should fail gracefully)"
curl -s "$WEBHOOK_URL" | jq '.' || echo "Expected: GET not allowed"

# Test 2: Authentication failure
echo -e "\n✓ Test 2: Authentication (wrong secret should fail)"
curl -s -X POST "$WEBHOOK_URL?preview=true" \
  -H "x-codex-secret: wrong-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "test-auth",
    "description": "Auth test",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
    "changes": []
  }' | jq '.'

# Test 3: Authentication success (preview mode)
echo -e "\n✓ Test 3: Authentication success (preview mode - no changes)"
curl -s -X POST "$WEBHOOK_URL?preview=true" \
  -H "x-codex-secret: $WEBHOOK_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "test-preview",
    "description": "Preview mode test",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
    "changes": []
  }' | jq '.'

# Test 4: Real task simulation (only if local)
if [ "$ENV" = "local" ]; then
  echo -e "\n✓ Test 4: Simulated task (creates test file)"
  curl -s -X POST "$WEBHOOK_URL" \
    -H "x-codex-secret: $WEBHOOK_SECRET" \
    -H "Content-Type: application/json" \
    -d '{
      "taskId": "test-'$(date +%s)'",
      "description": "Automated webhook test",
      "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
      "changes": [
        {
          "type": "create",
          "path": "test-codex-webhook.txt",
          "content": "This file was created by Codex webhook test at '$(date)'\n",
          "encoding": "utf-8"
        }
      ],
      "metadata": {
        "source": "webhook-test-script",
        "agent": "test-runner",
        "priority": "low"
      }
    }' | jq '.'
  
  echo -e "\n✓ Check if test file was created:"
  ls -lh test-codex-webhook.txt 2>&1 || echo "File not found (expected if preview mode)"
fi

echo -e "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Webhook tests complete!"
echo ""
echo "Next steps:"
echo "  1. If local: Start dev server with 'npm run dev'"
echo "  2. If staging/production: Deploy with 'vercel --prod'"
echo "  3. Configure Codex to use: $WEBHOOK_URL"
echo "  4. Set header: x-codex-secret: $WEBHOOK_SECRET"
