import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { loadLockSpec } from '@/lib/lock/spec';
import { validateLockSpec } from '@/lib/lock/validate';

export type LedgerEventType = 'CREATE' | 'AMEND' | 'SUPERSEDE';

export type AppendLedgerArgs = {
  tenant: string; // e.g., "jake", "billy"
  command: string; // e.g., "DEFINE", "GAP", "FREEZE", "SIM", "SCORE", "OPTR", "T2V", "LEDGER", "PROOF", "SHIP"
  event_type: LedgerEventType;
  payload: unknown;
  prev_hash?: string | null;
};

/**
 * Append an immutable event to the ledger.
 * Enforces PROMPTS_EQUALS_STORAGE and append-only constraints.
 * Throws if LOCK_SPEC is invalid or axioms are violated.
 */
export async function appendLedgerEvent(args: AppendLedgerArgs) {
  const { spec } = loadLockSpec();

  // Validate spec is still valid (fail closed)
  validateLockSpec(spec);

  // Enforce PROMPTS_EQUALS_STORAGE axiom
  if (spec.axioms?.PROMPTS_EQUALS_STORAGE !== true) {
    throw new Error('LOCK violation: PROMPTS_EQUALS_STORAGE must be true');
  }

  // Validate command exists in defines
  const validCommands = new Set((spec.defines?.commands || []).map((c) => c.id));
  if (!validCommands.has(args.command)) {
    throw new Error(`Invalid command "${args.command}": not in LOCK_SPEC.defines.commands`);
  }

  // Validate event type
  const validEventTypes = (spec.storage_rules as { events?: string[] } | undefined)?.events || [
    'CREATE',
    'AMEND',
    'SUPERSEDE',
  ];
  if (!validEventTypes.includes(args.event_type)) {
    throw new Error(
      `Invalid event_type "${args.event_type}": must be one of ${validEventTypes.join(', ')}`
    );
  }

  // Serialize payload and compute hash
  const payloadStr = JSON.stringify(args.payload);
  const hash = crypto.createHash('sha256').update(payloadStr).digest('hex');

  // Create ledger entry
  const entry = await prisma.ledger.create({
    data: {
      tenant: args.tenant,
      command: args.command,
      eventType: args.event_type,
      payload: payloadStr,
      hash,
      prevHash: args.prev_hash ?? null,
      lockedAt: spec.locked_at,
    },
  });

  return {
    id: entry.id,
    hash: entry.hash,
    created_at: entry.createdAt.toISOString(),
  };
}

/**
 * Retrieve ledger entries for a tenant and/or command.
 * Returns latest-first by default (LATEST_PLUS_LINEAGE).
 */
export async function getLedgerEvents(filters?: {
  tenant?: string;
  command?: string;
  limit?: number;
}) {
  const { tenant, command, limit = 100 } = filters || {};

  const where: {
    tenant?: string;
    command?: string;
  } = {};
  if (tenant) where.tenant = tenant;
  if (command) where.command = command;

  const entries = await prisma.ledger.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return entries.map(
    (e: {
      id: string;
      tenant: string;
      command: string;
      eventType: string;
      hash: string;
      prevHash: string | null;
      payload: string;
      lockedAt: string | null;
      createdAt: Date;
    }) => ({
      id: e.id,
      tenant: e.tenant,
      command: e.command,
      event_type: e.eventType,
      hash: e.hash,
      prev_hash: e.prevHash,
      payload: JSON.parse(e.payload),
      locked_at: e.lockedAt,
      created_at: e.createdAt.toISOString(),
    })
  );
}

/**
 * Verify ledger chain integrity: each event's prevHash must match previous event's hash.
 */
export async function verifyLedgerChain(
  tenant: string
): Promise<{ valid: boolean; errors: string[] }> {
  const entries = await prisma.ledger.findMany({
    where: { tenant },
    orderBy: { createdAt: 'asc' },
  });

  const errors: string[] = [];

  for (let i = 1; i < entries.length; i++) {
    const current = entries[i];
    const previous = entries[i - 1];

    if (current.prevHash && current.prevHash !== previous.hash) {
      errors.push(
        `Chain break at entry ${current.id}: prevHash "${current.prevHash}" ` +
          `does not match previous hash "${previous.hash}"`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Compute the current chain hash for a tenant (SHA256 of all hashes concatenated).
 */
export async function getCurrentChainHash(tenant: string): Promise<string> {
  const entries = await prisma.ledger.findMany({
    where: { tenant },
    orderBy: { createdAt: 'asc' },
    select: { hash: true },
  });

  const combined = entries.map((e) => e.hash).join(':');
  return crypto.createHash('sha256').update(combined).digest('hex');
}
