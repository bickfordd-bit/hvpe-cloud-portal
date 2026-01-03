import { NextRequest, NextResponse } from 'next/server';
import { apiSuccess, apiError } from '@/lib/apiResponse';
import { logger } from '@/lib/logger';
import fs from 'fs';
import path from 'path';
import yaml from 'yaml';

const KNOWLEDGE_DIR = path.join(process.cwd(), '.github', 'knowledge');
const ENTRIES_DIR = path.join(KNOWLEDGE_DIR, 'entries');

interface KnowledgeEntry {
  action: {
    id: string;
    timestamp: string;
    type: string;
  };
  intent: {
    description: string;
    context?: string;
  };
  enables?: string[];
  depends_on?: Array<{ action: string; why: string }>;
  unlocks?: Array<{ action: string; why: string }>;
  implementation: {
    approach: string;
    why_this_sequence?: string[];
  };
  proof: string[];
  lessons?: string[];
  coaching_notes?: string;
  related_ledger_entries?: string[];
}

function loadEntries(): KnowledgeEntry[] {
  if (!fs.existsSync(ENTRIES_DIR)) {
    return [];
  }

  const entries: KnowledgeEntry[] = [];
  const files = fs.readdirSync(ENTRIES_DIR);

  for (const file of files) {
    if (file.endsWith('.yml') || file.endsWith('.yaml')) {
      try {
        const content = fs.readFileSync(path.join(ENTRIES_DIR, file), 'utf8');
        const entry = yaml.parse(content) as KnowledgeEntry;
        entries.push(entry);
      } catch (error: any) {
        logger.warn(`Failed to load knowledge entry ${file}`, { error: error.message });
      }
    }
  }

  return entries;
}

/**
 * Build dependency chain for an action
 */
function buildDependencyChain(
  actionId: string,
  entries: KnowledgeEntry[],
  visited: Set<string> = new Set()
): any {
  if (visited.has(actionId)) {
    return { cycle: true, chain: [] };
  }

  visited.add(actionId);

  const entry = entries.find(e => e.action?.id === actionId);
  if (!entry) {
    return { chain: null, error: 'Action not found' };
  }

  const upstream: any[] = [];
  const downstream: any[] = [];

  // Find upstream dependencies
  if (entry.depends_on) {
    for (const dep of entry.depends_on) {
      const depChain = buildDependencyChain(dep.action, entries, new Set(visited));
      upstream.push({
        action: dep.action,
        why: dep.why,
        upstream: depChain.chain
      });
    }
  }

  // Find downstream unlocks
  if (entry.unlocks) {
    for (const unlock of entry.unlocks) {
      downstream.push({
        action: unlock.action,
        why: unlock.why
      });
    }
  }

  return {
    chain: {
      action: entry.action,
      intent: entry.intent,
      upstream,
      downstream
    }
  };
}

/**
 * Get dependency graph for an action
 * GET /api/knowledge/deps?action=action-id
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const actionId = searchParams.get('action');

    if (!actionId) {
      return NextResponse.json(
        apiError(new Error('Missing required parameter: action')),
        { status: 400 }
      );
    }

    logger.info('Dependency chain request', { actionId });

    const entries = loadEntries();
    const result = buildDependencyChain(actionId, entries);

    if (result.cycle) {
      logger.warn('Dependency cycle detected', { actionId });
      return NextResponse.json(
        apiSuccess({ ...result, warning: 'Dependency cycle detected' })
      );
    }

    if (result.error) {
      return NextResponse.json(
        apiError(new Error(result.error)),
        { status: 404 }
      );
    }

    return NextResponse.json(apiSuccess(result));
  } catch (error: any) {
    logger.error('Dependency chain failed', { error: error.message });
    return NextResponse.json(apiError(error), { status: 500 });
  }
}
