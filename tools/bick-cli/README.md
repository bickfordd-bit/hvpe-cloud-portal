# BICK CLI

Command-line tool for computing BICK (Bickford Intent-Cognitive-Knowledge) scores from repository signals.

## What is BICK?

BICK measures value delivery velocity with moat strength and cognitive load:

```
BICK_planner = ( Σ(Value(w) * EC(w)) / Σ(T2V(w)) ) * DS * (1 / C)
```

See `docs/bick/CANON.md` for complete formula definitions.

## Installation

From repository root:

```bash
# Install dependencies (including workspace)
npm install

# Build BICK CLI
npm run -w @bickford/bick-cli build

# Link globally (optional)
npm link --workspace @bickford/bick-cli
```

## Usage

### Initialize BICK ledger

```bash
bick init
```

Creates `.bick/` directory for snapshots and reports.

### Compute BICK score (JSON output)

```bash
bick score
```

Returns JSON with:
- `BICK_planner`: Overall score
- `components`: Breakdown (numerator, denominator, DS, C)
- `counts`: Work item statistics
- `nextBestActions`: Recommended improvements

### Generate human-readable report

```bash
bick report
```

Creates `.bick/BICK_REPORT.md` with formatted output.

### Get next-best-actions

```bash
bick tick
```

Outputs JSON list of recommended actions to increase BICK score, saved to `.bick/NEXT_BEST_ACTIONS.json`.

## Data Collection

BICK collects repo signals in two modes:

### GitHub Mode (preferred)

Requires `gh` CLI authenticated:

```bash
gh auth login
```

Collects:
- Merged PRs (last 100) → work items with real T2V
- Open issues → cognitive load (untriaged, blocked)
- Labels → priority (priority/P0, priority/P1, priority/P2)

### Git Fallback Mode

Uses `git log` for last 30 days of commits:
- Each commit → work item with default T2V=3 days, EC=0.6
- Parses commit messages for priority hints (P0, P1, P2)

## Configuration

Edit `bick.config.json` at repo root:

```json
{
  "weights": {
    "alpha_value": 1.0,
    "beta_ec": 1.0,
    "gamma_t2v": 1.0,
    "lambda_cognitive_load": 1.0,
    "ds_power": 1.0
  },
  "thresholds": {
    "max_untriaged": 10,
    "max_blocked": 5
  },
  "defensibility_snapshot": {
    "dataExclusivity": 2,      // 0-4
    "workflowLockIn": 3,       // 0-4
    "autonomousExecution": 3,  // 0-4
    "switchingCost": 2         // 0-4
  },
  "value_model": {
    "default_value_per_item": 100,
    "priority_multiplier": {
      "P0": 3.0,
      "P1": 2.0,
      "P2": 1.0,
      "UNKNOWN": 1.0
    }
  }
}
```

## GitHub Actions

BICK runs automatically on:
- Every PR (`.github/workflows/bick.yml`)
- Daily at 9:00 UTC
- Manual workflow dispatch

Artifacts uploaded:
- `bick-report`: `.bick/BICK_REPORT.md`
- `bick-snapshot`: `.bick/snapshot-*.json`

## Development

```bash
# Run without building
npm run -w @bickford/bick-cli dev

# Build TypeScript
npm run -w @bickford/bick-cli build
```

## Files

- `src/index.ts`: CLI entry point and command router
- `src/model/compute.ts`: BICK formula implementation
- `src/signals/collect.ts`: GitHub/Git data collector
- `src/ui/report.ts`: Markdown report renderer

## Example Output

```bash
$ bick score
{
  "BICK_planner": 1.557,
  "components": {
    "numerator_value_x_ec": 680,
    "denominator_t2v_days": 21,
    "defensibility_scalar": 0.625,
    "cognitive_load_C": 13,
    "base_value_rate": 32.38
  },
  "counts": {
    "done": 5,
    "total": 5
  },
  "nextBestActions": [
    "Groom intake: triage unassigned/unlabeled issues.",
    "Kill blockers: resolve dependencies / clarify acceptance criteria."
  ]
}
```

## References

- Canonical formula: `docs/bick/CANON.md`
- Agent contract: `AGENTS.md`
- Configuration: `bick.config.json`
