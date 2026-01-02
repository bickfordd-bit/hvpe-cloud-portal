// Timestamp: 2025-12-19T11:02:00-05:00
// Bickford Runtime: Single entrypoint for mode enforcement

import fs from 'fs';
import path from 'path';
import { assertTimestampedAuthority } from './guardrails';
import { logger } from '@/lib/logger';

export interface BickfordMode {
  ts: string;
  mode: "BICKFORD";
  flags: {
    AUTO: boolean;
    PROMPTS_AS_STORAGE: boolean;
    OPTR_TTV: boolean;
    DECISION_CONTINUITY: boolean;
    TRUST_FIRST_GUARDRAILS: boolean;
    MANDATORY_TIMESTAMPS: boolean;
    UI_CONTEXT_AUTOLOAD: boolean;
    EXCEPTION_ONLY_SURFACING: boolean;
  };
  authority: {
    rule: string;
    locked: boolean;
  };
}

let _modeCache: BickfordMode | null = null;

/**
 * Load and validate bickford.mode.json.
 * This is the single source of truth for Bickford runtime behavior.
 */
export function loadBickfordMode(): BickfordMode | null {
  if (_modeCache) return _modeCache;

  try {
    const configPath = path.join(process.cwd(), 'bickford.mode.json');
    if (!fs.existsSync(configPath)) {
      logger.warn('Bickford mode config not found, running in standard mode');
      return null;
    }

    const raw = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(raw) as BickfordMode;

    // Enforce timestamp authority on the config itself
    assertTimestampedAuthority(config, 'bickford.mode.json');

    _modeCache = config;
    logger.info('Bickford mode activated', {
      ts: config.ts,
      flags: config.flags
    });

    return config;
  } catch (error: any) {
    logger.error('Failed to load Bickford mode', { error: error.message });
    // Fail-closed: if mode config is corrupt, don't activate
    return null;
  }
}

/**
 * Check if Bickford mode is active.
 */
export function isBickfordMode(): boolean {
  const mode = loadBickfordMode();
  return mode?.mode === "BICKFORD";
}

/**
 * Get a specific Bickford flag value.
 */
export function getBickfordFlag(flag: keyof BickfordMode['flags']): boolean {
  const mode = loadBickfordMode();
  return mode?.flags[flag] ?? false;
}

/**
 * Enforce Bickford guardrails on incoming data.
 * Use this in API routes to validate requests follow Bickford protocol.
 */
export function enforceBickford(data: any, context: string): void {
  if (!isBickfordMode()) return; // Only enforce when mode is active

  if (getBickfordFlag('MANDATORY_TIMESTAMPS')) {
    assertTimestampedAuthority(data, context);
  }

  logger.info('Bickford guardrails passed', { context });
}
