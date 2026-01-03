# Knowledge Base - Query Documentation

## Overview

The Knowledge Persistence System captures the "why" behind every action for coaching-style learning. It integrates with the `.bick/ledger` event log to provide context, reasoning, and lessons learned.

## Directory Structure

```
.github/knowledge/
├── entries/          # Individual knowledge entries (YAML)
├── patterns/         # Auto-detected recurring patterns
├── dependencies/     # Dependency graphs
├── schema.json       # YAML validation schema
├── index.yml         # Searchable index
└── README.md         # This file
```

## Knowledge Entry Format

Each entry is a YAML file with the following structure:

```yaml
action:
  id: "unique-action-id"
  timestamp: "2026-01-03T18:15:29Z"
  type: "build_fix"
  
intent:
  description: "What this accomplishes"
  context: "Why it was needed"
  
enables:
  - "Capability A unlocked"
  - "Capability B enabled"
  
depends_on:
  - action: "previous-action-id"
    why: "Reason for dependency"
    
unlocks:
  - action: "future-action-id"
    why: "Why this is now possible"
    
implementation:
  approach: "High-level strategy"
  why_this_sequence:
    - "Step 1 reasoning"
    - "Step 2 reasoning"
    
proof:
  - "Build log URL"
  - "Test output"
  - "Commit SHA"
  
lessons:
  - "Lesson 1"
  - "Lesson 2"
  
coaching_notes: |
  Detailed coaching guidance for similar situations.
  
related_ledger_entries:
  - ".bick/ledger/2026-01-03/action-id.json"
```

## Query Methods

### 1. CLI Tool

Located at `scripts/knowledge-cli.js`:

```bash
# Query by type
node scripts/knowledge-cli.js query --type build_fix

# Query what action enables
node scripts/knowledge-cli.js query --enables "auto-merge"

# Show dependency chain
node scripts/knowledge-cli.js deps --action "fix-codex-sync"

# Get coaching for error
node scripts/knowledge-cli.js coach --error "Module not found"

# List all entries
node scripts/knowledge-cli.js list

# Show patterns
node scripts/knowledge-cli.js patterns
```

### 2. API Endpoints

#### Search Entries
```http
GET /api/knowledge?query=build_fix&type=build_fix
```

Returns matching knowledge entries with metadata.

#### Dependency Graph
```http
GET /api/knowledge/deps?action=action-id
```

Returns dependency chain for an action (both upstream and downstream).

#### Coaching Suggestions
```http
GET /api/knowledge/coach?error=Module%20not%20found
```

Returns coaching suggestions based on similar past issues.

#### Patterns
```http
GET /api/knowledge/patterns
```

Returns auto-detected recurring patterns with prevention strategies.

### 3. Web Dashboard

Access the visual interface at `/knowledge`:

- **Knowledge Graph** - Interactive dependency network
- **Action Timeline** - Chronological view of actions
- **Search Interface** - Full-text search across all entries
- **Pattern Summary** - Dashboard of recurring issues

## Integration with .bick/ledger

### Ledger vs Knowledge

- **Ledger**: Immutable event log (what happened)
- **Knowledge**: Coaching context (why it happened, what it enables)

### Linking

Knowledge entries reference ledger entries via `related_ledger_entries`:

```yaml
related_ledger_entries:
  - ".bick/ledger/2026-01-03/action-name.json"
```

This allows:
1. Event audit trail (ledger) + reasoning (knowledge)
2. Verification that knowledge exists for all critical actions
3. Dependency tracking across both systems

## Auto-Capture Workflow

The `.github/workflows/capture-knowledge.yml` workflow automatically:

1. Triggers on PR merge
2. Extracts PR metadata (title, description, changed files)
3. Generates a knowledge entry template
4. Commits to `.github/knowledge/entries/`
5. Updates the index

Manual entries can also be added by creating YAML files directly.

## Pattern Detection

The `scripts/detect-patterns.js` script:

1. Scans all knowledge entries
2. Identifies recurring issue types
3. Generates pattern files in `.github/knowledge/patterns/`
4. Suggests prevention strategies

Run manually or via CI:

```bash
node scripts/detect-patterns.js
```

## Validation

Integrity checks run via `scripts/verify-knowledge-integrity.js`:

```bash
node scripts/verify-knowledge-integrity.js
```

Validates:
- ✅ YAML schema compliance
- ✅ Ledger ↔ knowledge linkage
- ✅ No dependency cycles
- ✅ Proof artifacts exist

## Best Practices

### When to Create Entries

Create knowledge entries for:
- ✅ Build fixes (why build broke, how fixed)
- ✅ New features (what they enable, dependencies)
- ✅ Refactors (reasoning behind approach)
- ✅ Bug fixes (root cause, prevention)
- ✅ Configuration changes (impact, dependencies)

### What to Capture

Focus on:
- **Why**: Reasoning behind decisions
- **Enables**: Downstream capabilities unlocked
- **Lessons**: What would you tell your future self
- **Proof**: Verifiable artifacts (builds, tests, metrics)

### Coaching Notes

Write as if explaining to someone encountering this for the first time:
- Assume they don't have full context
- Explain the "why" behind decisions
- Include prevention strategies
- Reference similar patterns

## Examples

See `.github/knowledge/entries/` for real examples:
- `fix-codex-sync-2026-01-03.yml` - Build fix pattern
- `enable-auto-merge-2026-01-03.yml` - Deployment automation
- `build-knowledge-system-2026-01-03.yml` - Meta-entry (self-documenting)

## Troubleshooting

### Entry not showing in search
1. Check `index.yml` updated
2. Validate YAML syntax: `node scripts/verify-knowledge-integrity.js`
3. Ensure required fields present

### Dependency cycle detected
Run `node scripts/verify-knowledge-integrity.js` to identify cycle. Remove circular dependency or restructure action sequence.

### Pattern not detected
Ensure at least 2 similar entries exist with same `type` and similar `intent.context`.

## Contributing

When adding knowledge entries:
1. Follow schema (`schema.json`)
2. Link to ledger entries
3. Include proof artifacts
4. Write coaching notes for future reference
5. Run validation before committing

---

**Remember**: The goal is coaching-style learning. Write entries as if explaining to your future self why this decision was made and what it enables.
