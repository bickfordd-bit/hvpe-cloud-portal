# Bickford Canon

This document establishes the canonical framework for all Bickford agent operations, including OPTR/T2V selection criteria, proof rubrics, and ledger governance rules.

## OPTR/T2V Selection Statement

The Bickford ecosystem operates on the principle that **opportunities must be provable and traceable from intent to reality**. This is formalized through two complementary frameworks:

### OPTR (Opportunity-to-Reality)
**Purpose:** Analyze opportunities, score requirements, and trace execution from business intent to measurable outcomes.

**When to use OPTR:**
- Evaluating business opportunities or proposals
- Scoring requirements against capability matrices
- Generating investment or partnership decisions
- Auditing outcomes against original intent

**Key outputs:**
- Scored requirements with justification
- Execution traces with timestamps
- Metrics that demonstrate intent-to-reality alignment

**Reference:** `docs/OPTR_MATHEMATICAL_FRAMEWORK.md` and `docs/OPTR_T2V_FRAMEWORK.md`

### T2V (Text-to-Value)
**Purpose:** Convert natural language intent into executable actions, with full provenance from idea to implementation.

**When to use T2V:**
- Translating user intent into code, infrastructure, or configuration
- Automating workflows based on natural language triggers
- Generating documentation from conversational input
- Voice-to-code or chat-to-deployment scenarios

**Key outputs:**
- Executable artifacts (code, configs, manifests)
- Step-by-step execution contracts
- Verification proof at each stage

**Overlap:** OPTR and T2V are not mutually exclusive. T2V can be used to implement an OPTR-scored requirement, or OPTR can score the value of a T2V-generated implementation.

## Proof Rubric

Every Bickford agent execution must produce proof that meets the following criteria:

### 1. Authenticity
**Question:** Is the proof verifiably tied to the execution?

**Acceptable evidence:**
- Command outputs with full stderr/stdout
- API responses with status codes and headers
- File diffs with commit hashes
- Screenshots or video captures with metadata
- Third-party service logs or confirmations

**Unacceptable:**
- Anecdotal descriptions ("I ran the command and it worked")
- Unverified claims
- Proof that could be trivially faked

### 2. Completeness
**Question:** Does the proof cover every step in the execution contract?

**Requirements:**
- Each step must have corresponding proof
- Missing steps must be explicitly noted and justified
- Partial execution must be clearly marked as incomplete

### 3. Timeliness
**Question:** Was the proof captured at execution time?

**Standards:**
- All proof must include ISO 8601 timestamps
- Timestamps must be within reasonable bounds of the invocation time
- Retroactive proof is not acceptable unless explicitly justified

### 4. Machine-Readability
**Question:** Can the proof be parsed and validated programmatically?

**Preferred formats:**
- JSON for structured data
- Plain text with clear delimiters for command outputs
- Standard image formats (PNG, JPEG) with EXIF metadata

**Avoid:**
- Proprietary binary formats
- Obfuscated or encoded data without clear decoding instructions

### 5. Immutability
**Question:** Can the proof be altered after creation?

**Best practices:**
- Store proof artifacts in append-only ledgers
- Use cryptographic hashes where appropriate
- Version-control proof artifacts alongside code
- Consider signing proof with GPG or similar tools for high-security environments

## Ledger Rules

The Bickford ledger (`.bick/ledger/`) is the single source of truth for all agent activity. It must be governed by strict rules:

### Structure
````
.bick/
├── README.md              # Tracked: explains the ledger structure
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
````

### Ledger Entry Schema
Every file in `.bick/ledger/YYYY-MM-DD/<id>.json` must conform to:

