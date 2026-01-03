import { NextRequest, NextResponse } from 'next/server';
import { apiSuccess, apiError } from '@/lib/apiResponse';
import { logger } from '@/lib/logger';
import fs from 'fs';
import path from 'path';
import yaml from 'yaml';

const KNOWLEDGE_DIR = path.join(process.cwd(), '.github', 'knowledge');
const PATTERNS_DIR = path.join(KNOWLEDGE_DIR, 'patterns');

interface Pattern {
  pattern: {
    name: string;
    frequency: number;
  };
  instances: string[];
  common_root_causes?: string[];
  recommended_prevention?: string[];
}

/**
 * Load all pattern files
 */
function loadPatterns(): Pattern[] {
  if (!fs.existsSync(PATTERNS_DIR)) {
    return [];
  }

  const patterns: Pattern[] = [];
  const files = fs.readdirSync(PATTERNS_DIR);

  for (const file of files) {
    if (file.endsWith('.yml') || file.endsWith('.yaml')) {
      try {
        const content = fs.readFileSync(path.join(PATTERNS_DIR, file), 'utf8');
        const pattern = yaml.parse(content) as Pattern;
        patterns.push(pattern);
      } catch (error: any) {
        logger.warn(`Failed to load pattern ${file}`, { error: error.message });
      }
    }
  }

  return patterns;
}

/**
 * Get recurring patterns
 * GET /api/knowledge/patterns
 */
export async function GET(req: NextRequest) {
  try {
    logger.info('Patterns request');

    const patterns = loadPatterns();

    // Sort by frequency (highest first)
    patterns.sort((a, b) => b.pattern.frequency - a.pattern.frequency);

    return NextResponse.json(apiSuccess({
      total: patterns.length,
      patterns
    }));
  } catch (error: any) {
    logger.error('Patterns request failed', { error: error.message });
    return NextResponse.json(apiError(error), { status: 500 });
  }
}
