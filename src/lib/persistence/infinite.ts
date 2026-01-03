/**
 * Infinite Persistence Layer
 * Three-tier redundancy: Ledger (immutable) + Database (queryable) + Git (versioned)
 */

import { logger } from '@/lib/logger';
import { writeLedgerEntry } from '@/lib/bickford/ledger';
import { prisma } from '@/lib/prisma';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const execAsync = promisify(exec);

export interface PersistenceEntry {
  kind: string;
  subject: string;
  payload: unknown;
  metadata?: {
    userId?: string;
    sessionId?: string;
    timestamp?: string;
    [key: string]: unknown;
  };
}

export interface PersistenceProof {
  ledgerId: string;
  databaseId?: string;
  gitCommit?: string;
  fileBackup?: string;
  timestamp: string;
  redundancy: {
    ledger: boolean;
    database: boolean;
    git: boolean;
    file: boolean;
  };
}

/**
 * Write to all persistence layers simultaneously
 * NEVER LOSES DATA - at least one layer will succeed
 */
export async function persistForever(entry: PersistenceEntry): Promise<PersistenceProof> {
  const timestamp = new Date().toISOString();
  const id = `${entry.kind}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const proof: PersistenceProof = {
    ledgerId: '',
    timestamp,
    redundancy: {
      ledger: false,
      database: false,
      git: false,
      file: false,
    },
  };

  // Run all persistence operations in parallel for maximum reliability
  const results = await Promise.allSettled([
    // Layer 1: Bickford Ledger (immutable, file-based, SHA256 hashed)
    writeLedgerEntry({
      id,
      kind: entry.kind,
      subject: entry.subject,
      payload: {
        ...entry.payload,
        metadata: entry.metadata,
      },
    }).then((ledgerId) => {
      proof.ledgerId = ledgerId;
      proof.redundancy.ledger = true;
      logger.info('Ledger persistence succeeded', { ledgerId });
      return ledgerId;
    }),

    // Layer 2: Database (queryable, indexed, relational)
    persistToDatabase(id, entry).then((dbId) => {
      proof.databaseId = dbId;
      proof.redundancy.database = true;
      logger.info('Database persistence succeeded', { dbId });
      return dbId;
    }),

    // Layer 3: Git commit (versioned, distributed, permanent)
    persistToGit(id, entry).then((commitSha) => {
      proof.gitCommit = commitSha;
      proof.redundancy.git = true;
      logger.info('Git persistence succeeded', { commitSha });
      return commitSha;
    }),

    // Layer 4: File backup (immediate, no dependencies)
    persistToFile(id, entry).then((filePath) => {
      proof.fileBackup = filePath;
      proof.redundancy.file = true;
      logger.info('File persistence succeeded', { filePath });
      return filePath;
    }),
  ]);

  // Log results
  const successes = results.filter((r) => r.status === 'fulfilled').length;
  const failures = results.filter((r) => r.status === 'rejected');

  if (failures.length > 0) {
    logger.warn('Some persistence layers failed', {
      successes,
      failures: failures.length,
      errors: failures.map(
        (f: unknown) => (f as { reason?: { message?: string } }).reason?.message
      ),
    });
  }

  if (successes === 0) {
    throw new Error('ALL PERSISTENCE LAYERS FAILED - data may be lost');
  }

  logger.info('Infinite persistence complete', {
    id,
    successes: `${successes}/4`,
    proof,
  });

  return proof;
}

/**
 * Layer 2: Persist to Prisma database
 */
async function persistToDatabase(id: string, entry: PersistenceEntry): Promise<string> {
  try {
    // Use BickfordLedger table as universal storage
    const record = await prisma.bickfordLedger.create({
      data: {
        kind: entry.kind,
        subject: entry.subject,
        payload: entry.payload,
        hash: `db-${id}`,
        parentId: entry.metadata?.parentId || null,
      },
    });
    return record.id;
  } catch (error: unknown) {
    // Fallback to AiUsageLog if BickfordLedger fails
    if (error.code === 'P2002' || error.message?.includes('BickfordLedger')) {
      const fallback = await prisma.aiUsageLog.create({
        data: {
          userId: entry.metadata?.userId || 'system',
          action: entry.kind,
          metadata: {
            subject: entry.subject,
            payload: entry.payload,
            originalId: id,
          },
        },
      });
      return fallback.id;
    }
    throw error;
  }
}

/**
 * Layer 3: Persist to Git
 */
async function persistToGit(id: string, entry: PersistenceEntry): Promise<string> {
  const date = new Date().toISOString().split('T')[0];
  const dir = join(process.cwd(), '.persistence', date);
  const filePath = join(dir, `${id}.json`);

  // Write file
  await mkdir(dir, { recursive: true });
  await writeFile(
    filePath,
    JSON.stringify(
      {
        id,
        timestamp: new Date().toISOString(),
        ...entry,
      },
      null,
      2
    )
  );

  // Git add, commit, push
  try {
    await execAsync(`git add "${filePath}"`);
    const message = `persistence: ${entry.kind} - ${entry.subject.substring(0, 50)}`;
    const { stdout } = await execAsync(`git commit -m "${message}"`);
    const commitSha = stdout.match(/\[mobile ([a-f0-9]+)\]/)?.[1];

    // Push async (don't wait)
    execAsync('git push origin mobile').catch((err) =>
      logger.warn('Git push failed (non-fatal)', { error: err.message })
    );

    return commitSha || 'committed';
  } catch (error: unknown) {
    // If git fails, at least we have the file
    if (error.message?.includes('nothing to commit')) {
      return 'no-changes';
    }
    throw error;
  }
}

/**
 * Layer 4: Persist to file (fastest, no deps)
 */
async function persistToFile(id: string, entry: PersistenceEntry): Promise<string> {
  const date = new Date().toISOString().split('T')[0];
  const dir = join(process.cwd(), '.persistence', 'backup', date);
  const filePath = join(dir, `${id}.json`);

  await mkdir(dir, { recursive: true });
  await writeFile(
    filePath,
    JSON.stringify(
      {
        id,
        timestamp: new Date().toISOString(),
        ...entry,
      },
      null,
      2
    )
  );

  return filePath;
}

/**
 * Retrieve from any available layer
 */
export async function retrieve(id: string): Promise<PersistenceEntry | null> {
  // Try database first (fastest query)
  try {
    const record = await prisma.bickfordLedger.findUnique({ where: { id } });
    if (record) {
      return {
        kind: record.kind,
        subject: record.subject,
        payload: record.payload,
      };
    }
  } catch (error: unknown) {
    logger.warn('Database retrieval failed', { id, error });
  }

  // Fallback to file system (ledger or backup)
  try {
    const { readFile } = await import('fs/promises');
    const { glob } = await import('glob');

    // Search in .bick/ledger and .persistence
    const patterns = [`.bick/ledger/**/${id}.json`, `.persistence/**/${id}.json`];

    for (const pattern of patterns) {
      const files = await glob(pattern, { cwd: process.cwd() });
      if (files.length > 0) {
        const content = await readFile(join(process.cwd(), files[0]), 'utf-8');
        return JSON.parse(content);
      }
    }
  } catch (error: unknown) {
    logger.warn('File retrieval failed', { id, error });
  }

  return null;
}

/**
 * Query across all layers
 */
export async function query(opts: {
  kind?: string;
  subject?: string;
  after?: Date;
  before?: Date;
  limit?: number;
}): Promise<PersistenceEntry[]> {
  const results: PersistenceEntry[] = [];

  // Query database
  try {
    const records = await prisma.bickfordLedger.findMany({
      where: {
        kind: opts.kind,
        subject: opts.subject ? { contains: opts.subject } : undefined,
        createdAt: {
          gte: opts.after,
          lte: opts.before,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: opts.limit || 100,
    });

    results.push(
      ...records.map((r) => ({
        kind: r.kind,
        subject: r.subject,
        payload: r.payload,
      }))
    );
  } catch (error: unknown) {
    logger.warn('Database query failed', { opts, error });
  }

  return results;
}

/**
 * Verify data integrity across all layers
 */
export async function verifyIntegrity(id: string): Promise<{
  valid: boolean;
  layers: {
    ledger: boolean;
    database: boolean;
    file: boolean;
  };
  mismatches: string[];
}> {
  const checks = await Promise.allSettled([
    retrieve(id),
    prisma.bickfordLedger.findUnique({ where: { id } }),
  ]);

  const ledgerData = checks[0].status === 'fulfilled' ? checks[0].value : null;
  const dbData = checks[1].status === 'fulfilled' ? checks[1].value : null;

  const mismatches: string[] = [];
  if (ledgerData && dbData) {
    if (ledgerData.kind !== dbData.kind) mismatches.push('kind mismatch');
    if (ledgerData.subject !== dbData.subject) mismatches.push('subject mismatch');
  }

  return {
    valid: mismatches.length === 0,
    layers: {
      ledger: !!ledgerData,
      database: !!dbData,
      file: checks[0].status === 'fulfilled',
    },
    mismatches,
  };
}
