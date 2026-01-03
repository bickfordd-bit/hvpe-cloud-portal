/**
 * Ledger System
 *
 * Implements hash-chained, append-only ledger for execution tracking.
 * Stores all intent executions with immutable proof of decisions.
 */

import * as fs from 'fs';
import * as path from 'path';
import { LedgerEntry, Intent, Artifact, ExecutionResult } from './types';
import { computeHash } from './canon';
import { logger } from './logger';

const LEDGER_DIR = path.join(process.cwd(), '.bick', 'ledger');

/**
 * Ensure ledger directory exists
 */
function ensureLedgerDir(date: Date): string {
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  const dayDir = path.join(LEDGER_DIR, dateStr);

  if (!fs.existsSync(dayDir)) {
    fs.mkdirSync(dayDir, { recursive: true });
  }

  return dayDir;
}

/**
 * Get the last ledger entry to chain from
 */
function getLastEntry(): LedgerEntry | null {
  try {
    if (!fs.existsSync(LEDGER_DIR)) {
      return null;
    }

    // Get all date directories, sorted descending
    const dateDirs = fs
      .readdirSync(LEDGER_DIR)
      .filter((name) => /^\d{4}-\d{2}-\d{2}$/.test(name))
      .sort()
      .reverse();

    if (dateDirs.length === 0) {
      return null;
    }

    // Check most recent date directory
    for (const dateDir of dateDirs) {
      const dirPath = path.join(LEDGER_DIR, dateDir);
      const files = fs
        .readdirSync(dirPath)
        .filter((name) => name.endsWith('.json'))
        .sort()
        .reverse();

      if (files.length > 0) {
        const lastFile = path.join(dirPath, files[0]);
        const content = fs.readFileSync(lastFile, 'utf-8');
        return JSON.parse(content) as LedgerEntry;
      }
    }

    return null;
  } catch (error: unknown) {
    logger.error('Failed to get last ledger entry', { error: error.message });
    return null;
  }
}

/**
 * Compute hash for ledger entry
 */
function computeEntryHash(entry: Omit<LedgerEntry, 'hash'>): string {
  // Create deterministic string representation
  const data = JSON.stringify({
    id: entry.id,
    timestamp: entry.timestamp,
    intent: entry.intent,
    policyId: entry.policyId,
    canonHash: entry.canonHash,
    outcome: entry.outcome,
    reasoning: entry.reasoning,
    prevHash: entry.prevHash,
  });

  return computeHash(data);
}

/**
 * Generate unique ledger entry ID
 */
function generateEntryId(): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const random = Math.random().toString(36).substring(2, 8);
  return `entry-${timestamp}-${random}`;
}

/**
 * Append entry to ledger
 *
 * Creates hash-chained entry and writes to filesystem.
 * Format: .bick/ledger/YYYY-MM-DD/<id>.json
 */
export function appendLedger(
  intent: Intent,
  policyId: string,
  canonHash: string,
  outcome: LedgerEntry['outcome'],
  reasoning: string,
  executionResult?: ExecutionResult
): LedgerEntry {
  logger.info('Appending to ledger', { outcome, policyId });

  const now = new Date();
  const id = generateEntryId();
  const lastEntry = getLastEntry();

  // Build artifacts list
  const artifacts: Artifact[] = [];

  if (executionResult?.commits) {
    for (const commit of executionResult.commits) {
      artifacts.push({
        type: 'commit',
        description: commit.message,
        url: commit.url,
        timestamp: commit.timestamp,
      });
    }
  }

  // Add execution log artifact
  artifacts.push({
    type: 'log',
    description: 'Execution log',
    content: JSON.stringify(executionResult, null, 2),
    timestamp: now.toISOString(),
  });

  // Create entry without hash first
  const entryWithoutHash: Omit<LedgerEntry, 'hash'> = {
    id,
    timestamp: now.toISOString(),
    intent,
    policyId,
    canonHash,
    outcome,
    reasoning,
    artifacts,
    prevHash: lastEntry?.hash || null,
    executionResult: executionResult
      ? {
          success: executionResult.success,
          status: executionResult.status,
          durationMs: executionResult.durationMs,
          error: executionResult.error,
        }
      : undefined,
  };

  // Compute hash including previous hash (chain)
  const hash = computeEntryHash(entryWithoutHash);

  const entry: LedgerEntry = {
    ...entryWithoutHash,
    hash,
  };

  // Write to filesystem
  const dayDir = ensureLedgerDir(now);
  const filename = `${id}.json`;
  const filepath = path.join(dayDir, filename);

  try {
    fs.writeFileSync(filepath, JSON.stringify(entry, null, 2), 'utf-8');
    logger.info('Ledger entry written', {
      id,
      hash: hash.substring(0, 16) + '...',
      path: filepath,
    });
  } catch (error: unknown) {
    logger.error('Failed to write ledger entry', {
      error: error.message,
      path: filepath,
    });
    throw new Error(`Failed to write ledger entry: ${error.message}`);
  }

  return entry;
}

