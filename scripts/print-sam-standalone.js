#!/usr/bin/env node
/**
 * Standalone SAM.gov Data Printer
 * 
 * This script can run independently without the full app environment.
 * It directly fetches from SAM.gov API and prints the results.
 */

const https = require('https');
const { URL, URLSearchParams } = require('url');

const SAM_BASE = 'https://api.sam.gov/prod/opportunities/v2/search';

// SAM.gov API limit for records per request
const MAX_SAM_API_BATCH_SIZE = 1000;
const DEFAULT_BATCH_SIZE = 100;
const BATCH_DELAY_MS = 500; // Delay between batches to avoid rate limiting

// Parse command line arguments
function parseArgs(argv) {
  const args = {};
  
  argv.forEach((arg) => {
    if (arg === '--all') {
      args.all = true;
      return;
    }
    
    const [k, v] = arg.split('=');
    if (!k || v === undefined) return;
    
    const key = k.replace(/^--/, '');
    args[key] = v;
  });
  
  return args;
}

// Format as table
function formatAsTable(opportunities) {
  if (opportunities.length === 0) {
    return 'No opportunities found.';
  }
  
  const lines = [];
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

// Format as CSV
function formatAsCsv(opportunities) {
  if (opportunities.length === 0) {
    return 'No opportunities found.';
  }
  
  const escapeCSV = (value) => {
    const str = String(value || '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  
  const headers = ['Notice ID', 'Title', 'Agency', 'Posted Date', 'Type', 'NAICS', 'PSC', 'URL'];
  const lines = [headers.join(',')];
  
  opportunities.forEach((opp) => {
    const row = [
      escapeCSV(opp.noticeId),
      escapeCSV(opp.title),
      escapeCSV(opp.agency),
      escapeCSV(opp.postedDate),
      escapeCSV(opp.type),
      escapeCSV((opp.naics || []).join('; ')),
      escapeCSV((opp.psc || []).join('; ')),
      escapeCSV(opp.url),
    ];
    lines.push(row.join(','));
  });
  
  return lines.join('\n');
}

// Fetch from SAM.gov API
function fetchSamData(params) {
  return new Promise((resolve, reject) => {
    const apiKey = params.apiKey || process.env.SAM_API_KEY || process.env.OPTR_SAM_API_KEY;
    
    if (!apiKey) {
      reject(new Error('SAM_API_KEY is required. Get one from https://sam.gov/data-services/'));
      return;
    }
    
    const query = new URLSearchParams();
    query.set('api_key', apiKey);
    if (params.q) query.set('q', params.q);
    if (params.naics) query.set('naics', params.naics);
    if (params.psc) query.set('psc', params.psc);
    if (params.type) query.set('type', params.type);
    if (params.setAsideCode) query.set('setAsideCode', params.setAsideCode);
    if (params.agencyCode) query.set('agencyCode', params.agencyCode);
    if (params.postedFrom) query.set('postedFrom', params.postedFrom);
    if (params.postedTo) query.set('postedTo', params.postedTo);
    query.set('limit', String(params.limit || 100));
    query.set('start', String(params.start || 0));
    
    const url = `${SAM_BASE}?${query.toString()}`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          return;
        }
        
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (err) {
          reject(new Error(`Failed to parse JSON: ${err.message}`));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Fetch all with pagination
async function fetchAll(args) {
  const allOpportunities = [];
  const batchSize = Math.min(Number(args.limit) || DEFAULT_BATCH_SIZE, MAX_SAM_API_BATCH_SIZE);
  let start = 0;
  let hasMore = true;
  
  console.error(`Fetching all SAM.gov opportunities (batch size: ${batchSize})...`);
  
  while (hasMore) {
    try {
      console.error(`Fetching records ${start} to ${start + batchSize}...`);
      
      const params = {
        apiKey: args.apiKey,
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
      };
      
      const res = await fetchSamData(params);
      const opportunities = res.opportunities || res.opportunitiesData?.opportunities || [];
      
      allOpportunities.push(...opportunities);
      
      const total = res.totalRecords || 0;
      console.error(`Retrieved ${opportunities.length} records. Total in database: ${total}. Fetched so far: ${allOpportunities.length}`);
      
      if (opportunities.length < batchSize || allOpportunities.length >= total) {
        hasMore = false;
      } else {
        start += batchSize;
        // Delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
      }
    } catch (err) {
      console.error(`Error fetching batch starting at ${start}: ${err.message}`);
      hasMore = false;
    }
  }
  
  return allOpportunities;
}

// Main function
async function main() {
  const args = parseArgs(process.argv.slice(2));
  const format = args.format || 'json';
  
  try {
    let opportunities;
    let totalRecords;
    
    if (args.all) {
      opportunities = await fetchAll(args);
      totalRecords = opportunities.length;
    } else {
      const params = {
        apiKey: args.apiKey,
        q: args.q,
        naics: args.naics,
        psc: args.psc,
        type: args.type,
        setAsideCode: args.setAside,
        agencyCode: args.agency,
        postedFrom: args.from,
        postedTo: args.to,
        limit: Number(args.limit) || 100,
        start: 0,
      };
      
      const res = await fetchSamData(params);
      opportunities = res.opportunities || res.opportunitiesData?.opportunities || [];
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
    
  } catch (err) {
    console.error(`\nError: ${err.message}`);
    
    if (err.message.includes('SAM_API_KEY')) {
      console.error('\nTo use this script, set the SAM_API_KEY environment variable:');
      console.error('  export SAM_API_KEY=your_key_here');
      console.error('\nGet your API key from: https://sam.gov/data-services/');
    }
    
    process.exitCode = 1;
  }
}

main();
