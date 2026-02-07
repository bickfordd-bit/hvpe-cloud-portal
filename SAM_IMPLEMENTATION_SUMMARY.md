# SAM.gov Data Printing Implementation Summary

## Overview

Implemented comprehensive tooling to print all SAM.gov (System for Award Management) opportunity data with multiple output formats and advanced filtering capabilities.

## What Was Created

### 1. Full-Featured TypeScript Script
**File:** `scripts/print-all-sam-data.ts`

- Integrates with existing SAM client (`src/lib/sam/client.ts`)
- Uses app logger and TypeScript types
- Full type safety and error handling
- Supports all advanced features

### 2. Standalone JavaScript Script
**File:** `scripts/print-sam-standalone.js`

- Zero dependencies (uses only Node.js built-ins)
- Can run independently without full app environment
- Perfect for CI/CD pipelines or standalone usage
- Same features as TypeScript version

### 3. NPM Scripts
Added to `package.json`:

```json
{
  "scripts": {
    "print-sam": "npx tsx scripts/print-all-sam-data.ts",
    "print-sam:simple": "node scripts/print-sam-standalone.js"
  }
}
```

### 4. Comprehensive Documentation
**File:** `docs/SAM_DATA_GUIDE.md`

Complete guide covering:
- Quick start and installation
- All command-line options
- Filter reference (agencies, NAICS, PSC, etc.)
- Output format examples
- API integration details
- OPTR scoring system
- Troubleshooting guide
- Advanced usage with Unix tools (jq, psql, etc.)

### 5. README Updates
**File:** `README.md`

Added SAM.gov Integration section with:
- Quick examples
- Available options
- API endpoints
- Web UI information
- Link to full documentation

## Features Implemented

### Output Formats

1. **JSON Format** (default)
   - Machine-readable
   - Includes total count and fetched count
   - Full opportunity details

2. **Table Format**
   - Human-readable
   - Formatted with separators
   - Shows all fields clearly

3. **CSV Format**
   - Spreadsheet-compatible
   - Properly escaped values
   - Standard comma-separated format

### Filtering Options

- `--q` - Search query (e.g., "AI OR cloud")
- `--agency` - Agency code (DOD, NASA, etc.)
- `--naics` - NAICS industry code
- `--psc` - Product/Service code
- `--type` - Notice type (Solicitation, Presolicitation, etc.)
- `--setAside` - Set-aside code (SB, 8A, WOSB, etc.)
- `--from` - Posted from date (YYYY-MM-DD)
- `--to` - Posted to date (YYYY-MM-DD)
- `--limit` - Records per request (default: 100, max: 1000)

### Pagination Support

The `--all` flag enables automatic pagination:
- Fetches records in batches
- Continues until all records retrieved
- Shows progress to stderr
- Adds 500ms delay between batches to avoid rate limiting
- Reports total vs. fetched counts

### Error Handling

- Clear error messages when API key is missing
- Helpful instructions on how to get an API key
- Graceful handling of API failures
- Progress messages go to stderr, data to stdout
- Non-zero exit codes on errors

## Usage Examples

### Basic Usage

```bash
# Print with defaults (JSON format, 100 records)
npm run print-sam:simple

# Print in table format
npm run print-sam:simple -- --format=table

# Print as CSV
npm run print-sam:simple -- --format=csv
```

### Filtering

```bash
# DoD opportunities only
npm run print-sam:simple -- --agency=DOD

# AI-related opportunities
npm run print-sam:simple -- --q="AI OR machine learning"

# Small business set-asides
npm run print-sam:simple -- --setAside=SB

# Specific NAICS code (Computer Systems Design)
npm run print-sam:simple -- --naics=541512
```

### Fetch All Data

```bash
# Fetch all DoD AI opportunities
npm run print-sam:simple -- --all --agency=DOD --q="AI"

# Export all to CSV
npm run print-sam:simple -- --all --format=csv > all-opportunities.csv
```

### Advanced Examples

```bash
# DoD cloud opportunities in date range
npm run print-sam:simple -- --agency=DOD --q="cloud" --from=2024-01-01 --to=2024-12-31 --format=table

# Extract titles with jq
npm run print-sam:simple -- --limit=50 | jq '.opportunities[].title'

# Count by agency
npm run print-sam:simple -- --all | jq '.opportunities | group_by(.agency) | map({agency: .[0].agency, count: length})'
```

