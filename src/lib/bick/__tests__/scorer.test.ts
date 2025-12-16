/**
 * BCS Scorer Tests
 */

import fs from 'fs';
import path from 'path';
import { computeBCS } from '../scorer';
import { writeEvent } from '../ledger';
import type {
  IntentCreatedEvent,
  IntentClosedEvent,
  OutcomeVerifiedEvent,
  RevenueReceivedEvent,
  MilestoneExternalEvent,
  BurdenReportedEvent,
  ArtifactShippedEvent,
} from '../types';

// Mock logger to avoid console spam in tests
jest.mock('@/lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

const LEDGER_ROOT = path.join(process.cwd(), '.bick', 'ledger');
const CANON_ROOT = path.join(process.cwd(), '.bick', 'canon');

/**
 * Clean up test ledger before/after tests
 */
function cleanupLedger() {
  if (fs.existsSync(LEDGER_ROOT)) {
    fs.rmSync(LEDGER_ROOT, { recursive: true, force: true });
  }
  if (fs.existsSync(CANON_ROOT)) {
    fs.rmSync(CANON_ROOT, { recursive: true, force: true });
  }
}

describe('BCS Scorer', () => {
  beforeEach(() => {
    cleanupLedger();
  });

  afterEach(() => {
    cleanupLedger();
  });

  describe('Empty ledger', () => {
    it('should return deterministic low score with no events', () => {
      const score = computeBCS();

      expect(score.BCS).toBe(0);
      expect(score.BCS_model).toBeGreaterThan(0); // Should have safe minimum values
      expect(score.EvidenceWeight).toBe(0);
      expect(score.evidenceBreakdown.level).toBe('none');
      expect(score.evidenceBreakdown.reason).toContain('No events');
      expect(score.totalEvents).toBe(0);
    });

    it('should have valid vector values', () => {
      const score = computeBCS();

      expect(score.vectors.E).toBeGreaterThanOrEqual(0);
      expect(score.vectors.E).toBeLessThanOrEqual(1);
      expect(score.vectors.S).toBeGreaterThanOrEqual(0);
      expect(score.vectors.T).toBeGreaterThanOrEqual(0);
    });

    it('should have weights that sum to 1', () => {
      const score = computeBCS();
      const { wE, wS, wC, wL, wT } = score.weights;
      const sum = wE + wS + wC + wL + wT;

      expect(sum).toBeCloseTo(1.0, 5);
    });
  });

  describe('With minimal events', () => {
    it('should have minimal evidence weight with only intent.created', () => {
      const event: IntentCreatedEvent = {
        id: 'evt-001',
        type: 'intent.created',
        timestamp: '2025-12-16T10:00:00Z',
        intentId: 'intent-001',
        description: 'Test intent',
      };

      writeEvent(event);
      const score = computeBCS();

      expect(score.totalEvents).toBe(1);
      expect(score.evidenceBreakdown.level).toBe('minimal');
      expect(score.evidenceBreakdown.score).toBe(0.1);
      expect(score.BCS).toBeGreaterThan(0);
      expect(score.BCS).toBeLessThan(10); // Capped by minimal evidence
    });
  });

  describe('With completed intents', () => {
    it('should improve closure rate with closed intents', () => {
      const created: IntentCreatedEvent = {
        id: 'evt-001',
        type: 'intent.created',
        timestamp: '2025-12-16T10:00:00Z',
        intentId: 'intent-001',
        description: 'Test intent',
      };

      const closed: IntentClosedEvent = {
        id: 'evt-002',
        type: 'intent.closed',
        timestamp: '2025-12-16T15:00:00Z',
        intentId: 'intent-001',
        outcome: 'completed',
      };

      writeEvent(created);
      writeEvent(closed);

      const score = computeBCS();

      expect(score.totalEvents).toBe(2);
      expect(score.submetrics.closureRate).toBe(1.0);
      expect(score.vectors.E).toBeGreaterThan(0);
    });

    it('should compute T2V score based on time delta', () => {
      const created: IntentCreatedEvent = {
        id: 'evt-001',
        type: 'intent.created',
        timestamp: '2025-12-16T10:00:00Z',
        intentId: 'intent-001',
        description: 'Fast intent',
      };

      const closed: IntentClosedEvent = {
        id: 'evt-002',
        type: 'intent.closed',
        timestamp: '2025-12-16T12:00:00Z', // 2 hours later
        intentId: 'intent-001',
        outcome: 'completed',
      };

      writeEvent(created);
      writeEvent(closed);

      const score = computeBCS();

      // < 1 day should score 1.0
      expect(score.submetrics.t2vScore).toBe(1.0);
    });
  });

  describe('With external validation', () => {
    it('should reach proof-of-concept level with milestone', () => {
      const milestone: MilestoneExternalEvent = {
        id: 'evt-001',
        type: 'milestone.external',
        timestamp: '2025-12-16T10:00:00Z',
        milestoneType: 'app-store-approval',
        platform: 'iOS',
        description: 'App approved',
      };

      writeEvent(milestone);
      const score = computeBCS();

      expect(score.evidenceBreakdown.level).toBe('proof-of-concept');
      expect(score.evidenceBreakdown.score).toBe(0.3);
    });

    it('should reach validated level with outcome.verified', () => {
      const verified: OutcomeVerifiedEvent = {
        id: 'evt-001',
        type: 'outcome.verified',
        timestamp: '2025-12-16T10:00:00Z',
        intentId: 'intent-001',
        verifiedBy: 'customer',
        verificationNotes: 'Customer confirmed',
      };

      writeEvent(verified);
      const score = computeBCS();

      expect(score.evidenceBreakdown.level).toBe('validated');
      expect(score.evidenceBreakdown.score).toBe(0.5);
    });

    it('should reach business level with revenue', () => {
      const revenue: RevenueReceivedEvent = {
        id: 'evt-001',
        type: 'revenue.received',
        timestamp: '2025-12-16T10:00:00Z',
        amount: 100,
        currency: 'USD',
        source: 'customer',
        recurring: false,
      };

      writeEvent(revenue);
      const score = computeBCS();

      expect(score.evidenceBreakdown.level).toBe('business');
      expect(score.evidenceBreakdown.score).toBe(0.7);
    });

    it('should reach critical level with recurring revenue', () => {
      const revenue: RevenueReceivedEvent = {
        id: 'evt-001',
        type: 'revenue.received',
        timestamp: '2025-12-16T10:00:00Z',
        amount: 100,
        currency: 'USD',
        source: 'customer',
        recurring: true,
      };

      writeEvent(revenue);
      const score = computeBCS();

      expect(score.evidenceBreakdown.level).toBe('critical');
      expect(score.evidenceBreakdown.score).toBe(1.0);
    });
  });

  describe('With scalable artifacts', () => {
    it('should count reusable artifacts', () => {
      const artifact: ArtifactShippedEvent = {
        id: 'evt-001',
        type: 'artifact.shipped',
        timestamp: '2025-12-16T10:00:00Z',
        artifactType: 'automation',
        description: 'CI pipeline',
        reusable: true,
        userFacing: false,
      };

      writeEvent(artifact);
      const score = computeBCS();

      expect(score.submetrics.scalableArtifacts).toBe(1);
      expect(score.vectors.S).toBeGreaterThan(0);
    });

    it('should not count non-reusable artifacts', () => {
      const artifact: ArtifactShippedEvent = {
        id: 'evt-001',
        type: 'artifact.shipped',
        timestamp: '2025-12-16T10:00:00Z',
        artifactType: 'documentation',
        description: 'One-off doc',
        reusable: false,
        userFacing: true,
      };

      writeEvent(artifact);
      const score = computeBCS();

      expect(score.submetrics.scalableArtifacts).toBe(0);
    });
  });

  describe('With burden reports', () => {
    it('should compute burden trend with sufficient data', () => {
      const report1: BurdenReportedEvent = {
        id: 'evt-001',
        type: 'burden.reported',
        timestamp: '2025-12-10T10:00:00Z',
        burdenLevel: 8,
      };

      const report2: BurdenReportedEvent = {
        id: 'evt-002',
        type: 'burden.reported',
        timestamp: '2025-12-16T10:00:00Z',
        burdenLevel: 4,
      };

      writeEvent(report1);
      writeEvent(report2);

      const score = computeBCS();

      // Burden decreased, should result in score > 0.5
      expect(score.submetrics.burdenTrend).toBeGreaterThan(0.5);
    });

    it('should return neutral score with insufficient burden data', () => {
      const report: BurdenReportedEvent = {
        id: 'evt-001',
        type: 'burden.reported',
        timestamp: '2025-12-16T10:00:00Z',
        burdenLevel: 5,
      };

      writeEvent(report);
      const score = computeBCS();

      // Single report should give neutral score
      expect(score.submetrics.burdenTrend).toBe(0.5);
    });
  });

  describe('Complete workflow', () => {
    it('should produce higher score with full event set', () => {
      // Create intent
      writeEvent({
        id: 'evt-001',
        type: 'intent.created',
        timestamp: '2025-12-15T10:00:00Z',
        intentId: 'intent-001',
        description: 'Build feature',
      } as IntentCreatedEvent);

      // Ship artifact
      writeEvent({
        id: 'evt-002',
        type: 'artifact.shipped',
        timestamp: '2025-12-15T14:00:00Z',
        artifactType: 'code',
        description: 'Feature implementation',
        reusable: true,
        userFacing: true,
      } as ArtifactShippedEvent);

      // Close intent
      writeEvent({
        id: 'evt-003',
        type: 'intent.closed',
        timestamp: '2025-12-15T16:00:00Z',
        intentId: 'intent-001',
        outcome: 'completed',
      } as IntentClosedEvent);

      // External milestone
      writeEvent({
        id: 'evt-004',
        type: 'milestone.external',
        timestamp: '2025-12-16T09:00:00Z',
        milestoneType: 'public-launch',
        description: 'Feature launched',
      } as MilestoneExternalEvent);

      // Verified outcome
      writeEvent({
        id: 'evt-005',
        type: 'outcome.verified',
        timestamp: '2025-12-16T12:00:00Z',
        intentId: 'intent-001',
        verifiedBy: 'customer',
        verificationNotes: 'Customer used feature successfully',
      } as OutcomeVerifiedEvent);

      // Revenue
      writeEvent({
        id: 'evt-006',
        type: 'revenue.received',
        timestamp: '2025-12-16T15:00:00Z',
        amount: 100,
        currency: 'USD',
        source: 'customer',
        recurring: true,
      } as RevenueReceivedEvent);

      const score = computeBCS();

      // Should have critical evidence level
      expect(score.evidenceBreakdown.level).toBe('critical');
      expect(score.EvidenceWeight).toBe(1.0);

      // Should have good execution metrics
      expect(score.submetrics.closureRate).toBe(1.0);
      expect(score.submetrics.proofRate).toBeGreaterThan(0);

      // BCS should be significant
      expect(score.BCS).toBeGreaterThan(10);
      expect(score.totalEvents).toBe(6);
    });
  });

  describe('Deterministic behavior', () => {
    it('should produce identical scores for same events', () => {
      const event: IntentCreatedEvent = {
        id: 'evt-001',
        type: 'intent.created',
        timestamp: '2025-12-16T10:00:00Z',
        intentId: 'intent-001',
        description: 'Test',
      };

      writeEvent(event);

      const score1 = computeBCS();
      const score2 = computeBCS();

      expect(score1.BCS).toBe(score2.BCS);
      expect(score1.BCS_model).toBe(score2.BCS_model);
      expect(score1.EvidenceWeight).toBe(score2.EvidenceWeight);
      expect(score1.evidenceBreakdown.level).toBe(score2.evidenceBreakdown.level);
    });
  });

  describe('Output format', () => {
    it('should include all required fields', () => {
      const score = computeBCS();

      expect(score).toHaveProperty('timestamp');
      expect(score).toHaveProperty('version');
      expect(score).toHaveProperty('BCS');
      expect(score).toHaveProperty('BCS_model');
      expect(score).toHaveProperty('EvidenceWeight');
      expect(score).toHaveProperty('vectors');
      expect(score).toHaveProperty('weights');
      expect(score).toHaveProperty('submetrics');
      expect(score).toHaveProperty('evidenceBreakdown');
      expect(score).toHaveProperty('eventCounts');
      expect(score).toHaveProperty('totalEvents');
      expect(score).toHaveProperty('ledgerPath');
      expect(score).toHaveProperty('computedBy');
    });

    it('should have valid BCS range', () => {
      const score = computeBCS();

      expect(score.BCS).toBeGreaterThanOrEqual(0);
      expect(score.BCS).toBeLessThanOrEqual(100);
    });

    it('should have valid model and evidence ranges', () => {
      const score = computeBCS();

      expect(score.BCS_model).toBeGreaterThanOrEqual(0);
      expect(score.BCS_model).toBeLessThanOrEqual(1);
      expect(score.EvidenceWeight).toBeGreaterThanOrEqual(0);
      expect(score.EvidenceWeight).toBeLessThanOrEqual(1);
    });
  });
});
