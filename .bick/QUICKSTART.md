# BCS_BALANCED Quick Start

## Running the Scorer
```bash
npm run bick:score
```

## Recording Events

### 1. Intent Created
```bash
mkdir -p .bick/ledger/$(date +%Y-%m-%d)
cat > .bick/ledger/$(date +%Y-%m-%d)/evt-$(date +%s).json << 'END'
{
  "id": "evt-$(date +%s)",
  "type": "intent.created",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "intentId": "my-intent-id",
  "description": "What you're doing"
}
END
```

### 2. Intent Closed
```bash
cat > .bick/ledger/$(date +%Y-%m-%d)/evt-$(date +%s).json << 'END'
{
  "id": "evt-$(date +%s)",
  "type": "intent.closed",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "intentId": "my-intent-id",
  "outcome": "completed"
}
END
```

### 3. External Milestone
```bash
cat > .bick/ledger/$(date +%Y-%m-%d)/evt-$(date +%s).json << 'END'
{
  "id": "evt-$(date +%s)",
  "type": "milestone.external",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "milestoneType": "app-store-approval",
  "description": "iOS app approved",
  "verificationUrl": "https://apps.apple.com/..."
}
END
```

### 4. Revenue Received
```bash
cat > .bick/ledger/$(date +%Y-%m-%d)/evt-$(date +%s).json << 'END'
{
  "id": "evt-$(date +%s)",
  "type": "revenue.received",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "amount": 99.00,
  "currency": "USD",
  "source": "customer-stripe",
  "recurring": true
}
END
```

## Evidence Ladder Progression

| Evidence Level | Score | What You Need |
|----------------|-------|---------------|
| none | 0.0 | No events |
| minimal | 0.1 | Create intents |
| proof-of-concept | 0.3 | External milestone or proof |
| validated | 0.5 | Third-party verification |
| business | 0.7 | Revenue received |
| critical | 1.0 | Recurring revenue |

## Score Interpretation

**BCS Score = 100 × (BCS_model × EvidenceWeight)**

Example: BCS=30.37 with Model=30.37%, Evidence=100% (critical)
- Internal execution: 30.37% (room to improve)
- External validation: 100% (maximum)
- Headline score: 30.37 (gated by model, not evidence)

## Full Documentation

See `docs/bick/BCS.md` for complete documentation.
