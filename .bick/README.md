# Bickford Confidence Score (BCS) System

This directory contains the BCS_BALANCED scoring system implementation.

## Directory Structure

```
.bick/
├── README.md          # This file (tracked in git)
├── ledger/            # Append-only event ledger (gitignored)
│   └── YYYY-MM-DD/    # Daily event subdirectories
│       └── <id>.json  # Individual event files
└── canon/             # Computed outputs (gitignored)
    ├── bcs-latest.json    # Latest BCS score snapshot
    └── bcs-history.jsonl  # Historical scores (append-only)
```

## What is BCS_BALANCED?

BCS_BALANCED is a **computed, evidence-gated, and automatic** scoring system that measures Billionaire Confidence Score based on:

1. **BCS_model** (0-1): Computed from internal signals
   - Execution quality
   - Asset formation
   - Control mechanisms
   - Leverage capabilities
   - Time sustainability

2. **EvidenceWeight** (0-1): Proof ladder from external validation
   - Paid invoice
   - Weekly dependency
   - Third-party referral
   - Measurable outcome without founder
   - Upset-if-removed

3. **Final BCS** = 100 × (BCS_model × EvidenceWeight)

This ensures internal progress can improve the model, but the headline score remains capped until external evidence validates it.

## Usage

See `docs/bick/BCS.md` for complete documentation on:
- Recording events
- Running the scorer
- Understanding the formula
- Interpreting results

## Principles

- **Append-only**: Events are never deleted or modified
- **Deterministic**: Same inputs always produce same outputs
- **Evidence-gated**: Claims require external proof
- **Automatic**: No manual scoring or subjective judgment
