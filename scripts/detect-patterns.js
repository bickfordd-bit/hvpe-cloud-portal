#!/usr/bin/env node

/**
 * Pattern Detection Script
 * Analyzes knowledge entries to detect recurring patterns
 * 
 * Usage:
 *   node scripts/detect-patterns.js
 */

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

const KNOWLEDGE_DIR = path.join(__dirname, '..', '.github', 'knowledge');
const ENTRIES_DIR = path.join(KNOWLEDGE_DIR, 'entries');
const PATTERNS_DIR = path.join(KNOWLEDGE_DIR, 'patterns');

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
 * Group entries by type
 */
function groupByType(entries) {
  const groups = {};
  
  for (const entry of entries) {
    const type = entry.action?.type || 'unknown';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(entry);
  }
  
  return groups;
}

/**
 * Extract keywords from text
 */
function extractKeywords(text) {
  if (!text) return [];
  
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3);
  
  return [...new Set(words)];
}

/**
 * Find common keywords in a group
 */
function findCommonKeywords(entries, minFrequency = 2) {
  const keywordCounts = {};
  
  for (const entry of entries) {
    const contexts = [
      entry.intent?.context || '',
      entry.intent?.description || '',
      (entry.lessons || []).join(' ')
    ];
    
    const keywords = extractKeywords(contexts.join(' '));
    
    for (const keyword of keywords) {
      keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
    }
  }
  
  return Object.entries(keywordCounts)
    .filter(([_, count]) => count >= minFrequency)
    .sort((a, b) => b[1] - a[1])
    .map(([keyword, count]) => ({ keyword, count }));
}

/**
 * Extract common root causes from a group
 */
function extractRootCauses(entries) {
  const causes = [];
  
  for (const entry of entries) {
    if (entry.intent?.context) {
      causes.push(entry.intent.context);
    }
  }
  
  return causes;
}

/**
 * Extract prevention strategies from lessons
 */
function extractPreventionStrategies(entries) {
  const strategies = new Set();
  
  for (const entry of entries) {
    if (entry.lessons) {
      for (const lesson of entry.lessons) {
        if (lesson.toLowerCase().includes('prevent') ||
            lesson.toLowerCase().includes('avoid') ||
            lesson.toLowerCase().includes('strategy')) {
          strategies.add(lesson);
        }
      }
    }
    
    // Extract from coaching notes
    if (entry.coaching_notes) {
      const lines = entry.coaching_notes.split('\n');
      for (const line of lines) {
        if (line.toLowerCase().includes('prevention') ||
            line.toLowerCase().includes('avoid') ||
            line.toLowerCase().includes('strategy')) {
          strategies.add(line.trim());
        }
      }
    }
  }
  
  return Array.from(strategies);
}

/**
 * Generate pattern file for a group
 */
function generatePattern(type, entries) {
  if (entries.length < 2) {
    return null; // Need at least 2 instances to be a pattern
  }
  
  const commonKeywords = findCommonKeywords(entries);
  const rootCauses = extractRootCauses(entries);
  const preventionStrategies = extractPreventionStrategies(entries);
  
  const pattern = {
    pattern: {
      name: `${type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Pattern`,
      frequency: entries.length,
      type: type,
      detected_at: new Date().toISOString(),
      common_keywords: commonKeywords.slice(0, 10).map(k => k.keyword)
    },
    instances: entries.map(e => e.action?.id || 'unknown'),
    common_root_causes: rootCauses,
    recommended_prevention: preventionStrategies.length > 0 ? preventionStrategies : [
      'Review similar past issues before starting',
      'Follow established patterns from knowledge base',
      'Consult coaching notes for this pattern type'
    ],
    example_entry: entries[0]._filename
  };
  
  return pattern;
}

/**
 * Main pattern detection
 */
function detectPatterns() {
  console.log('🔍 Detecting patterns in knowledge base...\n');
  
  // Ensure patterns directory exists
  if (!fs.existsSync(PATTERNS_DIR)) {
    fs.mkdirSync(PATTERNS_DIR, { recursive: true });
  }
  
  const entries = loadEntries();
  console.log(`📚 Loaded ${entries.length} knowledge entries\n`);
  
  if (entries.length === 0) {
    console.log('No entries found. Add knowledge entries first.');
    return;
  }
  
  const groups = groupByType(entries);
  let patternsDetected = 0;
  
  for (const [type, groupEntries] of Object.entries(groups)) {
    console.log(`📊 Analyzing ${type}: ${groupEntries.length} entries`);
    
    const pattern = generatePattern(type, groupEntries);
    
    if (pattern) {
      const filename = `${type.replace(/_/g, '-')}.yml`;
      const filepath = path.join(PATTERNS_DIR, filename);
      
      fs.writeFileSync(filepath, yaml.stringify(pattern), 'utf8');
      console.log(`   ✅ Pattern saved: ${filename}`);
      patternsDetected++;
    } else {
      console.log(`   ⏭️  Skipped (need 2+ instances)`);
    }
  }
  
  console.log(`\n✨ Detection complete: ${patternsDetected} patterns detected`);
}

// Run if called directly
if (require.main === module) {
  detectPatterns();
}

module.exports = { detectPatterns, loadEntries, groupByType };
