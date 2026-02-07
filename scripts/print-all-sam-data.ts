#!/usr/bin/env tsx
/**
 * Print All SAM.gov Data Script
 * 
 * This script fetches and prints all available SAM.gov opportunity data.
 * It supports pagination to retrieve all records and formats output in multiple ways.
 * 
 * Usage:
 *   npm run print-sam              # Print with default query
 *   npm run print-sam -- --all     # Fetch ALL opportunities (paginated)
 *   npm run print-sam -- --format=table  # Table format
 *   npm run print-sam -- --format=json   # JSON format (default)
 *   npm run print-sam -- --format=csv    # CSV format
 *   npm run print-sam -- --q="AI OR cloud" --limit=100
 *   npm run print-sam -- --agency=DOD --type=Solicitation
 * 
 * Options:
 *   --all              Fetch all available records (paginated)
 *   --format=<type>    Output format: json, table, csv (default: json)
 *   --limit=<n>        Records per page (default: 100, max: 1000)
 *   --q=<query>        Search query
 *   --naics=<code>     NAICS code filter
 *   --psc=<code>       PSC code filter
 *   --type=<type>      Notice type (Solicitation, Presolicitation, etc.)
 *   --agency=<code>    Agency code filter (DOD, NASA, etc.)
 *   --from=<date>      Posted from date (YYYY-MM-DD)
 *   --to=<date>        Posted to date (YYYY-MM-DD)
 *   --setAside=<code>  Set-aside code (SB, 8A, WOSB, etc.)
 */

import { searchSamOpportunities, type SamOpportunity } from '@/lib/sam/client';
import { logger } from '@/lib/logger';

// SAM.gov API limit for records per request
const MAX_SAM_API_BATCH_SIZE = 1000;
const DEFAULT_BATCH_SIZE = 100;
const BATCH_DELAY_MS = 500; // Delay between batches to avoid rate limiting

type OutputFormat = 'json' | 'table' | 'csv';

interface CliArgs {
  all?: boolean;
  format?: OutputFormat;
  limit?: number;
  q?: string;
  naics?: string;
  psc?: string;
  type?: string;
  agency?: string;
  from?: string;
  to?: string;
  setAside?: string;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {};
  
  argv.forEach((arg) => {
    if (arg === '--all') {
      args.all = true;
      return;
    }
    
    const [k, v] = arg.split('=');
    if (!k || v === undefined) return;
    
    const key = k.replace(/^--/, '');
    
    switch (key) {
      case 'format':
        if (['json', 'table', 'csv'].includes(v)) {
          args.format = v as OutputFormat;
        }
        break;
      case 'limit':
        args.limit = Number(v);
        break;
      case 'q':
      case 'naics':
      case 'psc':
      case 'type':
      case 'agency':
      case 'from':
      case 'to':
      case 'setAside':
        args[key] = v;
        break;
    }
  });
  
  return args;
}

function formatAsTable(opportunities: SamOpportunity[]): string {
  if (opportunities.length === 0) {
    return 'No opportunities found.';
  }
  
  const lines: string[] = [];
  const separator = '='.repeat(120);
  
  lines.push(separator);
  lines.push(`Total Opportunities: ${opportunities.length}`);
  lines.push(separator);
  lines.push('');
  
  opportunities.forEach((opp, index) => {
    lines.push(`[${index + 1}] ${opp.noticeId || 'N/A'}`);
    lines.push(`Title:        ${opp.title || 'Untitled'}`);
    lines.push(`Agency:       ${opp.agency || 'N/A'}`);
    lines.push(`Posted:       ${opp.postedDate || 'N/A'}`);
    lines.push(`Type:         ${opp.type || 'N/A'}`);
    
    if (opp.naics && opp.naics.length > 0) {
      lines.push(`NAICS:        ${opp.naics.join(', ')}`);
    }
    
    if (opp.psc && opp.psc.length > 0) {
      lines.push(`PSC:          ${opp.psc.join(', ')}`);
    }
    
    if (opp.url) {
      lines.push(`URL:          ${opp.url}`);
    }
    
    lines.push('-'.repeat(120));
    lines.push('');
  });
  
  return lines.join('\n');
}

