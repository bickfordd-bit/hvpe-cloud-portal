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
 * Get coaching suggestions for an error or issue
 */
function getCoaching(errorText: string, entries: KnowledgeEntry[]) {
  const searchLower = errorText.toLowerCase();

  // Find entries with similar context, lessons, or coaching notes
  const relevant = entries.filter(e => {
    const context = (e.intent?.context || '').toLowerCase();
    const lessons = (e.lessons || []).join(' ').toLowerCase();
    const coaching = (e.coaching_notes || '').toLowerCase();
    const description = (e.intent?.description || '').toLowerCase();
    
    return context.includes(searchLower) || 
           lessons.includes(searchLower) || 
           coaching.includes(searchLower) ||
           description.includes(searchLower);
  });

  // Sort by relevance (count of matches)
  relevant.sort((a, b) => {
    const countMatches = (entry: KnowledgeEntry) => {
      const text = [
        entry.intent?.context || '',
        (entry.lessons || []).join(' '),
        entry.coaching_notes || '',
        entry.intent?.description || ''
      ].join(' ').toLowerCase();
      
      return (text.match(new RegExp(searchLower, 'g')) || []).length;
    };
    
    return countMatches(b) - countMatches(a);
  });

  return relevant;
}

/**
 * Get coaching suggestions
 * GET /api/knowledge/coach?error=text
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const errorText = searchParams.get('error');

    if (!errorText) {
      return NextResponse.json(
        apiError(new Error('Missing required parameter: error')),
        { status: 400 }
      );
    }

    logger.info('Coaching request', { errorText });

    const entries = loadEntries();
    const suggestions = getCoaching(errorText, entries);

    return NextResponse.json(apiSuccess({
      query: errorText,
      suggestions_count: suggestions.length,
      suggestions: suggestions.map(e => ({
        action: e.action,
        intent: e.intent,
        lessons: e.lessons,
        coaching_notes: e.coaching_notes,
        implementation: e.implementation
      }))
    }));
  } catch (error: any) {
    logger.error('Coaching request failed', { error: error.message });
    return NextResponse.json(apiError(error), { status: 500 });
  }
}
