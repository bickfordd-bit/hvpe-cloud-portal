# BCS_BALANCED - Billionaire Confidence Score

## Overview

BCS_BALANCED is a **computed, evidence-gated, and automatic** scoring system that measures progress toward billionaire-level success through a combination of internal execution signals and external validation proofs.

The system follows these core principles:
- **Append-only ledger**: Events are never modified or deleted
- **Deterministic scoring**: Same inputs always produce same outputs
- **Evidence-gated**: Internal progress is capped by external validation
- **Automatic**: No manual scoring or subjective judgment

## Formula

```
BCS = 100 × (BCS_model × EvidenceWeight)
```

Where:

### BCS_model (0-1)
Internal execution model computed from ESCLT vectors:

```
BCS_model = E^wE × S^wS × C^wC × L^wL × T^wT
```

**Vectors:**
- **E** (Execution): Closure rate + proof rate
- **S** (Scalability): Count of scalable artifacts (normalized)
- **C** (Control): External milestones achieved (normalized)
- **L** (Leverage): Combination of scalability and control
- **T** (Time sustainability): Burden trend + time-to-value

**Default Weights:** (sum to 1.0)
- wE = 0.30
- wS = 0.20
- wC = 0.20
- wL = 0.15
- wT = 0.15

### EvidenceWeight (0-1)
External validation ladder (max-of approach):

| Level | Score | Criteria |
|-------|-------|----------|
| none | 0.0 | No events recorded |
| minimal | 0.1 | Has declared intents |
| proof-of-concept | 0.3 | Has external milestones or attached proof |
| validated | 0.5 | Has externally verified outcomes |
| business | 0.7 | Has received payment |
| critical | 1.0 | Has recurring revenue stream |

## Event Types

### intent.created
Declare a new goal or intention.

```json
{
  "id": "unique-id",
  "type": "intent.created",
  "timestamp": "2025-12-16T10:00:00Z",
  "intentId": "intent-001",
  "description": "Launch iOS app to App Store",
  "category": "product-launch"
}
```

### intent.closed
Mark an intent as completed or abandoned.

```json
{
  "id": "unique-id",
  "type": "intent.closed",
  "timestamp": "2025-12-20T15:30:00Z",
  "intentId": "intent-001",
  "outcome": "completed",
  "completionNotes": "App approved and live"
}
```

### proof.attached
Attach evidence to a deliverable.

```json
{
  "id": "unique-id",
  "type": "proof.attached",
  "timestamp": "2025-12-18T12:00:00Z",
  "relatedId": "intent-001",
  "proofType": "link",
  "proofUrl": "https://apps.apple.com/app/myapp",
  "description": "App Store listing screenshot"
}
```

### outcome.verified
External validation of a result.

```json
{
  "id": "unique-id",
  "type": "outcome.verified",
  "timestamp": "2025-12-21T09:00:00Z",
  "intentId": "intent-001",
  "verifiedBy": "customer",
  "verificationNotes": "First customer signup without founder involvement",
  "impact": "Product demonstrated independent viability"
}
```

### milestone.external
Public/external milestone reached.

```json
{
  "id": "unique-id",
  "type": "milestone.external",
  "timestamp": "2025-12-20T14:00:00Z",
  "milestoneType": "app-store-approval",
  "platform": "iOS",
  "description": "Bickford app approved by Apple",
  "verificationUrl": "https://apps.apple.com/app/bickford"
}
```

### revenue.received
Actual payment received.

```json
{
  "id": "unique-id",
  "type": "revenue.received",
  "timestamp": "2025-12-22T10:00:00Z",
  "amount": 99.00,
  "currency": "USD",
  "source": "customer-stripe",
  "recurring": true,
  "invoiceId": "inv_123456"
}
```

### burden.reported
Self-reported stress/burden level (0-10 scale).

```json
{
  "id": "unique-id",
  "type": "burden.reported",
  "timestamp": "2025-12-16T08:00:00Z",
  "burdenLevel": 6,
  "categories": ["technical-debt", "support-load"],
  "notes": "Increased support requests"
}
```

