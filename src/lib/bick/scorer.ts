/**
 * BCS_BALANCED Scorer
 * 
 * Deterministic scoring engine that computes BCS from ledger events.
 * 
 * Formula: BCS = 100 * (BCS_model * EvidenceWeight)
 * Where:
 *   BCS_model = E^wE * S^wS * C^wC * L^wL * T^wT
 *   EvidenceWeight = max-of-ladder from external validation events
 */

import fs from 'fs';
import path from 'path';
import {
  BickEvent,
  BCSScore,
  ESCLTVectors,
  ESCLTWeights,
  Submetrics,
  EvidenceWeightBreakdown,
  IntentCreatedEvent,
  IntentClosedEvent,
  OutcomeVerifiedEvent,
  BurdenReportedEvent,
  ArtifactShippedEvent,
  MilestoneExternalEvent,
  RevenueReceivedEvent,
  EventType,
} from './types';
import { readAllEvents, getLedgerMetadata } from './ledger';

const SCORER_VERSION = '1.0.0';
const CANON_ROOT = path.join(process.cwd(), '.bick', 'canon');

// Default weights for ESCLT (sum to 1)
const DEFAULT_WEIGHTS: ESCLTWeights = {
  wE: 0.30, // Execution
  wS: 0.20, // Scalability
  wC: 0.20, // Control
  wL: 0.15, // Leverage
  wT: 0.15, // Time sustainability
};

/**
 * Clamp a value between 0 and 1
 */
function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/**
 * Compute closure rate: closed_intents / total_intents
 */
function computeClosureRate(events: BickEvent[]): number {
  const intentsCreated = events.filter(e => e.type === 'intent.created').length;
  const intentsClosed = events.filter(e => e.type === 'intent.closed').length;
  
  if (intentsCreated === 0) return 0;
  return clamp01(intentsClosed / intentsCreated);
}

/**
 * Compute proof rate: verified outcomes / (closed intents + verified outcomes)
 * This measures how often we have external verification
 */
function computeProofRate(events: BickEvent[]): number {
  const outcomesVerified = events.filter(e => e.type === 'outcome.verified').length;
  const intentsClosed = events.filter(e => e.type === 'intent.closed').length;
  
  const total = intentsClosed + outcomesVerified;
  if (total === 0) return 0;
  
  return clamp01(outcomesVerified / total);
}

/**
 * Compute T2V (time to value) score
 * Measures average time from intent.created to outcome.verified (or intent.closed)
 * Lower time is better, scaled to [0,1]
 * 
 * Scoring:
 * - < 1 day: 1.0
 * - 1-7 days: 0.8
 * - 7-30 days: 0.6
 * - 30-90 days: 0.4
 * - > 90 days: 0.2
 */
function computeT2VScore(events: BickEvent[]): number {
  const intentsCreated = events.filter(e => e.type === 'intent.created') as IntentCreatedEvent[];
  const intentsClosed = events.filter(e => e.type === 'intent.closed') as IntentClosedEvent[];
  const outcomesVerified = events.filter(e => e.type === 'outcome.verified') as OutcomeVerifiedEvent[];
  
  if (intentsCreated.length === 0) return 0;
  
  const durations: number[] = [];
  
  // Map intents to their completion times
  for (const intent of intentsCreated) {
    // Find corresponding closed or verified event
    const closed = intentsClosed.find(c => c.intentId === intent.intentId);
    const verified = outcomesVerified.find(v => v.intentId === intent.intentId);
    
    const endEvent = verified || closed;
    if (endEvent) {
      const startTime = new Date(intent.timestamp).getTime();
      const endTime = new Date(endEvent.timestamp).getTime();
      const durationDays = (endTime - startTime) / (1000 * 60 * 60 * 24);
      durations.push(durationDays);
    }
  }
  
  if (durations.length === 0) return 0;
  
  // Compute average duration
  const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
  
  // Score based on duration
  if (avgDuration < 1) return 1.0;
  if (avgDuration < 7) return 0.8;
  if (avgDuration < 30) return 0.6;
  if (avgDuration < 90) return 0.4;
  return 0.2;
}

/**
 * Compute burden trend from last 7 days of burden reports
 * Negative delta is good (burden decreasing)
 * Returns a score in [0,1] where 1 = burden significantly decreased
 */
