# Bickford Specialist Contract

## Prime Directive

**"If it can't be proven, it doesn't exist."**

All agents and specialists operating within the Bickford ecosystem must adhere to a single, deterministic contract that ensures every action is traceable, verifiable, and accountable.

## Required Output Format

Every agent invocation must produce output in the following five-stage structure:

### 1. Intent
**What is being requested?**

A clear, unambiguous statement of the user's goal or desired outcome. The intent must be:
- Specific and actionable
- Free from implementation details
- Verifiable upon completion

**Example:**
```
"Deploy mobile app to staging environment for user acceptance testing."
```

### 2. Execution Contract
**How will it be accomplished?**

A deterministic plan that specifies:
- The sequence of operations to be performed
- The tools, systems, and resources required
- Success criteria for each step
- Rollback procedures in case of failure

**Example:**
````
1. Validate mobile build passes all tests
2. Create staging deployment manifest
3. Deploy to staging cluster
4. Run smoke tests on staging endpoint
5. Notify stakeholders via configured channels
````

### 3. Proof
**Evidence that the execution occurred as specified.**

Concrete, verifiable artifacts that demonstrate each step of the execution contract was completed. Acceptable proof includes:
- Command outputs with timestamps
- API response logs
- File system changes (diffs, hashes)
- Test results
- Screenshots or recordings
- Third-party service confirmations

**Proof must be:**
- Timestamped
- Immutable (or cryptographically signed)
- Machine-parseable where possible

**Example:**
```json
{
  "step": "1. Validate mobile build",
  "timestamp": "2025-12-16T19:20:00Z",
  "command": "npm test",
  "exitCode": 0,
  "output": "All tests passed (24/24)",
  "hash": "sha256:abc123..."
}
```

### 4. Result
**What was the outcome?**

A summary of the final state after execution:
- Success or failure status
- Key metrics or outputs
- Any deviations from the execution contract
- Links to relevant artifacts or dashboards

**Example:**
```
✓ Mobile app successfully deployed to staging
  - Build: v1.2.3-rc.4
  - Endpoint: https://staging.bickford.app
  - Smoke tests: 12/12 passed
  - Deployment time: 3m 42s
```

### 5. Ledger
**Permanent, append-only record.**

Every invocation must append an entry to the ledger at `.bick/ledger/YYYY-MM-DD/<id>.json`. The ledger entry must contain:
- Unique invocation ID
- Timestamp (ISO 8601)
- Intent (as specified by user)
- Execution contract (as executed)
- Proof artifacts (or references)
- Result summary
- Agent/specialist identifier
- Git commit hash (if applicable)

**Ledger entry schema:**
```json
{
  "id": "bick-20251216-192000-abc123",
  "timestamp": "2025-12-16T19:20:00Z",
  "intent": "Deploy mobile app to staging environment",
  "contract": { "steps": [...] },
  "proof": { "artifacts": [...] },
  "result": { "status": "success", "summary": "..." },
  "agent": "mobile-deploy-specialist",
  "gitCommit": "a1b2c3d4",
  "duration": "3m 42s"
}
```

## Fail-Closed Behavior

All agents must operate in a **fail-closed** posture:

1. **Pre-flight checks:** Before executing any action, validate that all prerequisites are met.
2. **Verification gates:** After each critical step, verify success before proceeding.
3. **Abort on failure:** If any verification fails, halt execution immediately and do not proceed to subsequent steps.
4. **Non-zero exit:** Failed executions must return a non-zero exit code.
5. **Ledger entry:** Even failures must be logged to the ledger with complete proof of what was attempted and why it failed.

**No silent failures. No assumptions. No "best effort."**

## Bickford Specialists

The following specialists are available within the Bickford ecosystem. Each specialist is responsible for a specific domain and must adhere to this contract.

### Mobile Specialist
**Domain:** React Native, Expo, mobile app builds and deployments
**Verification commands:**
- `npm test` (unit tests)
- `npm run lint` (code quality)
- `npx expo-doctor` (Expo configuration validation)

### Infrastructure Specialist
**Domain:** Docker, Kubernetes, cloud deployments, CI/CD pipelines
**Verification commands:**
- `docker build .` (containerization)
- `kubectl --dry-run=client apply -f k8s/` (manifest validation)
- GitHub Actions workflow syntax check

### Documentation Specialist
**Domain:** Markdown files, API documentation, README updates
**Verification commands:**
- `npx markdownlint "**/*.md"` (if configured)
- Link validation
- Spelling and grammar checks (if tooling available)

### Security Specialist
**Domain:** Secrets management, vulnerability scanning, access control
**Verification commands:**
- `npm audit` (dependency vulnerabilities)
- `git secrets --scan` (if configured)
- Environment variable validation

### Code Specialist
**Domain:** TypeScript, JavaScript, application logic
**Verification commands:**
- `npm run build` (compilation check)
- `npm test` (unit/integration tests)
- `npm run lint` (linting)

## Integration with CI/CD

The Bickford runtime is designed to work both locally and in GitHub Actions:

**Local invocation:**
```bash
npm run bick:run -- "Your intent here"
```

**GitHub Actions dispatch:**
Use the `bickford` workflow with manual dispatch, providing the intent as input.

All invocations—whether local or CI—produce identical ledger entries, ensuring full traceability across environments.

## Governance

1. **Ledger is append-only:** Never delete or modify existing ledger entries.
2. **Proof is mandatory:** Every execution must provide verifiable proof.
3. **No execution without intent:** All actions must originate from an explicit user intent.
4. **Verification is non-negotiable:** Fail-closed verification gates cannot be bypassed.
5. **Canonical documentation:** See `docs/bick/CANON.md` for the proof rubric and OPTR/T2V framework references.

---

**For questions or clarifications, refer to `docs/bick/CANON.md` or consult the Bickford governance team.**
