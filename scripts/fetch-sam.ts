#!/usr/bin/env tsx
import { searchSamOpportunities } from '@/lib/sam/client';
import { logger } from '@/lib/logger';

function parseArgs(argv: string[]) {
  const args: Record<string, string> = {};
  argv.forEach((arg) => {
    const [k, v] = arg.split('=');
    if (k && v !== undefined) {
      args[k.replace(/^--/, '')] = v;
    }
  });
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const params = {
    q: args.q || 'cloud OR AI',
    naics: args.naics,
    psc: args.psc,
    type: args.type,
    setAsideCode: args.setAside,
    agencyCode: args.agency,
    postedFrom: args.from,
    postedTo: args.to,
    limit: args.limit ? Number(args.limit) : 10,
    start: args.start ? Number(args.start) : 0,
  } as const;

  try {
    const res = await searchSamOpportunities(params);
    const rows = res.opportunities || [];
    console.log(JSON.stringify({ total: res.totalRecords, rows }, null, 2));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error('Failed to fetch SAM opportunities', { error: msg, params });
    process.exitCode = 1;
  }
}

main();