```json
{
  "$schema": "https://bickford.app/schemas/ledger-entry-v1.json",
  "id": "string (unique identifier, e.g., bick-20251216-192000-abc123)",
  "timestamp": "string (ISO 8601 with timezone)",
  "intent": "string (user-provided intent)",
  "contract": {
    "steps": ["array of strings or structured step objects"],
    "specialist": "string (agent/specialist identifier)",
    "verification": ["array of verification commands"]
  },
  "proof": {
    "artifacts": [
      {
        "step": "string (which step this proves)",
        "type": "string (stdout|file|api|screenshot)",
        "content": "string or object (proof payload)",
        "timestamp": "string (ISO 8601)"
      }
    ]
  },
  "result": {
    "status": "string (success|failure|partial)",
    "summary": "string (human-readable summary)",
    "exitCode": "number (process exit code)",
    "metrics": "object (optional key-value pairs)"
  },
  "metadata": {
    "agent": "string (specialist identifier)",
    "gitCommit": "string (git SHA if applicable)",
    "duration": "string (human-readable duration)",
    "environment": "string (local|ci|production)"
  }
}
```

### Governance Policies

1. **Append-Only:**
   - Never delete or modify existing ledger entries
   - Corrections or clarifications must be new entries with references to the original

2. **Atomicity:**
   - Each ledger entry represents a single invocation
   - Multi-step workflows should create multiple entries, each with references to prior steps

3. **Accessibility:**
   - Ledger entries must be readable by both humans and machines
   - Use clear, self-documenting keys and values
   - Avoid cryptic abbreviations or internal jargon

4. **Retention:**
   - Ledger entries are permanent and must be retained indefinitely
   - For compliance, implement archival policies that move old entries to long-term storage (not deletion)

5. **Auditability:**
   - Every ledger entry must be independently auditable
   - External auditors should be able to reconstruct execution from ledger entries alone

6. **Privacy:**
   - Do not log secrets, credentials, or PII in ledger entries
   - Use placeholders (`<redacted>`) for sensitive values
   - Store secrets in secure vaults referenced by ID, not inline

## Fail-Closed Verification

All agents must implement fail-closed verification at each critical stage:

### Pre-Execution
- Validate that all required tools are available
- Confirm that prerequisites (environment variables, network access) are met
- Check for conflicts with concurrent executions

### During Execution
- After each step, verify the expected outcome before proceeding
- If verification fails, halt immediately and log the failure
- Do not attempt automatic recovery unless explicitly safe to do so

### Post-Execution
- Confirm that all expected artifacts were created
- Run smoke tests or health checks where applicable
- Record final state in the ledger with complete proof

### Exit Codes
- `0`: Success (all steps completed, all verifications passed)
- `1`: General failure (verification failed, unexpected error)
- `2`: Invalid intent (could not parse or classify intent)
- `3`: Missing prerequisites (tools, access, environment)
- `4`: Partial execution (some steps succeeded, others failed)

## Classification Framework

Bickford agents classify intents into the following categories:

| Category       | Description                                      | Example Intents                                  |
|----------------|--------------------------------------------------|--------------------------------------------------|
| **mobile**     | React Native, Expo, mobile app development       | "Build mobile app for iOS", "Run Expo tests"     |
| **infra**      | Docker, k8s, cloud deployments, CI/CD            | "Deploy to staging", "Scale production pods"     |
| **docs**       | Markdown, API docs, README updates               | "Update README with new API", "Fix broken links" |
| **security**   | Secrets, vulnerabilities, access control         | "Audit dependencies", "Rotate API keys"          |
| **code**       | TypeScript, JavaScript, application logic        | "Refactor auth module", "Add unit tests"         |

Intents that do not clearly fit a single category are classified as `general` and use a baseline set of verification commands.

## Integration with OPTR

When an intent involves evaluating an opportunity:
1. **Use OPTR framework** to score requirements
2. **Generate execution contract** based on scored requirements
3. **Apply T2V** to implement high-priority requirements
4. **Log to Bickford ledger** with full proof chain

This creates a closed-loop system where opportunities are scored, implemented, and verified—all with complete provenance.

## References

- **OPTR Mathematical Framework:** `docs/OPTR_MATHEMATICAL_FRAMEWORK.md`
- **OPTR T2V Framework:** `docs/OPTR_T2V_FRAMEWORK.md`
- **Agent Contract:** `AGENTS.md` (repository root)
- **Bickford Runtime:** `scripts/bick-runner.mjs`
- **Ledger Structure:** `.bick/README.md`

---

**This canon is authoritative and supersedes any conflicting guidance.**

For questions or proposed amendments, consult the Bickford governance team.
