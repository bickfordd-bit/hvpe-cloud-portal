-- Executions table
CREATE TABLE IF NOT EXISTS executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  
  intent_text TEXT NOT NULL,
  intent_declared_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  current_phase TEXT NOT NULL,
  current_state TEXT NOT NULL,
  
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  aborted_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Execution transitions (append-only log)
CREATE TABLE IF NOT EXISTS execution_transitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID NOT NULL REFERENCES executions(id),
  
  phase TEXT NOT NULL,
  
  from_state TEXT,
  to_state TEXT NOT NULL,
  transitioned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  authority TEXT NOT NULL,
  
  message TEXT,
  metadata JSONB,
  
  policy_reason TEXT,
  policy_rule TEXT,
  capability_gap JSONB,
  
  human_approval_required BOOLEAN DEFAULT FALSE,
  human_approval_granted_by TEXT,
  human_approval_granted_at TIMESTAMPTZ
);

-- Execution artifacts
CREATE TABLE IF NOT EXISTS execution_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID NOT NULL REFERENCES executions(id),
  
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  metadata JSONB,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_executions_tenant ON executions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_executions_phase ON executions(current_phase);
CREATE INDEX IF NOT EXISTS idx_executions_state ON executions(current_state);
CREATE INDEX IF NOT EXISTS idx_transitions_execution ON execution_transitions(execution_id);
CREATE INDEX IF NOT EXISTS idx_transitions_authority ON execution_transitions(authority);
CREATE INDEX IF NOT EXISTS idx_transitions_phase ON execution_transitions(phase);
CREATE INDEX IF NOT EXISTS idx_artifacts_execution ON execution_artifacts(execution_id);
