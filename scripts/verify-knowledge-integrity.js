#!/usr/bin/env node

/**
 * Knowledge Integrity Verification Script
 * 
 * Validates:
 * - YAML schema compliance
 * - No dependency cycles
 * - Proof artifacts referenced
 * - Index consistency
 * 
 * Usage:
 *   node scripts/verify-knowledge-integrity.js
 */

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

const KNOWLEDGE_DIR = path.join(__dirname, '..', '.github', 'knowledge');
const ENTRIES_DIR = path.join(KNOWLEDGE_DIR, 'entries');
const SCHEMA_FILE = path.join(KNOWLEDGE_DIR, 'schema.json');
const INDEX_FILE = path.join(KNOWLEDGE_DIR, 'index.yml');

let errorCount = 0;
let warningCount = 0;

function error(message) {
  console.error(`❌ ERROR: ${message}`);
  errorCount++;
}

function warning(message) {
  console.warn(`⚠️  WARNING: ${message}`);
  warningCount++;
}

function success(message) {
  console.log(`✅ ${message}`);
}

/**
 * Load schema
 */
function loadSchema() {
  try {
    return JSON.parse(fs.readFileSync(SCHEMA_FILE, 'utf8'));
  } catch (err) {
    error(`Failed to load schema: ${err.message}`);
    return null;
  }
}

/**
 * Validate entry against schema
 */
function validateSchema(entry, filename) {
  const schema = loadSchema();
  if (!schema) return false;
  
  let valid = true;
  
  // Check required top-level fields
  const required = schema.required || [];
  for (const field of required) {
    if (!entry[field]) {
      error(`${filename}: Missing required field '${field}'`);
      valid = false;
    }
  }
  
  // Check action fields
  if (entry.action) {
    const actionRequired = schema.properties.action.required || [];
    for (const field of actionRequired) {
      if (!entry.action[field]) {
        error(`${filename}: Missing required action field '${field}'`);
        valid = false;
      }
    }
    
    // Validate action type
    const validTypes = schema.properties.action.properties.type.enum || [];
    if (entry.action.type && !validTypes.includes(entry.action.type)) {
      error(`${filename}: Invalid action type '${entry.action.type}'`);
      valid = false;
    }
  }
  
  // Check intent fields
  if (entry.intent) {
    const intentRequired = schema.properties.intent.required || [];
    for (const field of intentRequired) {
      if (!entry.intent[field]) {
        error(`${filename}: Missing required intent field '${field}'`);
        valid = false;
      }
    }
  }
  
  return valid;
}

/**
 * Load all entries
 */
function loadEntries() {
  if (!fs.existsSync(ENTRIES_DIR)) {
    error('Entries directory does not exist');
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
      } catch (err) {
        error(`Failed to parse ${file}: ${err.message}`);
      }
    }
  }

  return entries;
}

/**
 * Check for dependency cycles
 */
function checkDependencyCycles(entries) {
  function hasCycle(actionId, visited = new Set(), recursionStack = new Set()) {
    if (recursionStack.has(actionId)) {
      return true; // Cycle detected
    }
    
    if (visited.has(actionId)) {
      return false; // Already checked this path
    }
    
    visited.add(actionId);
    recursionStack.add(actionId);
    
    const entry = entries.find(e => e.action?.id === actionId);
    if (entry && entry.depends_on) {
      for (const dep of entry.depends_on) {
        if (hasCycle(dep.action, visited, recursionStack)) {
          return true;
        }
      }
    }
    
    recursionStack.delete(actionId);
    return false;
  }
  
  let cyclesFound = false;
  
  for (const entry of entries) {
    const actionId = entry.action?.id;
    if (actionId && hasCycle(actionId)) {
      error(`Dependency cycle detected involving: ${actionId}`);
      cyclesFound = true;
    }
  }
  
  return !cyclesFound;
}

/**
 * Validate proof artifacts
 */
function validateProofArtifacts(entries) {
  for (const entry of entries) {
    if (!entry.proof || entry.proof.length === 0) {
      warning(`${entry._filename}: No proof artifacts provided`);
    }
  }
}

/**
 * Validate index consistency
 */
function validateIndex(entries) {
  if (!fs.existsSync(INDEX_FILE)) {
    warning('Index file does not exist');
    return;
  }
  
  try {
    const indexContent = fs.readFileSync(INDEX_FILE, 'utf8');
    const index = yaml.parse(indexContent);
    
    // Check total count
    if (index.total_entries !== entries.length) {
      warning(`Index total_entries (${index.total_entries}) doesn't match actual entries (${entries.length})`);
    }
    
    // Check each entry is in index
    for (const entry of entries) {
      const actionId = entry.action?.id;
      const inIndex = index.entries?.some(e => e.id === actionId);
      if (!inIndex) {
        warning(`Entry ${actionId} not found in index`);
      }
    }
    
    // Check category counts
    const categoryCounts = {};
    for (const entry of entries) {
      const type = entry.action?.type || 'unknown';
      categoryCounts[type] = (categoryCounts[type] || 0) + 1;
    }
    
    for (const [type, count] of Object.entries(categoryCounts)) {
      if (index.categories?.[type] !== count) {
        warning(`Index category count for ${type} (${index.categories?.[type]}) doesn't match actual (${count})`);
      }
    }
  } catch (err) {
    error(`Failed to validate index: ${err.message}`);
  }
}

/**
 * Check for orphaned dependencies
 */
function checkOrphanedDependencies(entries) {
  const allIds = new Set(entries.map(e => e.action?.id).filter(Boolean));
  
  for (const entry of entries) {
    if (entry.depends_on) {
      for (const dep of entry.depends_on) {
        if (!allIds.has(dep.action)) {
          warning(`${entry._filename}: Depends on non-existent action '${dep.action}'`);
        }
      }
    }
    
    if (entry.unlocks) {
      for (const unlock of entry.unlocks) {
        // Unlocks can reference future actions, so just log as info
        if (!allIds.has(unlock.action)) {
          // This is expected for future actions
        }
      }
    }
  }
}

/**
 * Main verification
 */
function verify() {
  console.log('🔍 Verifying knowledge base integrity...\n');
  
  const entries = loadEntries();
  console.log(`📚 Loaded ${entries.length} entries\n`);
  
  if (entries.length === 0) {
    warning('No entries found');
  }
  
  console.log('1️⃣  Validating schema compliance...');
  let schemaValid = true;
  for (const entry of entries) {
    if (!validateSchema(entry, entry._filename)) {
      schemaValid = false;
    }
  }
  if (schemaValid) {
    success('All entries comply with schema');
  }
  
  console.log('\n2️⃣  Checking for dependency cycles...');
  if (checkDependencyCycles(entries)) {
    success('No dependency cycles detected');
  }
  
  console.log('\n3️⃣  Validating proof artifacts...');
  validateProofArtifacts(entries);
  success('Proof validation complete');
  
  console.log('\n4️⃣  Validating index consistency...');
  validateIndex(entries);
  success('Index validation complete');
  
  console.log('\n5️⃣  Checking for orphaned dependencies...');
  checkOrphanedDependencies(entries);
  success('Dependency check complete');
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`Errors: ${errorCount}`);
  console.log(`Warnings: ${warningCount}`);
  
  if (errorCount === 0) {
    console.log('\n✨ Knowledge base integrity verified!');
    process.exit(0);
  } else {
    console.log('\n❌ Knowledge base has integrity issues');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  verify();
}

module.exports = { verify, loadEntries, validateSchema, checkDependencyCycles };
