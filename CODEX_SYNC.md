# Codex Sync Automation

Automates push/pull workflow: Codex completes task → changes sent here → auto-executed → committed → pushed to GitHub.

## Setup

### 1. Generate Webhook Secret

```bash
# Generate a secure secret
openssl rand -hex 32

# Or use:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Configure Environment

Add to `.env.local`:

```bash
CODEX_WEBHOOK_SECRET=your_generated_secret_here
```

### 3. Test Endpoint

```bash
# Health check
curl http://localhost:3000/api/codex/sync

# Should return:
# {
#   "success": true,
#   "data": {
#     "status": "online",
#     "configured": true,
#     "endpoint": "/api/codex/sync"
#   }
# }
```

## Usage

### From Codex

Configure Codex to send completed tasks to:

```
POST https://your-domain.com/api/codex/sync
Headers:
  x-codex-secret: your_webhook_secret
  Content-Type: application/json

Body:
{
  "taskId": "unique-task-id",
  "description": "Add user authentication feature",
  "timestamp": "2025-12-19T12:00:00Z",
  "changes": [
    {
      "type": "create",
      "path": "src/lib/auth.ts",
      "content": "export function authenticate() { ... }"
    },
    {
      "type": "modify",
      "path": "src/app/api/users/route.ts",
      "content": "import { authenticate } from '@/lib/auth'; ..."
    },
    {
      "type": "delete",
      "path": "old-file.ts"
    }
  ],
  "metadata": {
    "agent": "codex-v2",
    "session": "abc123"
  }
}
```

### Preview Mode

Test changes without applying:

```bash
curl -X POST http://localhost:3000/api/codex/sync?preview=true \
  -H "x-codex-secret: $CODEX_WEBHOOK_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "test-123",
    "description": "Test task",
    "timestamp": "2025-12-19T12:00:00Z",
    "changes": [
      {
        "type": "create",
        "path": "test.txt",
        "content": "Hello World"
      }
    ]
  }'
```

## Workflow

When Codex sends a task:

1. **Authentication** - Verifies `x-codex-secret` header
2. **Pull** - `git pull --rebase origin mobile`
3. **Apply** - Writes/modifies/deletes files per `changes` array
4. **Stage** - `git add` all modified files
5. **Commit** - Creates commit with task description
6. **Push** - `git push origin mobile`
7. **Ledger** - Records sync in `.bick/ledger/` with proof

## Response

Success:

```json
{
  "success": true,
  "data": {
    "message": "Codex changes synced successfully",
    "commitSha": "abc123",
    "filesChanged": 3,
    "proof": {
      "commit": "abc123",
      "pushed": true,
      "ledgerEntryId": "codex-sync-test-123-1234567890"
    }
  }
}
```

Failure:

```json
{
  "success": false,
  "error": "Git merge conflict",
  "data": {
    "filesChanged": 0,
    "proof": {
      "pushed": false,
      "ledgerEntryId": "codex-sync-test-123-1234567890-failure"
    }
  }
}
```

## GitHub Actions Integration (Optional)

Create `.github/workflows/codex-sync.yml` for server-side automation:

```yaml
name: Codex Sync Trigger

on:
  repository_dispatch:
    types: [codex-task-complete]

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Call Codex Sync API
        env:
          CODEX_SECRET: ${{ secrets.CODEX_WEBHOOK_SECRET }}
        run: |
          curl -X POST ${{ secrets.APP_URL }}/api/codex/sync \
            -H "x-codex-secret: $CODEX_SECRET" \
            -H "Content-Type: application/json" \
            -d '${{ toJson(github.event.client_payload) }}'
```

## Security

- **Required**: `CODEX_WEBHOOK_SECRET` environment variable
- **Authentication**: `x-codex-secret` header must match secret
- **Rate Limiting**: Consider adding rate limits in production
- **IP Whitelist**: Optionally restrict to Codex IPs
- **Validation**: All changes validated before git operations

## Ledger

All sync operations logged to `.bick/ledger/YYYY-MM-DD/`:

```json
{
  "id": "codex-sync-task-123-1234567890",
  "ts": "2025-12-19T12:00:00Z",
  "kind": "codex-sync",
  "subject": "task-123",
  "payload": {
    "description": "Add user authentication",
    "filesChanged": 3,
    "files": ["src/lib/auth.ts", "..."],
    "commitSha": "abc123",
    "duration": 5432
  },
  "hash": "sha256:...",
  "parentId": "previous-entry"
}
```

## Troubleshooting

### "Unauthorized" Error

- Check `CODEX_WEBHOOK_SECRET` is set
- Verify `x-codex-secret` header matches secret
- Restart dev server after setting env var

### Git Conflicts

- Sync service uses `git pull --rebase`
- If conflicts occur, manual resolution required
- Check logs: sync will fail and record to ledger

### Missing Files

- Ensure `path` is relative to repo root
- Service auto-creates directories
- Check file permissions

### Push Rejected

- Remote may have new commits
- Sync pulls before pushing
- Check branch protection rules

## Example Codex Configuration

In your Codex settings/config:

```json
{
  "webhooks": {
    "onTaskComplete": {
      "url": "https://hvpe-cloud-portal.vercel.app/api/codex/sync",
      "headers": {
        "x-codex-secret": "${CODEX_WEBHOOK_SECRET}"
      },
      "method": "POST",
      "body": {
        "taskId": "${TASK_ID}",
        "description": "${TASK_DESCRIPTION}",
        "timestamp": "${TIMESTAMP}",
        "changes": "${CHANGES}",
        "metadata": {
          "agent": "codex",
          "session": "${SESSION_ID}"
        }
      }
    }
  }
}
```

## Testing

Test the full flow:

```bash
# 1. Start dev server
npm run dev

# 2. In another terminal, send test task
./scripts/test-codex-sync.sh

# 3. Check commit was created
git log -1

# 4. Check ledger entry
ls -la .bick/ledger/$(date +%Y-%m-%d)/
```

## Verification Commands

```bash
# Check endpoint is live
curl http://localhost:3000/api/codex/sync

# Preview a change
curl -X POST http://localhost:3000/api/codex/sync?preview=true \
  -H "x-codex-secret: $CODEX_WEBHOOK_SECRET" \
  -H "Content-Type: application/json" \
  -d @test-task.json

# View recent syncs
cat .bick/ledger/$(date +%Y-%m-%d)/codex-sync-*.json | jq .
```
