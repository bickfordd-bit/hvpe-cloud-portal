# SAM.gov Data Guide

This guide explains how to fetch and print all SAM.gov (System for Award Management) opportunity data available in the HVPE Cloud Portal.

## Overview

The HVPE Cloud Portal integrates with SAM.gov to fetch federal government contracting opportunities. This integration provides:

- Live search of government opportunities
- Filtering by agency, NAICS codes, PSC codes, and more
- Pagination support to fetch all available records
- Multiple output formats (JSON, CSV, Table)

## Quick Start

### Print SAM Data with Default Settings

```bash
npm run print-sam
```

This will fetch and print SAM.gov opportunities with default filters in JSON format.

### Print ALL SAM Data (Paginated)

```bash
npm run print-sam -- --all
```

This fetches all available opportunities by paginating through all records.

## Command Line Options

### Format Options

```bash
# JSON format (default)
npm run print-sam -- --format=json

# Table format (human-readable)
npm run print-sam -- --format=table

# CSV format (spreadsheet-friendly)
npm run print-sam -- --format=csv
```

### Filter Options

```bash
# Search query
npm run print-sam -- --q="AI OR cloud"

# Filter by agency
npm run print-sam -- --agency=DOD

# Filter by NAICS code
npm run print-sam -- --naics=541512

# Filter by PSC code
npm run print-sam -- --psc=DA10

# Filter by notice type
npm run print-sam -- --type=Solicitation

# Filter by set-aside code
npm run print-sam -- --setAside=SB

# Date range filters
npm run print-sam -- --from=2024-01-01 --to=2024-12-31

# Limit results
npm run print-sam -- --limit=50
```

### Combined Examples

```bash
# DoD AI opportunities in table format
npm run print-sam -- --agency=DOD --q="AI" --format=table

# All cloud opportunities as CSV
npm run print-sam -- --all --q="cloud" --format=csv > sam-cloud-opps.csv

# Small business set-asides in JSON
npm run print-sam -- --setAside=SB --limit=100 --format=json
```

## API Key Setup

To use the SAM.gov API, you need an API key:

1. Register at https://sam.gov/data-services/
2. Create an API key (free for public data)
3. Set the environment variable:

```bash
export SAM_API_KEY=your_api_key_here
```

Or create a `.env.local` file:

```env
SAM_API_KEY=your_api_key_here
```

## Output Formats

### JSON Format

The default format includes:
- `total`: Total number of records available
- `fetched`: Number of records retrieved
- `opportunities`: Array of opportunity objects

Each opportunity includes:
- `noticeId`: Unique identifier
- `title`: Opportunity title
- `agency`: Issuing agency
- `postedDate`: Date posted
- `type`: Notice type (Solicitation, Presolicitation, etc.)
- `naics`: Array of NAICS codes
- `psc`: Array of PSC codes
- `url`: Link to full notice on SAM.gov

### Table Format

Human-readable format with each opportunity displayed with all fields separated by lines.

### CSV Format

Comma-separated values format suitable for importing into spreadsheets or databases.

## SAM.gov API Integration

### Client Library

The SAM.gov client is located at `src/lib/sam/client.ts` and provides:

```typescript
import { searchSamOpportunities } from '@/lib/sam/client';

const results = await searchSamOpportunities({
  q: 'AI OR machine learning',
  agency: 'DOD',
  limit: 100,
  start: 0,
});
```

### API Routes

The portal exposes SAM data through these API endpoints:

- `GET /api/sam/search` - Search SAM opportunities
- `GET /api/optr/opportunity?id=<noticeId>` - Get single opportunity
- `GET /api/optr/top10` - Get top 10 scored opportunities

### UI Component

A live search UI is available at `/dashboard/optr/sam` (Derek instance only).

## OPTR Integration

The Opportunity-to-Realization (OPTR) system uses SAM.gov data to:

1. Fetch federal contracting opportunities
2. Score opportunities based on readiness
3. Prioritize opportunities for pursuit
4. Track bid submissions

Scoring factors include:
- Keyword matching (AI, ML, cyber, cloud)
- Agency preference (Air Force, Army, etc.)
- Response deadline proximity
- Contract type and size

## Filters Reference

### Agency Codes

Common agency codes:
- `DOD` - Department of Defense
- `USAF` - US Air Force
- `NASA` - National Aeronautics and Space Administration
- `DISA` - Defense Information Systems Agency
- `GSA` - General Services Administration

### Notice Types

- `Solicitation` - Open for bids
- `Presolicitation` - Advance notice
- `Combined Synopsis/Solicitation` - Combined posting
- `Sources Sought` - Market research
- `Special Notice` - General information

### Set-Aside Codes

- `SB` - Small Business
- `8A` - 8(a) Business Development
- `WOSB` - Women-Owned Small Business
- `SDVOSB` - Service-Disabled Veteran-Owned Small Business
- `HUBZone` - Historically Underutilized Business Zone

### NAICS Codes

- `541512` - Computer Systems Design Services
- `541511` - Custom Computer Programming Services
- `541513` - Computer Facilities Management Services
- `541519` - Other Computer Related Services
- `541715` - R&D in Physical, Engineering, Life Sciences

## Pagination

When using `--all`, the script automatically:
1. Fetches records in batches (default: 100 per batch, max: 1000)
2. Continues until all records are retrieved
3. Adds a 500ms delay between batches to avoid rate limiting
4. Reports progress to stderr

Example output:
```
Fetching all SAM.gov opportunities (batch size: 100)...
Fetching records 0 to 100...
Retrieved 100 records. Total in database: 1543. Fetched so far: 100
Fetching records 100 to 200...
Retrieved 100 records. Total in database: 1543. Fetched so far: 200
...
```

## Troubleshooting

### "SAM_API_KEY is required" Error

Set your API key:
```bash
export SAM_API_KEY=your_key
npm run print-sam
```

### Rate Limiting

If you encounter rate limits:
1. Reduce batch size: `--limit=50`
2. Add delays between runs
3. Use more specific filters to reduce total records

### No Results

Check your filters:
1. Verify agency code is correct
2. Check date ranges aren't too restrictive
3. Try broadening your search query

## Advanced Usage

### Piping to Files

```bash
# Save JSON output
npm run print-sam -- --all --format=json > sam-data.json

# Save CSV output
npm run print-sam -- --all --format=csv > sam-data.csv
```

### Processing with jq

```bash
# Extract just titles
npm run print-sam | jq '.opportunities[].title'

# Count by agency
npm run print-sam | jq '.opportunities | group_by(.agency) | map({agency: .[0].agency, count: length})'

# Filter in memory
npm run print-sam | jq '.opportunities[] | select(.agency == "DOD")'
```

### Combining with Other Tools

```bash
# Import into database
npm run print-sam -- --all --format=csv | psql -c "COPY opportunities FROM STDIN CSV HEADER"

# Email report
npm run print-sam -- --agency=DOD --format=table | mail -s "DoD Opportunities" user@example.com
```

## Related Documentation

- [OPTR Mathematical Framework](./OPTR_MATHEMATICAL_FRAMEWORK.md)
- [DoD Public Record Integration](./DOD_OPTR_PUBLIC_RECORD.md)
- [API Documentation](../README.md#api-endpoints)

## Support

For issues or questions:
1. Check the [README](../README.md)
2. Review [environment setup](../SETUP.md)
3. Check SAM.gov API status at https://www.sam.gov/