function formatAsCsv(opportunities: SamOpportunity[]): string {
  if (opportunities.length === 0) {
    return 'No opportunities found.';
  }
  
  const headers = ['Notice ID', 'Title', 'Agency', 'Posted Date', 'Type', 'NAICS', 'PSC', 'URL'];
  const lines: string[] = [headers.join(',')];
  
  opportunities.forEach((opp) => {
    const row = [
      escapeCSV(opp.noticeId || ''),
      escapeCSV(opp.title || ''),
      escapeCSV(opp.agency || ''),
      escapeCSV(opp.postedDate || ''),
      escapeCSV(opp.type || ''),
      escapeCSV((opp.naics || []).join('; ')),
      escapeCSV((opp.psc || []).join('; ')),
      escapeCSV(opp.url || ''),
    ];
    lines.push(row.join(','));
  });
  
  return lines.join('\n');
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

async function fetchAllOpportunities(args: CliArgs): Promise<SamOpportunity[]> {
  const allOpportunities: SamOpportunity[] = [];
  const batchSize = Math.min(args.limit || DEFAULT_BATCH_SIZE, MAX_SAM_API_BATCH_SIZE);
  let start = 0;
  let hasMore = true;
  
  console.error(`Fetching all SAM.gov opportunities (batch size: ${batchSize})...`);
  
  while (hasMore) {
    try {
      console.error(`Fetching records ${start} to ${start + batchSize}...`);
      
      const res = await searchSamOpportunities({
        q: args.q,
        naics: args.naics,
        psc: args.psc,
        type: args.type,
        setAsideCode: args.setAside,
        agencyCode: args.agency,
        postedFrom: args.from,
        postedTo: args.to,
        limit: batchSize,
        start,
      });
      
      const opportunities = res.opportunities || [];
      allOpportunities.push(...opportunities);
      
      const total = res.totalRecords || 0;
      console.error(`Retrieved ${opportunities.length} records. Total in database: ${total}. Fetched so far: ${allOpportunities.length}`);
      
      // Check if we've fetched all available records
      if (opportunities.length < batchSize || allOpportunities.length >= total) {
        hasMore = false;
      } else {
        start += batchSize;
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
      }
      
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error('Failed to fetch batch', { error: msg, start, batchSize });
      console.error(`Error fetching batch starting at ${start}: ${msg}`);
      hasMore = false;
    }
  }
  
  return allOpportunities;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const format = args.format || 'json';
  
  try {
    let opportunities: SamOpportunity[];
    let totalRecords: number | undefined;
    
    if (args.all) {
      // Fetch all records with pagination
      opportunities = await fetchAllOpportunities(args);
      totalRecords = opportunities.length;
    } else {
      // Single query with specified limit
      const limit = args.limit || 100;
      const res = await searchSamOpportunities({
        q: args.q,
        naics: args.naics,
        psc: args.psc,
        type: args.type,
        setAsideCode: args.setAside,
        agencyCode: args.agency,
        postedFrom: args.from,
        postedTo: args.to,
        limit,
        start: 0,
      });
      
      opportunities = res.opportunities || [];
      totalRecords = res.totalRecords;
    }
    
    // Output based on format
    switch (format) {
      case 'table':
        console.log(formatAsTable(opportunities));
        if (totalRecords !== undefined && !args.all) {
          console.error(`\nNote: Showing ${opportunities.length} of ${totalRecords} total records. Use --all to fetch all.`);
        }
        break;
        
      case 'csv':
        console.log(formatAsCsv(opportunities));
        if (totalRecords !== undefined && !args.all) {
          console.error(`\nNote: Showing ${opportunities.length} of ${totalRecords} total records. Use --all to fetch all.`);
        }
        break;
        
      case 'json':
      default:
        console.log(JSON.stringify({
          total: totalRecords,
          fetched: opportunities.length,
          opportunities,
        }, null, 2));
        break;
    }
    
    logger.info('SAM data printed successfully', {
      format,
      count: opportunities.length,
      total: totalRecords,
    });
    
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error('Failed to print SAM data', { error: msg });
    console.error(`\nError: ${msg}`);
    
    if (msg.includes('SAM_API_KEY')) {
      console.error('\nTo use this script, you need to set the SAM_API_KEY environment variable.');
      console.error('Get your API key from: https://sam.gov/data-services/');
      console.error('\nUsage: SAM_API_KEY=your_key_here npm run print-sam');
    }
    
    process.exitCode = 1;
  }
}

main();
