// Timestamp: 2025-12-19T11:02:00-05:00
// Bickford Ledger: Decision persistence layer

import { prisma } from '@/lib/prisma';
import { validateDecision, type BickfordDecision } from './guardrails';
import { logger } from '@/lib/logger';
import crypto from 'crypto';

/**
 * Write a decision to the Bickford ledger.
 * This is the append-only log of all Bickford decisions.
 */
export async function writeLedgerEntry(decision: BickfordDecision): Promise<string> {
  // Validate decision structure
  validateDecision(decision);

  // Generate hash for immutability
  const content = JSON.stringify({
    ts: decision.ts,
    kind: decision.kind,
    subject: decision.subject,
    payload: decision.payload,
  });
  const hash = crypto.createHash('sha256').update(content).digest('hex');

  try {
    const entry = await prisma.bickfordLedger.create({
      data: {
        ts: decision.ts,
        kind: decision.kind,
        subject: decision.subject,
        payloadJson: JSON.stringify(decision.payload),
        hash,
        parentId: decision.parentId,
      },
    });

    logger.info('Ledger entry written', {
      id: entry.id,
      kind: decision.kind,
      subject: decision.subject,
      hash,
    });

    return entry.id;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Failed to write ledger entry', {
      error: errorMessage,
      decision,
    });
    throw new Error(`Ledger write failed: ${errorMessage}`);
  }
}

/**
 * Query ledger entries by kind and time range.
 */
export async function queryLedger(opts: {
  kind?: string;
  subject?: string;
  after?: string; // ISO timestamp
  before?: string;
  limit?: number;
}) {
  const where: unknown = {};

  if (opts.kind) where.kind = opts.kind;
  if (opts.subject) where.subject = { contains: opts.subject };
  if (opts.after || opts.before) {
    where.ts = {};
    if (opts.after) where.ts.gte = opts.after;
    if (opts.before) where.ts.lte = opts.before;
  }

  return await prisma.bickfordLedger.findMany({
    where,
    orderBy: { ts: 'desc' },
    take: opts.limit || 100,
  });
}

/**
 * Verify ledger integrity by checking hashes.
 */
export async function verifyLedgerIntegrity(entryId: string): Promise<boolean> {
  const entry = await prisma.bickfordLedger.findUnique({
    where: { id: entryId },
  });

  if (!entry) {
    throw new Error(`Ledger entry ${entryId} not found`);
  }

  const content = JSON.stringify({
    ts: entry.ts,
    kind: entry.kind,
    subject: entry.subject,
    payload: JSON.parse(entry.payloadJson),
  });

  const expectedHash = crypto.createHash('sha256').update(content).digest('hex');

  return entry.hash === expectedHash;
}
