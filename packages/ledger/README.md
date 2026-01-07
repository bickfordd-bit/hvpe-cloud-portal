# Ledger Schema - Execution Tables

This directory contains SQL schema definitions for the Bickford Execution system ledger tables.

## Files

- `executions.sql` - Execution tracking, transitions, and artifacts tables

## Schema Overview

### Tables

#### `executions`

Main execution tracking table - stores high-level execution state.

**Columns:**

- `id` (UUID, PK) - Unique execution identifier
- `tenant_id` (TEXT) - Tenant/organization identifier
- `intent_text` (TEXT) - Original intent declaration
- `intent_declared_at` (TIMESTAMPTZ) - When intent was declared
- `current_phase` (TEXT) - Current execution phase (see ExecutionPhase enum)
- `current_state` (TEXT) - Current execution state (see ExecutionState enum)
- `completed_at`, `failed_at`, `aborted_at` (TIMESTAMPTZ) - Terminal timestamps
- `created_at`, `updated_at` (TIMESTAMPTZ) - Record timestamps

**Indexes:**

- `idx_executions_tenant` - Tenant-based queries
- `idx_executions_phase` - Phase filtering
- `idx_executions_state` - State filtering

#### `execution_transitions`

Append-only log of all state transitions (immutable audit trail).

**Columns:**

- `id` (UUID, PK) - Transition identifier
- `execution_id` (UUID, FK) - References executions(id)
- `phase` (TEXT) - Phase during transition
- `from_state`, `to_state` (TEXT) - State transition
- `transitioned_at` (TIMESTAMPTZ) - Transition timestamp
- `authority` (TEXT) - Who/what authorized transition (see TransitionAuthority enum)
- `message` (TEXT) - Transition description
- `metadata` (JSONB) - Additional transition data
- `policy_reason`, `policy_rule` (TEXT) - Policy decision context
- `capability_gap` (JSONB) - Missing capability details
- `human_approval_required` (BOOLEAN) - Approval flag
- `human_approval_granted_by`, `human_approval_granted_at` - Approval tracking

**Indexes:**

- `idx_transitions_execution` - Execution-based queries
- `idx_transitions_authority` - Authority filtering
- `idx_transitions_phase` - Phase filtering

#### `execution_artifacts`

Artifacts produced during execution (files, logs, outputs).

**Columns:**

- `id` (UUID, PK) - Artifact identifier
- `execution_id` (UUID, FK) - References executions(id)
- `type` (TEXT) - Artifact type (e.g., "git_patch", "log_file", "report")
- `url` (TEXT) - Artifact location
- `metadata` (JSONB) - Additional artifact metadata
- `created_at` (TIMESTAMPTZ) - Creation timestamp

**Indexes:**

- `idx_artifacts_execution` - Execution-based queries

## Usage

### PostgreSQL

```bash
psql $DATABASE_URL -f packages/ledger/schema/executions.sql
```

### Prisma Migration

To integrate with Prisma, you can either:

1. Create a raw SQL migration:

```bash
mkdir -p prisma/migrations/$(date +%Y%m%d%H%M%S)_add_execution_tables
cp packages/ledger/schema/executions.sql prisma/migrations/.../migration.sql
npx prisma migrate resolve --applied <migration_name>
```

2. Or model in Prisma schema and let Prisma generate migrations

### Supabase

```sql
-- Run directly in Supabase SQL editor or via migration
```

## Immutability

⚠️ **Important**: The `execution_transitions` table is append-only. Never update or delete records - this is an immutable audit trail.

## Querying Examples

### Get execution history

```sql
SELECT
  e.id,
  e.intent_text,
  e.current_state,
  et.from_state,
  et.to_state,
  et.authority,
  et.transitioned_at,
  et.message
FROM executions e
JOIN execution_transitions et ON e.id = et.execution_id
WHERE e.tenant_id = 'tenant-123'
ORDER BY et.transitioned_at DESC;
```

### Find executions requiring human approval

```sql
SELECT DISTINCT e.*
FROM executions e
JOIN execution_transitions et ON e.id = et.execution_id
WHERE et.human_approval_required = TRUE
  AND et.human_approval_granted_at IS NULL
  AND e.current_state NOT IN ('completed', 'failed_terminal', 'aborted');
```

### Get artifacts for an execution

```sql
SELECT
  ea.type,
  ea.url,
  ea.metadata,
  ea.created_at
FROM execution_artifacts ea
WHERE ea.execution_id = '00000000-0000-0000-0000-000000000000'
ORDER BY ea.created_at;
```

## Schema Evolution

This schema is part of the frozen Bickford Execution Spec v1. Changes require spec owner approval.

## Related

- TypeScript package: `@bickford/execution` (packages/execution/)
- Spec documentation: See problem statement in implementation PR
