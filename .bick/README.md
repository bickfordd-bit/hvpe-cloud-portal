# Bickford Runtime Directory

This directory contains the Bickford agent runtime state and ledger. It is structured to separate tracked documentation from gitignored execution artifacts.

## Directory Structure

```
.bick/
├── README.md              # This file (tracked in git)
├── ledger/                # Gitignored: append-only execution logs
│   └── YYYY-MM-DD/        # Date-based subdirectories
│       ├── <id1>.json     # Individual invocation records
│       ├── <id2>.json
│       └── ...
├── runs/                  # Gitignored: ephemeral run artifacts
│   └── <id>/              # Per-invocation working directory
│       ├── stdout.log
│       ├── stderr.log
│       └── artifacts/
└── canon/                 # Gitignored: cached canonical state
    ├── contracts/         # Execution contract templates
    └── schemas/           # JSON schemas for validation
```

## Purpose

### `README.md` (this file)
- **Status:** Tracked in git
- **Purpose:** Documents the structure and governance of the `.bick/` directory
- **Audience:** Developers and auditors

### `ledger/`
- **Status:** Gitignored (see `.gitignore`)
- **Purpose:** Append-only log of all Bickford agent invocations
- **Format:** JSON files organized by date
- **Governance:** See `docs/bick/CANON.md` for ledger rules

Each invocation creates a file: `.bick/ledger/YYYY-MM-DD/<id>.json`

**Example:**
```
.bick/ledger/2025-12-16/bick-20251216-192000-abc123.json
```

### `runs/`
- **Status:** Gitignored
- **Purpose:** Ephemeral working directories for active runs
- **Lifecycle:** Created on invocation start, optionally cleaned up on completion
- **Contents:** Command outputs, temporary artifacts, debug logs

### `canon/`
- **Status:** Gitignored
- **Purpose:** Cached canonical contracts, schemas, and templates
- **Lifecycle:** Populated on first run, refreshed as needed
- **Usage:** Allows offline operation and faster invocation startup

## Running the Bickford Agent

### Local Invocation
```bash
npm run bick:run -- "Your intent here"
```

This will:
1. Parse and classify your intent
2. Generate an execution contract
3. Run verification commands for the intent category
4. Create a ledger entry at `.bick/ledger/YYYY-MM-DD/<id>.json`
5. Exit with `0` on success, non-zero on failure

### GitHub Actions
Use the `bickford` workflow with manual dispatch:
1. Go to **Actions** → **bickford**
2. Click **Run workflow**
3. Enter your intent in the input field
4. Click **Run workflow**

The workflow will:
- Run `npm run bick:run -- "<your intent>"`
- Upload the ledger directory as an artifact for download

## Ledger Entry Schema

Each ledger entry contains:
- **id:** Unique identifier (e.g., `bick-20251216-192000-abc123`)
- **timestamp:** ISO 8601 timestamp
- **intent:** User-provided intent string
- **contract:** Execution contract with steps and verification commands
- **proof:** Artifacts proving each step was executed
- **result:** Summary of success/failure with exit code
- **metadata:** Agent identifier, git commit, duration, environment

**Full schema:** See `docs/bick/CANON.md`

## Verification Commands

The Bickford runtime runs verification commands based on intent classification:

| Category   | Verification Commands                          |
|------------|------------------------------------------------|
| mobile     | `npm test`, `npm run lint`, `npx expo-doctor` |
| infra      | `docker build .`, `kubectl --dry-run=client`  |
| docs       | `npx markdownlint "**/*.md"` (if configured)  |
| security   | `npm audit`, `git secrets --scan`             |
| code       | `npm run build`, `npm test`, `npm run lint`   |

**Fail-closed:** If any verification command fails, the entire invocation fails and exits with a non-zero code.

## Viewing Ledger Entries

Ledger entries are JSON files and can be inspected with:
```bash
# View the most recent ledger entry
cat .bick/ledger/$(date +%Y-%m-%d)/$(ls -t .bick/ledger/$(date +%Y-%m-%d) | head -n1)

# Pretty-print with jq
cat .bick/ledger/YYYY-MM-DD/<id>.json | jq .
```

## Governance

1. **Never delete ledger entries** – they are append-only and permanent
2. **Never commit ledger entries to git** – they are gitignored for a reason (may contain execution details)
3. **Archive old entries** – move to long-term storage, do not delete
4. **Audit regularly** – ensure all invocations are logged and verifiable

For full governance rules, see `docs/bick/CANON.md`.

## Troubleshooting

### "Ledger directory not found"
**Solution:** The `.bick/ledger/` directory is created automatically on first run. If you see this error, ensure the runtime script has write permissions.

### "Verification command failed"
**Solution:** This is expected behavior. The Bickford runtime operates in fail-closed mode. Check the ledger entry for details on which verification failed and why.

### "Intent classification failed"
**Solution:** The runtime could not determine the intent category. Try rephrasing your intent to be more specific (e.g., "Build mobile app" instead of "Do something").

## Learn More

- **Agent Contract:** `AGENTS.md` (repository root)
- **Canonical Framework:** `docs/bick/CANON.md`
- **Runtime Implementation:** `scripts/bick-runner.mjs`
- **OPTR Framework:** `docs/OPTR_MATHEMATICAL_FRAMEWORK.md`

---

**Questions?** Refer to the documentation or consult the Bickford governance team.
