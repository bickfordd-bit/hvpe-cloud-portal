/**
 * Bickford Homepage — Core Type Definitions
 * 
 * Zero-approval execution runtime types for intent parsing,
 * OPTR policy selection, execution, and ledger tracking.
 */

// ============================================================================
// Intent Types
// ============================================================================

export type IntentType = 
  | 'feature'        // Add/modify feature
  | 'bugfix'         // Fix existing issue
  | 'refactor'       // Code improvement
  | 'docs'           // Documentation change
  | 'config'         // Configuration update
  | 'deploy'         // Deployment action
  | 'query';         // Information request

export interface Intent {
  rawText: string;
  intentType: IntentType;
  scope: string[];                // Affected files/modules
  timestamp: string;
  confidence: number;             // 0-1 confidence in parsing
  metadata?: Record<string, any>;
}

// ============================================================================
// Canon Types
// ============================================================================

export interface CanonMeta {
  version: string;
  sha256: string;
  timestamp: string;
  status: 'LOCKED' | 'DRAFT';
  lastModifiedBy?: string;
}

export interface Canon {
  content: string;                // Full CANON.md content
  meta: CanonMeta;
  rules: CanonRule[];
}

export interface CanonRule {
  id: string;
  category: 'invariant' | 'gate' | 'metric' | 'principle';
  description: string;
  enforcement: 'hard' | 'soft';   // hard = block execution, soft = warn
}

// ============================================================================
// OPTR Policy Types
// ============================================================================

export interface OPTRScore {
  ttv: number;                    // Time-to-value (lower is better)
  risk: number;                   // Risk score (0-1)
  cognitiveLoad: number;          // Cognitive load (0-1)
  automationGain: number;         // Automation gain (0-1)
  totalScore: number;             // Weighted combination
}

export interface Policy {
  id: string;
  name: string;
  description: string;
  applicableIntentTypes: IntentType[];
  optrScore: OPTRScore;
  constraints: PolicyConstraint[];
  actions: PolicyAction[];
}

export interface PolicyConstraint {
  type: 'canon_compliance' | 'non_interference' | 'monotonic_safety' | 'burden_reduction';
  description: string;
  checkFn: string;                // Name of validation function
}

export interface PolicyAction {
  type: 'git_commit' | 'api_call' | 'file_write' | 'notification';
  description: string;
  params: Record<string, any>;
}

export interface PolicyBinding {
  policy: Policy;
  intent: Intent;
  confidence: number;
  selectedAt: string;
  reasoning: string;
}

// ============================================================================
// Execution Types
// ============================================================================

export type ExecutionStatus = 
  | 'PENDING'
  | 'VALIDATING'
  | 'EXECUTING'
  | 'COMMITTING'
  | 'DEPLOYED'
  | 'FAILED'
  | 'DENIED';

export interface ExecutionPlan {
  intent: Intent;
  policyBinding: PolicyBinding;
  changes: FileChange[];
  estimatedTTV: number;           // Estimated time-to-value in seconds
  risks: Risk[];
}

export interface FileChange {
  path: string;
  operation: 'create' | 'modify' | 'delete';
  diff?: string;
  preview?: string;
}

export interface Risk {
  level: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
  mitigation?: string;
}

export interface ExecutionResult {
  success: boolean;
  status: ExecutionStatus;
  intent: Intent;
  policyBinding: PolicyBinding;
  executionPlan: ExecutionPlan;
  commits: CommitInfo[];
  ledgerEntry: LedgerEntry;
  error?: string;
  timestamp: string;
  durationMs: number;
}

export interface CommitInfo {
  sha?: string;
  message: string;
  files: string[];
  timestamp: string;
  author: string;
  url?: string;
}

// ============================================================================
// Ledger Types
// ============================================================================

export interface LedgerEntry {
  id: string;
  timestamp: string;
  intent: Intent;
  policyId: string;
  canonHash: string;
  outcome: 'ALLOW' | 'DENY' | 'FAIL';
  executionResult?: Partial<ExecutionResult>;
  reasoning: string;
  artifacts: Artifact[];
  hash: string;                   // SHA-256 of this entry
  prevHash: string | null;        // Previous entry hash (chain)
}

export interface Artifact {
  type: 'commit' | 'log' | 'diff' | 'metric';
  description: string;
  url?: string;
  content?: string;
  timestamp: string;
}

// ============================================================================
// Invariant Checking Types
// ============================================================================

export interface InvariantCheck {
  name: string;
  type: PolicyConstraint['type'];
  passed: boolean;
  message: string;
  evidence?: any;
}

export interface InvariantResult {
  allPassed: boolean;
  checks: InvariantCheck[];
  timestamp: string;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface ExecuteRequest {
  intent: string;                 // Raw intent text
  dryRun?: boolean;               // Preview only, no execution
  skipApproval?: boolean;         // Force zero-approval mode (default true)
}

export interface ExecuteResponse {
  success: boolean;
  result?: ExecutionResult;
  preview?: ExecutionPlan;
  error?: string;
  message: string;
}

export interface LedgerQueryRequest {
  startDate?: string;
  endDate?: string;
  intentType?: IntentType;
  outcome?: LedgerEntry['outcome'];
  limit?: number;
}

export interface LedgerQueryResponse {
  entries: LedgerEntry[];
  total: number;
  hasMore: boolean;
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface BickfordConfig {
  mode: 'zero-approval' | 'review-required';
  canonPath: string;
  ledgerPath: string;
  githubRepo: string;
  githubBranch: string;
  optrWeights: {
    ttv: number;
    risk: number;
    cogLoad: number;
    autoGain: number;
  };
}

// ============================================================================
// Utility Types
// ============================================================================

export type Result<T, E = Error> = 
  | { ok: true; value: T }
  | { ok: false; error: E };

export type Awaitable<T> = T | Promise<T>;