### artifact.shipped
Scalable asset delivered.

```json
{
  "id": "unique-id",
  "type": "artifact.shipped",
  "timestamp": "2025-12-17T16:00:00Z",
  "artifactType": "automation",
  "description": "Automated deployment pipeline",
  "reusable": true,
  "userFacing": false
}
```

## Recording Events

Events are stored in `.bick/ledger/YYYY-MM-DD/<id>.json` format.

### Manual Recording
Create a JSON file with the event structure and save it to the appropriate date directory:

```bash
# Example: record an intent
mkdir -p .bick/ledger/2025-12-16
cat > .bick/ledger/2025-12-16/evt-001.json << 'EOF'
{
  "id": "evt-001",
  "type": "intent.created",
  "timestamp": "2025-12-16T10:00:00Z",
  "intentId": "intent-001",
  "description": "Implement BCS_BALANCED system"
}
EOF
```

### Programmatic Recording
Use the ledger API:

```typescript
import { writeEvent } from '@/lib/bick/ledger';

writeEvent({
  id: 'evt-001',
  type: 'intent.created',
  timestamp: new Date().toISOString(),
  intentId: 'intent-001',
  description: 'Implement BCS_BALANCED system',
});
```

## Running the Scorer

### Command Line
```bash
npm run bick:score
```

This will:
1. Read all events from `.bick/ledger/`
2. Compute submetrics from events
3. Calculate ESCLT vectors
4. Compute BCS_model and EvidenceWeight
5. Output JSON to stdout
6. Write `.bick/canon/bcs-latest.json`
7. Append to `.bick/canon/bcs-history.jsonl`

### Output Format
```json
{
  "timestamp": "2025-12-16T19:30:00.000Z",
  "version": "1.0.0",
  "BCS": 15.5,
  "BCS_model": 0.310,
  "EvidenceWeight": 0.5,
  "vectors": {
    "E": 0.45,
    "S": 0.30,
    "C": 0.20,
    "L": 0.25,
    "T": 0.60
  },
  "weights": {
    "wE": 0.30,
    "wS": 0.20,
    "wC": 0.20,
    "wL": 0.15,
    "wT": 0.15
  },
  "submetrics": {
    "closureRate": 0.67,
    "proofRate": 0.33,
    "t2vScore": 0.80,
    "burdenTrend": 0.45,
    "scalableArtifacts": 3,
    "externalMilestones": 1
  },
  "evidenceBreakdown": {
    "level": "validated",
    "score": 0.5,
    "reason": "Has externally verified outcomes",
    "supportingEvents": ["evt-005", "evt-007"]
  },
  "eventCounts": {
    "intent.created": 6,
    "intent.closed": 4,
    "proof.attached": 3,
    "outcome.verified": 2,
    "milestone.external": 1,
    "revenue.received": 0,
    "burden.reported": 5,
    "artifact.shipped": 3
  },
  "totalEvents": 24,
  "ledgerPath": "/path/to/.bick/ledger",
  "computedBy": "bick:score"
}
```

## Interpreting Results

### BCS Score Ranges
- **0-10**: Early stage, minimal validation
- **10-30**: Proof-of-concept with some external validation
- **30-50**: Validated business with customer proof
- **50-70**: Revenue-generating with recurring customers
- **70-100**: Critical infrastructure-level validation

### Key Insights

**BCS vs BCS_model Gap**
- Large gap = Good internal execution, needs more external validation
- Small gap = External validation matches internal progress
- Example: BCS=15.5, BCS_model=0.31 (31%) → Evidence level is limiting factor

**Vector Analysis**
- Low E (Execution) = Poor closure/proof rates, focus on finishing
- Low S (Scalability) = Need more reusable artifacts
- Low C (Control) = Need external milestones/validation
- Low L (Leverage) = Not building compound advantages
- Low T (Time) = Unsustainable pace or poor time-to-value

**Evidence Level**
- Stuck at "minimal"? → Need external milestones or proof attachments
- Stuck at "proof-of-concept"? → Need verified outcomes from third parties
- Stuck at "validated"? → Need revenue
- Stuck at "business"? → Need recurring revenue

