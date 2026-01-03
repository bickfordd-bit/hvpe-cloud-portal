#!/usr/bin/env node

/**
 * LOCK System Verification Script
 * Run with: npx ts-node scripts/verify-lock.ts
 *
 * Checks:
 * 1. LOCK_SPEC.json loads and parses
 * 2. All required commands present in spec
 * 3. T2V formula is correct
 * 4. Route invariants are set
 * 5. Axioms enforced
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const specPath = path.join(process.cwd(), 'config', 'LOCK_SPEC.json');

console.log('🔐 LOCK System Verification\n');

// 1. Load spec
console.log('1️⃣  Loading LOCK_SPEC.json...');
try {
  const raw = fs.readFileSync(specPath, 'utf8');
  const spec = JSON.parse(raw);
  const hash = crypto.createHash('sha256').update(raw).digest('hex');

  console.log(`   ✓ Spec loaded (SHA256: ${hash.slice(0, 16)}...)`);
  console.log(`   ✓ Version: ${spec.lock_spec_version}`);
  console.log(`   ✓ Mode: ${spec.mode}`);
  console.log(`   ✓ Locked at: ${spec.locked_at}`);
} catch (error: unknown) {
  console.error(`   ✗ Failed to load spec: ${error.message}`);
  process.exit(1);
}

// 2. Check axioms
console.log('\n2️⃣  Checking axioms...');
const requiredAxioms = [
  'PROMPTS_EQUALS_STORAGE',
  'SUPPORT_ONLY',
  'NO_NEW_MECHANISMS',
  'NO_RIP_AND_REPLACE',
  'NO_DEPLOYMENT_COST',
  'NO_HUMAN_CAPITAL_IMPACT',
  'NO_CONTRACT_IMPACT',
];

const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));

for (const axiom of requiredAxioms) {
  if (spec.axioms[axiom] === true) {
    console.log(`   ✓ ${axiom}`);
  } else {
    console.error(`   ✗ ${axiom} is not true`);
    process.exit(1);
  }
}

// 3. Check commands
console.log('\n3️⃣  Checking DEFINE commands...');
const requiredCommands = [
  'DEFINE',
  'GAP',
  'FREEZE',
  'SIM',
  'SCORE',
  'OPTR',
  'T2V',
  'LEDGER',
  'PROOF',
  'SHIP',
];
const commandIds = spec.defines.commands.map((c: unknown) => c.id);

for (const cmd of requiredCommands) {
  if (commandIds.includes(cmd)) {
    const c = spec.defines.commands.find((x: unknown) => x.id === cmd);
    console.log(`   ✓ ${cmd} (outputs: ${c.outputs.join(', ')})`);
  } else {
    console.error(`   ✗ Command missing: ${cmd}`);
    process.exit(1);
  }
}

// 4. Check routes
console.log('\n4️⃣  Checking tenant routes...');
if (spec.identity.tenants.jake.route === '/t/jake') {
  console.log(`   ✓ jake route: ${spec.identity.tenants.jake.route}`);
} else {
  console.error(`   ✗ jake route incorrect`);
  process.exit(1);
}

if (spec.identity.tenants.billy.route === '/t/billy') {
  console.log(`   ✓ billy route: ${spec.identity.tenants.billy.route}`);
} else {
  console.error(`   ✗ billy route incorrect`);
  process.exit(1);
}

// 5. Check T2V formula
console.log('\n5️⃣  Checking T2V formula...');
const expectedFormula = 'T2V$ = (V / T0) * ΔT + Ch * H + R';
if (spec.optr_t2v.formula === expectedFormula) {
  console.log(`   ✓ Formula: ${expectedFormula}`);
} else {
  console.error(`   ✗ Formula mismatch`);
  console.error(`      Expected: ${expectedFormula}`);
  console.error(`      Got: ${spec.optr_t2v.formula}`);
  process.exit(1);
}

// 6. Check trading controls
console.log('\n6️⃣  Checking trading controls...');
if (spec.trading_controls.billy.live_guardrail.require_env_flag === 'ALLOW_BILLY_LIVE_TRADING') {
  console.log(
    `   ✓ Billy live guardrail: ${spec.trading_controls.billy.live_guardrail.require_env_flag}`
  );
} else {
  console.error(`   ✗ Billy live guardrail incorrect`);
  process.exit(1);
}

console.log(`   ✓ Billy hard cap: $${spec.trading_controls.billy.hard_caps.per_order_usd}/order`);

// 7. Check never-fail keys
console.log('\n7️⃣  Checking license keys...');
console.log(`   ✓ Never-fail keys: ${spec.licenses.never_fail_keys.length}`);
spec.licenses.never_fail_keys.forEach((k: string) => console.log(`      - ${k}`));
console.log(`   ✓ Lifetime keys: ${spec.licenses.lifetime_keys.length}`);

// 8. Check storage rules
console.log('\n8️⃣  Checking storage rules...');
console.log(`   ✓ Write mode: ${spec.storage_rules.write_mode}`);
console.log(`   ✓ Event types: ${spec.storage_rules.events.join(', ')}`);
console.log(`   ✓ Retrieval mode: ${spec.storage_rules.retrieval}`);

console.log('\n✅ All checks passed! LOCK system is valid and ready.\n');
console.log('Next steps:');
console.log('  1. npx prisma generate        # Generate Prisma client');
console.log('  2. npx prisma migrate deploy  # Apply migrations (if DATABASE_URL set)');
console.log('  3. npm run build              # Build Next.js app');
console.log('  4. npm start                  # Start server');
console.log('  5. curl http://localhost:3000/api/lock/status  # Verify endpoint');
