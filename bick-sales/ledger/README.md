# Ledger Directory

Contains immutable action logs (append-only).

## Files

- `actions_log.jsonl` - Every action with timestamp, agent, proof, outcome
- `audit_trail.jsonl` - Compliance audit events

**WARNING**: These files are append-only. Never edit or delete entries.

See [parent README](../README.md) for schemas and usage.