## Submetric Definitions

### Closure Rate
```
closureRate = intent.closed / intent.created
```
Measures follow-through on declared intentions.

### Proof Rate
```
proofRate = outcome.verified / (intent.closed + outcome.verified)
```
Measures how often claims have external verification.

### T2V Score (Time to Value)
Average time from `intent.created` to `outcome.verified` or `intent.closed`:
- < 1 day: 1.0
- 1-7 days: 0.8
- 7-30 days: 0.6
- 30-90 days: 0.4
- > 90 days: 0.2

### Burden Trend
7-day change in `burden.reported` levels:
- Decreasing burden = higher score
- Stable burden = 0.5
- Increasing burden = lower score

### Scalable Artifacts
Count of `artifact.shipped` events where `reusable=true`.

### External Milestones
Count of `milestone.external` events.

## Automation

### GitHub Actions
A workflow runs daily to compute BCS automatically:

```yaml
# .github/workflows/bick-score.yml
on:
  workflow_dispatch:
  schedule:
    - cron: '0 0 * * *' # Daily at midnight UTC
```

The workflow:
1. Checks out the repository
2. Sets up Node.js 20
3. Runs `npm ci` to install dependencies
4. Executes `npm run bick:score`
5. Uploads `.bick/canon/` as artifacts

### Manual Trigger
You can manually trigger scoring via GitHub Actions UI or:

```bash
gh workflow run bick-score.yml
```

## Best Practices

### Event Recording
1. **Be specific**: Include detailed descriptions and context
2. **Timestamp accurately**: Use actual event time, not recording time
3. **Link related events**: Use intentId to connect creation → closure → verification
4. **Attach proof**: External links, measurements, screenshots
5. **Record burden regularly**: Weekly tracking provides best trend data

### Score Interpretation
1. **Look at the gap**: BCS vs BCS_model shows what's limiting
2. **Check evidence level**: What's the next ladder rung?
3. **Review vectors**: Which ESCLT dimension needs focus?
4. **Track trends**: Use bcs-history.jsonl to see progress over time
5. **Don't game it**: The system rewards real progress, not artificial events

### Development Workflow
1. Declare intents when starting work
2. Ship artifacts with reusable flag
3. Close intents with proof attachments
4. Get external verification when possible
5. Record burden weekly
6. Run scorer regularly to track progress

## Troubleshooting

### Empty ledger produces low score
Expected behavior. With no events:
- BCS = 0.0
- EvidenceWeight = 0.0 (level: none)
- All vectors initialized to safe minimums (0.01)

### Score not changing
Check:
1. Are new events in correct date directory?
2. Are JSON files well-formed?
3. Are event types spelled correctly?
4. Did you run `npm run bick:score` after adding events?

### Unexpected score calculation
The scorer is deterministic. Check:
1. Review event counts in output
2. Check submetrics values
3. Review vector computation logic
4. Verify evidence ladder logic
5. Check weights sum to 1.0

### Build errors
Ensure:
- `tsx` is installed (`npm ci`)
- TypeScript compiles without errors
- No circular dependencies in bick module

## Examples

See `.bick/README.md` for system overview and example directory structure.

For sample event workflows and scoring scenarios, see the test suite at `src/lib/bick/__tests__/scorer.test.ts`.

## Mathematical Framework

BCS_BALANCED uses a compound product formula for BCS_model to ensure all dimensions must be present for high scores. This prevents gaming the system by maxing one dimension while ignoring others.

The evidence ladder uses a max-of approach rather than averaging, reflecting that a single strong proof (e.g., recurring revenue) is more valuable than many weak signals.

The final multiplication (BCS_model × EvidenceWeight) implements hard gating: internal progress cannot produce high headline scores without external validation.

## Version History

- **1.0.0** (2025-12-16): Initial implementation
  - Core ESCLT vector computation
  - Evidence ladder with 6 levels
  - Append-only ledger with date-based directories
  - CLI scorer with JSON output
  - GitHub Actions workflow