## Integration Points

### Existing SAM Integration

The scripts integrate with existing SAM.gov infrastructure:

1. **SAM Client** (`src/lib/sam/client.ts`)
   - `searchSamOpportunities()` function
   - Type definitions: `SamSearchParams`, `SamOpportunity`, `SamSearchResponse`

2. **API Routes**
   - `GET /api/sam/search` - Search proxy
   - `GET /api/optr/opportunity` - Single opportunity with scoring
   - `GET /api/optr/top10` - Top scored opportunities

3. **Web UI**
   - `/dashboard/optr/sam` - Live search interface (Derek instance only)
   - `SamSearchClient.tsx` component

4. **OPTR System**
   - Scoring algorithm based on keywords, agency, deadline
   - Integration with Opportunity-to-Realization pipeline
   - Bid tracking and submission features

### Environment Variables

Scripts use these environment variables (in order of preference):
1. `SAM_API_KEY` - Primary API key
2. `OPTR_SAM_API_KEY` - Alternative key name

Can be set via:
- Environment: `export SAM_API_KEY=your_key`
- `.env.local` file
- Command line: `SAM_API_KEY=key npm run print-sam:simple`

## Testing

Both scripts include proper error handling and have been tested for:

1. **Missing API Key**
   - Clear error message with instructions
   - Link to SAM.gov API registration
   - Non-zero exit code

2. **Format Options**
   - JSON output is valid and parseable
   - Table format is human-readable
   - CSV format is properly escaped

3. **Standalone Operation**
   - JavaScript version works with zero dependencies
   - Only requires Node.js runtime
   - No app environment needed

## API Key Setup

To use the scripts:

1. Visit https://sam.gov/data-services/
2. Register for a free account
3. Generate an API key (public data access is free)
4. Set the environment variable:

```bash
export SAM_API_KEY=your_api_key_here
npm run print-sam:simple
```

Or create `.env.local`:

```env
SAM_API_KEY=your_api_key_here
```

## Benefits

1. **Immediate Value**
   - Can print all SAM.gov data with a single command
   - Multiple output formats for different use cases
   - Advanced filtering reduces noise

2. **Developer Friendly**
   - Clear documentation and examples
   - Helpful error messages
   - Works with standard Unix tools (pipe, redirect, jq)

3. **Integration Ready**
   - TypeScript version integrates with app
   - JavaScript version works standalone
   - Both share same interface and options

4. **Production Ready**
   - Rate limiting protection
   - Error handling
   - Progress reporting
   - Pagination support

## Future Enhancements (Optional)

Potential improvements for the future:

1. Add caching layer to reduce API calls
2. Store results in database for historical analysis
3. Add web UI for printing/exporting data
4. Schedule periodic fetches with cron
5. Email reports of new opportunities
6. Integration with bid tracking system
7. Automatic OPTR scoring for all opportunities

## Files Changed

- `scripts/print-all-sam-data.ts` - Created (TypeScript version)
- `scripts/print-sam-standalone.js` - Created (JavaScript version)
- `package.json` - Updated (added npm scripts)
- `docs/SAM_DATA_GUIDE.md` - Created (comprehensive guide)
- `README.md` - Updated (added SAM integration section)

## Commands Added

```bash
npm run print-sam              # Full TypeScript version
npm run print-sam:simple       # Standalone JavaScript version
```

Both support the same options and produce the same output formats.

## Documentation Structure

```
docs/
  └── SAM_DATA_GUIDE.md        # Complete usage guide
scripts/
  ├── print-all-sam-data.ts    # TypeScript implementation
  ├── print-sam-standalone.js  # JavaScript implementation
  └── fetch-sam.ts             # Original simple fetch script (unchanged)
```

## Conclusion

The implementation provides a complete solution for printing all SAM.gov opportunity data with:
- ✅ Multiple output formats (JSON, Table, CSV)
- ✅ Comprehensive filtering options
- ✅ Pagination for fetching all records
- ✅ Standalone and integrated versions
- ✅ Complete documentation
- ✅ Error handling and user guidance
- ✅ Rate limiting protection
- ✅ Ready to use immediately with API key

The scripts are production-ready and can be used for:
- Data analysis
- Report generation
- Integration with other systems
- Automated monitoring
- Historical tracking
- OPTR pipeline feeding
