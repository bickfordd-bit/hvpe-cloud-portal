#!/usr/bin/env tsx
/**
 * BCS Scorer CLI
 * 
 * Computes BCS score from ledger events and outputs results.
 * 
 * Usage: npm run bick:score
 */

import { runScorer } from '../src/lib/bick/scorer';

async function main() {
  try {
    console.error('🔄 Computing BCS score...\n');
    
    const score = runScorer();
    
    // Output JSON to stdout
    console.log(JSON.stringify(score, null, 2));
    
    console.error(`\n✅ BCS computed successfully`);
    console.error(`   Score: ${score.BCS.toFixed(2)}`);
    console.error(`   Model: ${(score.BCS_model * 100).toFixed(2)}%`);
    console.error(`   Evidence: ${(score.EvidenceWeight * 100).toFixed(2)}% (${score.evidenceBreakdown.level})`);
    console.error(`   Events: ${score.totalEvents} total`);
    console.error(`\n📁 Output written to:`);
    console.error(`   .bick/canon/bcs-latest.json`);
    console.error(`   .bick/canon/bcs-history.jsonl (appended)`);
    
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('❌ Error computing BCS:', message);
    process.exit(1);
  }
}

main();
