/**
 * BCS_BALANCED Type Definitions
 * 
 * Types for the Billionaire Confidence Score system with append-only ledger
 * and deterministic scoring.
 */

// ============================================================================
// Event Types
// ============================================================================

export type EventType =
  | 'intent.created'
  | 'intent.closed'
  | 'proof.attached'
  | 'outcome.verified'
  | 'milestone.external'
  | 'revenue.received'
  | 'burden.reported'
  | 'artifact.shipped';

/**
 * Base event structure - all events extend this
 */
export interface BaseEvent {
  id: string;
  type: EventType;
  timestamp: string; // ISO 8601 format
  metadata?: Record<string, unknown>;
}

/**
 * Intent created - a new goal/intention is declared
 */
export interface IntentCreatedEvent extends BaseEvent {
  type: 'intent.created';
  intentId: string;
  description: string;
  category?: string;
}

/**
 * Intent closed - goal completed or abandoned
 */
export interface IntentClosedEvent extends BaseEvent {
  type: 'intent.closed';
  intentId: string;
  outcome: 'completed' | 'abandoned';
  completionNotes?: string;
}

/**
 * Proof attached - evidence linked to a deliverable
 */
export interface ProofAttachedEvent extends BaseEvent {
  type: 'proof.attached';
  relatedId: string; // intent or outcome ID
  proofType: 'screenshot' | 'document' | 'link' | 'measurement' | 'other';
  proofUrl?: string;
  description: string;
}

/**
 * Outcome verified - external validation of result
 */
export interface OutcomeVerifiedEvent extends BaseEvent {
  type: 'outcome.verified';
  intentId: string;
  verifiedBy: 'third-party' | 'measurement' | 'customer' | 'system';
  verificationNotes: string;
  impact?: string;
}

/**
 * Milestone external - public/external milestone reached
 */
export interface MilestoneExternalEvent extends BaseEvent {
  type: 'milestone.external';
  milestoneType: 'app-store-submission' | 'app-store-approval' | 'public-launch' | 'partnership' | 'certification' | 'other';
  platform?: string;
  description: string;
  verificationUrl?: string;
}

/**
 * Revenue received - actual payment received
 */
export interface RevenueReceivedEvent extends BaseEvent {
  type: 'revenue.received';
  amount: number;
  currency: string;
  source: string;
  recurring: boolean;
  invoiceId?: string;
}

/**
 * Burden reported - self-reported stress/burden level
 */
export interface BurdenReportedEvent extends BaseEvent {
  type: 'burden.reported';
  burdenLevel: number; // 0-10 scale
  categories?: string[];
  notes?: string;
}

/**
 * Artifact shipped - scalable asset delivered
 */
export interface ArtifactShippedEvent extends BaseEvent {
  type: 'artifact.shipped';
  artifactType: 'code' | 'documentation' | 'design' | 'automation' | 'api' | 'other';
  description: string;
  reusable: boolean;
  userFacing: boolean;
}

/**
 * Union type of all event types
 */
export type BickEvent =
  | IntentCreatedEvent
  | IntentClosedEvent
  | ProofAttachedEvent
  | OutcomeVerifiedEvent
  | MilestoneExternalEvent
  | RevenueReceivedEvent
  | BurdenReportedEvent
  | ArtifactShippedEvent;

// ============================================================================
// Scoring Types
// ============================================================================

/**
 * Submetrics computed from events
 */
export interface Submetrics {
  closureRate: number; // closed_intents / total_intents
  proofRate: number; // verified_outcomes / total_outcomes
  t2vScore: number; // time-to-value score (0-1)
  burdenTrend: number; // 7-day burden delta (negative is good)
  scalableArtifacts: number; // count of reusable artifacts
  externalMilestones: number; // count of external validations
}

/**
 * ESCLT Vectors (Execution, Scalability, Control, Leverage, Time sustainability)
 */
export interface ESCLTVectors {
  E: number; // Execution (0-1)
  S: number; // Scalability (0-1)
  C: number; // Control (0-1)
  L: number; // Leverage (0-1)
  T: number; // Time sustainability (0-1)
}

/**
 * Weights for ESCLT vectors (must sum to 1)
 */
export interface ESCLTWeights {
  wE: number;
  wS: number;
  wC: number;
  wL: number;
  wT: number;
}

/**
 * Evidence weight computation details
 */
export interface EvidenceWeightBreakdown {
  level: 'none' | 'minimal' | 'proof-of-concept' | 'validated' | 'business' | 'critical';
  score: number; // 0-1
  reason: string;
  supportingEvents: string[]; // event IDs
}

/**
 * Complete BCS score output
 */
export interface BCSScore {
  timestamp: string; // ISO 8601
  version: string; // scorer version
  
  // Final scores
  BCS: number; // 0-100, the headline score
  BCS_model: number; // 0-1, internal model
  EvidenceWeight: number; // 0-1, external validation
  
  // Component breakdown
  vectors: ESCLTVectors;
  weights: ESCLTWeights;
  submetrics: Submetrics;
  evidenceBreakdown: EvidenceWeightBreakdown;
  
  // Event summary
  eventCounts: Record<EventType, number>;
  totalEvents: number;
  
  // Metadata
  ledgerPath: string;
  computedBy: string;
}

/**
 * Ledger metadata
 */
export interface LedgerMetadata {
  totalEvents: number;
  eventTypes: Record<EventType, number>;
  dateRange: {
    earliest: string;
    latest: string;
  };
}