function computeBurdenTrend(events: BickEvent[]): number {
  const burdenEvents = events.filter(e => e.type === 'burden.reported') as BurdenReportedEvent[];
  
  if (burdenEvents.length < 2) return 0.5; // Neutral if insufficient data
  
  // Sort by timestamp
  const sorted = [...burdenEvents].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  
  // Get events from last 7 days
  const now = new Date().getTime();
  const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
  const recent = sorted.filter(e => new Date(e.timestamp).getTime() > sevenDaysAgo);
  
  if (recent.length < 2) {
    // Use last two events if not enough recent data
    const last = sorted[sorted.length - 1];
    const prev = sorted[sorted.length - 2];
    const delta = last.burdenLevel - prev.burdenLevel;
    
    // Convert delta to [0,1] where negative is good
    // Delta range is roughly [-10, 10]
    return clamp01(0.5 - (delta / 20));
  }
  
  // Compute trend (first vs last in 7-day window)
  const first = recent[0];
  const last = recent[recent.length - 1];
  const delta = last.burdenLevel - first.burdenLevel;
  
  return clamp01(0.5 - (delta / 20));
}

/**
 * Count scalable artifacts (reusable=true)
 */
function countScalableArtifacts(events: BickEvent[]): number {
  const artifacts = events.filter(e => e.type === 'artifact.shipped') as ArtifactShippedEvent[];
  return artifacts.filter(a => a.reusable).length;
}

/**
 * Count external milestones
 */
function countExternalMilestones(events: BickEvent[]): number {
  return events.filter(e => e.type === 'milestone.external').length;
}

/**
 * Compute all submetrics
 */
function computeSubmetrics(events: BickEvent[]): Submetrics {
  return {
    closureRate: computeClosureRate(events),
    proofRate: computeProofRate(events),
    t2vScore: computeT2VScore(events),
    burdenTrend: computeBurdenTrend(events),
    scalableArtifacts: countScalableArtifacts(events),
    externalMilestones: countExternalMilestones(events),
  };
}

/**
 * Compute ESCLT vectors from submetrics
 */
function computeVectors(submetrics: Submetrics): ESCLTVectors {
  // E (Execution): closure rate + proof rate
  const E = clamp01((submetrics.closureRate * 0.6) + (submetrics.proofRate * 0.4));
  
  // S (Scalability): scalable artifacts (normalized, cap at 10)
  const S = clamp01(submetrics.scalableArtifacts / 10);
  
  // C (Control): external milestones (normalized, cap at 5)
  const C = clamp01(submetrics.externalMilestones / 5);
  
  // L (Leverage): combination of scalability and control
  const L = clamp01((S + C) / 2);
  
  // T (Time sustainability): burden trend + t2v score
  const T = clamp01((submetrics.burdenTrend * 0.4) + (submetrics.t2vScore * 0.6));
  
  return { E, S, C, L, T };
}

/**
 * Compute BCS_model = E^wE * S^wS * C^wC * L^wL * T^wT
 */
function computeBCSModel(vectors: ESCLTVectors, weights: ESCLTWeights): number {
  const { E, S, C, L, T } = vectors;
  const { wE, wS, wC, wL, wT } = weights;
  
  // Avoid 0^0 edge case
  const safeE = Math.max(0.01, E);
  const safeS = Math.max(0.01, S);
  const safeC = Math.max(0.01, C);
  const safeL = Math.max(0.01, L);
  const safeT = Math.max(0.01, T);
  
  const model = Math.pow(safeE, wE) * Math.pow(safeS, wS) * Math.pow(safeC, wC) * Math.pow(safeL, wL) * Math.pow(safeT, wT);
  
  return clamp01(model);
}

/**
 * Compute evidence weight using max-of-ladder approach
 * 
 * Ladder:
 * 0. none: 0.0 (no events)
 * 1. minimal: 0.1 (has intent.created events)
 * 2. proof-of-concept: 0.3 (has proof.attached or milestone.external)
 * 3. validated: 0.5 (has outcome.verified)
 * 4. business: 0.7 (has revenue.received)
 * 5. critical: 1.0 (recurring revenue or third-party dependency)
 */
