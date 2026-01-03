/**
 * Canon Integrity System
 *
 * Loads and verifies the Bickford canon (CANON.md + CANON.meta.json).
 * Enforces hash-based integrity checking on every execution.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { Canon, CanonMeta } from './types';
import { logger } from './logger';

const CANON_DIR = path.join(process.cwd(), 'canon');
const CANON_PATH = path.join(CANON_DIR, 'CANON.md');
const META_PATH = path.join(CANON_DIR, 'CANON.meta.json');

/**
 * Compute SHA-256 hash of a string
 */
export function computeHash(content: string): string {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

/**
 * Load CANON.md content from filesystem
 */
function loadCanonContent(): string {
  try {
    return fs.readFileSync(CANON_PATH, 'utf-8');
  } catch (error: unknown) {
    logger.error('Failed to load CANON.md', { error: error.message, path: CANON_PATH });
    throw new Error(`CANON.md not found at ${CANON_PATH}`);
  }
}

/**
 * Load CANON.meta.json from filesystem
 */
function loadCanonMeta(): CanonMeta {
  try {
    const content = fs.readFileSync(META_PATH, 'utf-8');
    return JSON.parse(content) as CanonMeta;
  } catch (error: unknown) {
    logger.error('Failed to load CANON.meta.json', { error: error.message, path: META_PATH });
    throw new Error(`CANON.meta.json not found or invalid at ${META_PATH}`);
  }
}

/**
 * Verify canon integrity by comparing computed hash with metadata hash
 */
export function verifyCanonIntegrity(content: string, meta: CanonMeta): boolean {
  const computedHash = computeHash(content);
  const isValid = computedHash === meta.sha256;

  if (!isValid) {
    logger.error('Canon integrity violation', {
      expectedHash: meta.sha256,
      computedHash,
      status: 'HASH_MISMATCH',
    });
  }

  return isValid;
}

/**
 * Parse canon rules from content
 * Extracts structured rules from markdown sections
 */
function parseCanonRules(content: string) {
  // Simple rule extraction - looks for headers and key patterns
  const rules = [];

  // Admissibility Laws
  const lawMatches = content.matchAll(/### Law \d+: (.+)\n(.+)/g);
  for (const match of lawMatches) {
    rules.push({
      id: `law-${match[1].toLowerCase().replace(/\s+/g, '-')}`,
      category: 'invariant' as const,
      description: `${match[1]}: ${match[2]}`,
      enforcement: 'hard' as const,
    });
  }

  // Invariants
  const invMatches = content.matchAll(/### Invariant \d+: (.+)\n```\n([\s\S]+?)\n```/g);
  for (const match of invMatches) {
    rules.push({
      id: `invariant-${match[1].toLowerCase().replace(/\s+/g, '-')}`,
      category: 'invariant' as const,
      description: match[1],
      enforcement: 'hard' as const,
    });
  }

  // Promotion Gates
  const gateMatches = content.matchAll(/### Gate \d+: (.+)\n([\s\S]+?)(?=###|\n---)/g);
  for (const match of gateMatches) {
    rules.push({
      id: `gate-${match[1].toLowerCase().replace(/\s+/g, '-')}`,
      category: 'gate' as const,
      description: match[1],
      enforcement: 'hard' as const,
    });
  }

  return rules;
}

/**
 * Load and verify canon
 *
 * @throws {Error} If canon cannot be loaded or integrity check fails
 * @returns {Canon} Verified canon object
 */
export function loadCanon(): Canon {
  logger.info('Loading canon', { path: CANON_PATH });

  const content = loadCanonContent();
  const meta = loadCanonMeta();

  // Verify integrity
  const isValid = verifyCanonIntegrity(content, meta);

  if (!isValid) {
    const error = new Error(
      'Canon integrity check FAILED. ' +
        'Computed hash does not match CANON.meta.json. ' +
        'Execution ABORTED per Invariant 2.'
    );
    logger.error('Canon integrity failure - ABORT', {
      expectedHash: meta.sha256,
      computedHash: computeHash(content),
      status: 'ABORT',
    });
    throw error;
  }

  // Status check
  if (meta.status !== 'LOCKED') {
    logger.warn('Canon status is not LOCKED', { status: meta.status });
  }

  // Parse rules
  const rules = parseCanonRules(content);

  logger.info('Canon loaded and verified', {
    version: meta.version,
    hash: meta.sha256.substring(0, 16) + '...',
    rulesCount: rules.length,
    status: 'VERIFIED',
  });

  return {
    content,
    meta,
    rules,
  };
}

/**
 * Get current canon hash (without loading full content)
 * Useful for quick hash checks
 */
export function getCurrentCanonHash(): string {
  const content = loadCanonContent();
  return computeHash(content);
}

/**
 * Verify canon hash matches expected value
 */
export function verifyCanonHash(expectedHash: string): boolean {
  const currentHash = getCurrentCanonHash();
  return currentHash === expectedHash;
}

/**
 * Get canon metadata only (without content)
 */
export function getCanonMeta(): CanonMeta {
  return loadCanonMeta();
}

/**
 * Check if canon files exist
 */
export function canonExists(): boolean {
  return fs.existsSync(CANON_PATH) && fs.existsSync(META_PATH);
}
