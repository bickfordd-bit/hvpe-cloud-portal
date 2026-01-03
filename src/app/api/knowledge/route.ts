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

/**
 * Load all knowledge entries
 */
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
 * Search knowledge entries
 * GET /api/knowledge?query=text&type=build_fix&limit=10
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    logger.info('Knowledge search request', { query, type, limit });

    let entries = loadEntries();

    // Filter by type
    if (type) {
      entries = entries.filter(e => e.action?.type === type);
    }

    // Filter by query text (search in description, context, lessons, coaching notes)
    if (query) {
      const searchLower = query.toLowerCase();
      entries = entries.filter(e => {
        const description = (e.intent?.description || '').toLowerCase();
        const context = (e.intent?.context || '').toLowerCase();
        const lessons = (e.lessons || []).join(' ').toLowerCase();
        const coaching = (e.coaching_notes || '').toLowerCase();
        const enables = (e.enables || []).join(' ').toLowerCase();
        
        return description.includes(searchLower) ||
               context.includes(searchLower) ||
               lessons.includes(searchLower) ||
               coaching.includes(searchLower) ||
               enables.includes(searchLower);
      });
    }

    // Apply limit
    entries = entries.slice(0, limit);

    return NextResponse.json(apiSuccess({
      total: entries.length,
      entries,
      filters: { query, type, limit }
    }));
  } catch (error: any) {
    logger.error('Knowledge search failed', { error: error.message });
    return NextResponse.json(apiError(error), { status: 500 });
  }
}