function computeEvidenceWeight(events: BickEvent[]): EvidenceWeightBreakdown {
  if (events.length === 0) {
    return {
      level: 'none',
      score: 0.0,
      reason: 'No events in ledger',
      supportingEvents: [],
    };
  }
  
  // Check for recurring revenue (critical)
  const revenueEvents = events.filter(e => e.type === 'revenue.received') as RevenueReceivedEvent[];
  const recurringRevenue = revenueEvents.filter(r => r.recurring);
  if (recurringRevenue.length > 0) {
    return {
      level: 'critical',
      score: 1.0,
      reason: 'Has recurring revenue stream',
      supportingEvents: recurringRevenue.map(e => e.id),
    };
  }
  
  // Check for any revenue (business)
  if (revenueEvents.length > 0) {
    return {
      level: 'business',
      score: 0.7,
      reason: 'Has received payment',
      supportingEvents: revenueEvents.map(e => e.id),
    };
  }
  
  // Check for verified outcomes (validated)
  const verifiedEvents = events.filter(e => e.type === 'outcome.verified');
  if (verifiedEvents.length > 0) {
    return {
      level: 'validated',
      score: 0.5,
      reason: 'Has externally verified outcomes',
      supportingEvents: verifiedEvents.map(e => e.id),
    };
  }
  
  // Check for external milestones or proofs (proof-of-concept)
  const externalEvents = events.filter(e => e.type === 'milestone.external' || e.type === 'proof.attached');
  if (externalEvents.length > 0) {
    return {
      level: 'proof-of-concept',
      score: 0.3,
      reason: 'Has external milestones or attached proof',
      supportingEvents: externalEvents.map(e => e.id),
    };
  }
  
  // Has intent events (minimal)
  const intentEvents = events.filter(e => e.type === 'intent.created');
  if (intentEvents.length > 0) {
    return {
      level: 'minimal',
      score: 0.1,
      reason: 'Has declared intents but no external validation',
      supportingEvents: intentEvents.map(e => e.id),
    };
  }
  
  return {
    level: 'none',
    score: 0.0,
    reason: 'No qualifying events',
    supportingEvents: [],
  };
}

/**
 * Compute event counts by type
 */
function computeEventCounts(events: BickEvent[]): Record<EventType, number> {
  const counts: Record<EventType, number> = {
    'intent.created': 0,
    'intent.closed': 0,
    'proof.attached': 0,
    'outcome.verified': 0,
    'milestone.external': 0,
    'revenue.received': 0,
    'burden.reported': 0,
    'artifact.shipped': 0,
  };
  
  for (const event of events) {
    counts[event.type]++;
  }
  
  return counts;
}

/**
 * Main scoring function - computes BCS from ledger events
 */
export function computeBCS(weights: ESCLTWeights = DEFAULT_WEIGHTS): BCSScore {
  const events = readAllEvents();
  const submetrics = computeSubmetrics(events);
  const vectors = computeVectors(submetrics);
  const bcsModel = computeBCSModel(vectors, weights);
  const evidenceBreakdown = computeEvidenceWeight(events);
  const evidenceWeight = evidenceBreakdown.score;
  
  const bcs = 100 * bcsModel * evidenceWeight;
  
  return {
    timestamp: new Date().toISOString(),
    version: SCORER_VERSION,
    BCS: bcs,
    BCS_model: bcsModel,
    EvidenceWeight: evidenceWeight,
    vectors,
    weights,
    submetrics,
    evidenceBreakdown,
    eventCounts: computeEventCounts(events),
    totalEvents: events.length,
    ledgerPath: path.join(process.cwd(), '.bick', 'ledger'),
    computedBy: 'bick:score',
  };
}

/**
 * Ensure canon directory exists
 */
function ensureCanonDir(): void {
  if (!fs.existsSync(CANON_ROOT)) {
    fs.mkdirSync(CANON_ROOT, { recursive: true });
  }
}

/**
 * Write BCS score to canon/bcs-latest.json
 */
export function writeBCSLatest(score: BCSScore): void {
  ensureCanonDir();
  const filePath = path.join(CANON_ROOT, 'bcs-latest.json');
  fs.writeFileSync(filePath, JSON.stringify(score, null, 2), 'utf-8');
}

/**
 * Append BCS score to canon/bcs-history.jsonl
 */
export function appendBCSHistory(score: BCSScore): void {
  ensureCanonDir();
  const filePath = path.join(CANON_ROOT, 'bcs-history.jsonl');
  const line = JSON.stringify(score) + '\n';
  fs.appendFileSync(filePath, line, 'utf-8');
}

/**
 * Run the scorer and write output files
 */
export function runScorer(): BCSScore {
  const score = computeBCS();
  writeBCSLatest(score);
  appendBCSHistory(score);
  return score;
}
