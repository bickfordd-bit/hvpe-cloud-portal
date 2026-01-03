#!/usr/bin/env node

/**
 * Knowledge CLI - Query interface for knowledge base
 * 
 * Usage:
 *   node scripts/knowledge-cli.js query --type build_fix
 *   node scripts/knowledge-cli.js query --enables "auto-merge"
 *   node scripts/knowledge-cli.js deps --action "fix-codex-sync"
 *   node scripts/knowledge-cli.js coach --error "Module not found"
 *   node scripts/knowledge-cli.js list
 *   node scripts/knowledge-cli.js patterns
 */

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

const KNOWLEDGE_DIR = path.join(__dirname, '..', '.github', 'knowledge');
const ENTRIES_DIR = path.join(KNOWLEDGE_DIR, 'entries');
const PATTERNS_DIR = path.join(KNOWLEDGE_DIR, 'patterns');
const INDEX_FILE = path.join(KNOWLEDGE_DIR, 'index.yml');

/**
 * Load all knowledge entries
 */
function loadEntries() {
  if (!fs.existsSync(ENTRIES_DIR)) {
    return [];
  }

  const entries = [];
  const files = fs.readdirSync(ENTRIES_DIR);

  for (const file of files) {
    if (file.endsWith('.yml') || file.endsWith('.yaml')) {
      try {
        const content = fs.readFileSync(path.join(ENTRIES_DIR, file), 'utf8');
        const entry = yaml.parse(content);
        entries.push({ ...entry, _filename: file });
      } catch (error) {
        console.error(`Error loading ${file}:`, error.message);
      }
    }
  }

  return entries;
}

/**
 * Load patterns
 */
function loadPatterns() {
  if (!fs.existsSync(PATTERNS_DIR)) {
    return [];
  }

  const patterns = [];
  const files = fs.readdirSync(PATTERNS_DIR);

  for (const file of files) {
    if (file.endsWith('.yml') || file.endsWith('.yaml')) {
      try {
        const content = fs.readFileSync(path.join(PATTERNS_DIR, file), 'utf8');
        const pattern = yaml.parse(content);
        patterns.push({ ...pattern, _filename: file });
      } catch (error) {
        console.error(`Error loading pattern ${file}:`, error.message);
      }
    }
  }

  return patterns;
}

/**
 * Query entries by type
 */
function queryByType(type) {
  const entries = loadEntries();
  return entries.filter(e => e.action?.type === type);
}

/**
 * Query entries by what they enable
 */
function queryByEnables(capability) {
  const entries = loadEntries();
  const searchLower = capability.toLowerCase();
  return entries.filter(e => 
    e.enables?.some(item => item.toLowerCase().includes(searchLower))
  );
}

/**
 * Build dependency chain for an action
 */
function buildDependencyChain(actionId, entries, visited = new Set()) {
  if (visited.has(actionId)) {
    return { cycle: true, chain: [] };
  }

  visited.add(actionId);

  const entry = entries.find(e => e.action?.id === actionId);
  if (!entry) {
    return { chain: [] };
  }

  const upstream = [];
  const downstream = [];

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
 * Get coaching suggestions for an error
 */
function getCoaching(errorText) {
  const entries = loadEntries();
  const searchLower = errorText.toLowerCase();

  // Find entries with similar context or lessons
  const relevant = entries.filter(e => {
    const context = (e.intent?.context || '').toLowerCase();
    const lessons = (e.lessons || []).join(' ').toLowerCase();
    const coaching = (e.coaching_notes || '').toLowerCase();
    
    return context.includes(searchLower) || 
           lessons.includes(searchLower) || 
           coaching.includes(searchLower);
  });

  return relevant;
}

/**
 * List all entries
 */
function listEntries() {
  const entries = loadEntries();
  return entries.map(e => ({
    id: e.action?.id,
    type: e.action?.type,
    timestamp: e.action?.timestamp,
    description: e.intent?.description,
    file: e._filename
  }));
}

/**
 * Display formatted output
 */
function display(title, data) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(title);
  console.log('='.repeat(60));
  console.log(JSON.stringify(data, null, 2));
}

/**
 * Main CLI handler
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
Knowledge CLI - Query the knowledge base

Commands:
  query --type <type>          Query by action type
  query --enables <capability> Query by what action enables
  deps --action <id>           Show dependency chain
  coach --error <text>         Get coaching for error
  list                         List all entries
  patterns                     Show detected patterns

Examples:
  node scripts/knowledge-cli.js query --type build_fix
  node scripts/knowledge-cli.js query --enables "auto-merge"
  node scripts/knowledge-cli.js deps --action "fix-codex-sync"
  node scripts/knowledge-cli.js coach --error "Module not found"
    `);
    process.exit(0);
  }

  const command = args[0];

  try {
    switch (command) {
      case 'query': {
        const flag = args[1];
        const value = args[2];

        if (flag === '--type') {
          const results = queryByType(value);
          display(`Query Results: type=${value}`, results);
        } else if (flag === '--enables') {
          const results = queryByEnables(value);
          display(`Query Results: enables contains "${value}"`, results);
        } else {
          console.error('Unknown query flag. Use --type or --enables');
          process.exit(1);
        }
        break;
      }

      case 'deps': {
        if (args[1] !== '--action') {
          console.error('Usage: deps --action <id>');
          process.exit(1);
        }
        const actionId = args[2];
        const entries = loadEntries();
        const result = buildDependencyChain(actionId, entries);
        
        if (result.cycle) {
          console.error('⚠️  Dependency cycle detected!');
        }
        
        display(`Dependency Chain: ${actionId}`, result);
        break;
      }

      case 'coach': {
        if (args[1] !== '--error') {
          console.error('Usage: coach --error <text>');
          process.exit(1);
        }
        const errorText = args.slice(2).join(' ');
        const results = getCoaching(errorText);
        display(`Coaching Suggestions for: "${errorText}"`, results);
        break;
      }

      case 'list': {
        const results = listEntries();
        display('All Knowledge Entries', results);
        break;
      }

      case 'patterns': {
        const patterns = loadPatterns();
        display('Detected Patterns', patterns);
        break;
      }

      default:
        console.error(`Unknown command: ${command}`);
        console.error('Run without arguments to see usage.');
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  loadEntries,
  loadPatterns,
  queryByType,
  queryByEnables,
  buildDependencyChain,
  getCoaching,
  listEntries
};