/**
 * Query ledger entries
 */
export function queryLedger(options: {
  startDate?: string;
  endDate?: string;
  intentType?: Intent['intentType'];
  outcome?: LedgerEntry['outcome'];
  limit?: number;
}): LedgerEntry[] {
  const entries: LedgerEntry[] = [];

  try {
    if (!fs.existsSync(LEDGER_DIR)) {
      return entries;
    }

    // Get all date directories
    const dateDirs = fs
      .readdirSync(LEDGER_DIR)
      .filter((name) => /^\d{4}-\d{2}-\d{2}$/.test(name))
      .sort()
      .reverse(); // Most recent first

    // Apply date filters
    const filteredDirs = dateDirs.filter((dateDir) => {
      if (options.startDate && dateDir < options.startDate) return false;
      if (options.endDate && dateDir > options.endDate) return false;
      return true;
    });

    // Read entries from filtered directories
    for (const dateDir of filteredDirs) {
      const dirPath = path.join(LEDGER_DIR, dateDir);
      const files = fs
        .readdirSync(dirPath)
        .filter((name) => name.endsWith('.json'))
        .sort()
        .reverse();

      for (const file of files) {
        const filepath = path.join(dirPath, file);
        const content = fs.readFileSync(filepath, 'utf-8');
        const entry = JSON.parse(content) as LedgerEntry;

        // Apply filters
        if (options.intentType && entry.intent.intentType !== options.intentType) {
          continue;
        }
        if (options.outcome && entry.outcome !== options.outcome) {
          continue;
        }

        entries.push(entry);

        // Check limit
        if (options.limit && entries.length >= options.limit) {
          return entries;
        }
      }
    }

    return entries;
  } catch (error: unknown) {
    logger.error('Failed to query ledger', { error: error.message });
    return entries;
  }
}

/**
 * Verify ledger integrity (check hash chain)
 */
export function verifyLedgerIntegrity(): {
  valid: boolean;
  brokenChain?: { entry: string; expected: string; actual: string };
  totalEntries: number;
} {
  try {
    const entries = queryLedger({});

    if (entries.length === 0) {
      return { valid: true, totalEntries: 0 };
    }

    // Reverse to check from oldest to newest
    entries.reverse();

    let prevHash: string | null = null;

    for (const entry of entries) {
      // Verify prevHash points to previous entry
      if (entry.prevHash !== prevHash) {
        return {
          valid: false,
          brokenChain: {
            entry: entry.id,
            expected: prevHash || 'null',
            actual: entry.prevHash || 'null',
          },
          totalEntries: entries.length,
        };
      }

      // Verify entry hash
      const { hash, ...entryWithoutHash } = entry;
      const computedHash = computeEntryHash(entryWithoutHash);

      if (computedHash !== hash) {
        return {
          valid: false,
          brokenChain: {
            entry: entry.id,
            expected: computedHash,
            actual: hash,
          },
          totalEntries: entries.length,
        };
      }

      prevHash = entry.hash;
    }

    return { valid: true, totalEntries: entries.length };
  } catch (error: unknown) {
    logger.error('Failed to verify ledger integrity', { error: error.message });
    return { valid: false, totalEntries: 0 };
  }
}

/**
 * Get ledger statistics
 */
export function getLedgerStats(): {
  totalEntries: number;
  byOutcome: Record<LedgerEntry['outcome'], number>;
  byIntentType: Record<string, number>;
  oldestEntry?: string;
  newestEntry?: string;
} {
  const entries = queryLedger({});

  const stats = {
    totalEntries: entries.length,
    byOutcome: {
      ALLOW: 0,
      DENY: 0,
      FAIL: 0,
    } as Record<LedgerEntry['outcome'], number>,
    byIntentType: {} as Record<string, number>,
    oldestEntry: entries.length > 0 ? entries[entries.length - 1].timestamp : undefined,
    newestEntry: entries.length > 0 ? entries[0].timestamp : undefined,
  };

  for (const entry of entries) {
    stats.byOutcome[entry.outcome]++;
    stats.byIntentType[entry.intent.intentType] =
      (stats.byIntentType[entry.intent.intentType] || 0) + 1;
  }

  return stats;
}
