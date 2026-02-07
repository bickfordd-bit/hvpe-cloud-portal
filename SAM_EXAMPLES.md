# SAM.gov Data Printing - Examples and Output

This document shows example usage and output formats for the SAM.gov data printing scripts.

## Quick Start

### Without API Key

If you run the script without setting `SAM_API_KEY`, you'll get a helpful error message:

```bash
$ npm run print-sam:simple

Error: SAM_API_KEY is required. Get one from https://sam.gov/data-services/

To use this script, set the SAM_API_KEY environment variable:
  export SAM_API_KEY=your_key_here

Get your API key from: https://sam.gov/data-services/
```

### With API Key

Once you set your API key, the script will fetch real data:

```bash
export SAM_API_KEY=your_actual_key_here
npm run print-sam:simple -- --format=json --limit=2
```

## Example Output Formats

### JSON Format (Default)

```json
{
  "total": 1543,
  "fetched": 2,
  "opportunities": [
    {
      "noticeId": "abc123",
      "title": "AI/ML Platform Development and Support",
      "agency": "Department of Defense",
      "postedDate": "2026-01-15",
      "type": "Solicitation",
      "naics": ["541512", "541519"],
      "psc": ["D307", "DA10"],
      "url": "https://sam.gov/opp/abc123/view"
    },
    {
      "noticeId": "xyz789",
      "title": "Cloud Infrastructure Modernization",
      "agency": "US Air Force",
      "postedDate": "2026-01-10",
      "type": "Presolicitation",
      "naics": ["541511"],
      "psc": ["D301"],
      "url": "https://sam.gov/opp/xyz789/view"
    }
  ]
}
```

### Table Format

```bash
npm run print-sam:simple -- --format=table --limit=2
```

```
========================================================================================================================
Total Opportunities: 2
========================================================================================================================

[1] abc123
Title:        AI/ML Platform Development and Support
Agency:       Department of Defense
Posted:       2026-01-15
Type:         Solicitation
NAICS:        541512, 541519
PSC:          D307, DA10
URL:          https://sam.gov/opp/abc123/view
------------------------------------------------------------------------------------------------------------------------

[2] xyz789
Title:        Cloud Infrastructure Modernization
Agency:       US Air Force
Posted:       2026-01-10
Type:         Presolicitation
NAICS:        541511
PSC:          D301
URL:          https://sam.gov/opp/xyz789/view
------------------------------------------------------------------------------------------------------------------------
```

### CSV Format

```bash
npm run print-sam:simple -- --format=csv --limit=2
```

```
Notice ID,Title,Agency,Posted Date,Type,NAICS,PSC,URL
abc123,AI/ML Platform Development and Support,Department of Defense,2026-01-15,Solicitation,"541512; 541519","D307; DA10",https://sam.gov/opp/abc123/view
xyz789,Cloud Infrastructure Modernization,US Air Force,2026-01-10,Presolicitation,541511,D301,https://sam.gov/opp/xyz789/view
```

## Usage Examples

### 1. Get DoD AI Opportunities

```bash
npm run print-sam:simple -- --agency=DOD --q="AI OR machine learning" --format=table
```

### 2. Export All Cloud Opportunities to CSV

```bash
npm run print-sam:simple -- --all --q="cloud" --format=csv > cloud-opportunities.csv
```

This will:
1. Fetch all records matching "cloud" (with pagination)
2. Show progress to stderr: `Fetching records 0 to 100...`
3. Write CSV data to stdout → `cloud-opportunities.csv`

### 3. Small Business Set-Asides in Date Range

```bash
npm run print-sam:simple -- \
  --setAside=SB \
  --from=2026-01-01 \
  --to=2026-03-31 \
  --format=json
```

### 4. Computer Systems Design Services (NAICS 541512)

```bash
npm run print-sam:simple -- --naics=541512 --limit=50 --format=table
```

### 5. Pipe to jq for Analysis

```bash
# Extract just titles
npm run print-sam:simple -- --limit=100 | jq '.opportunities[].title'

# Count by agency
npm run print-sam:simple -- --all | \
  jq '.opportunities | group_by(.agency) | map({agency: .[0].agency, count: length})'

# Filter DoD only (in memory)
npm run print-sam:simple -- --all | \
  jq '.opportunities[] | select(.agency | contains("DoD"))'

# Export to line-delimited JSON
npm run print-sam:simple -- --all | jq -c '.opportunities[]' > opportunities.jsonl
```

### 6. Import into PostgreSQL

```bash
npm run print-sam:simple -- --all --format=csv | \
  psql -d mydb -c "COPY sam_opportunities FROM STDIN CSV HEADER"
```

### 7. Multiple Filters Combined

```bash
npm run print-sam:simple -- \
  --agency=DOD \
  --type="Solicitation,Presolicitation" \
  --q="cyber OR security" \
  --from=2026-01-01 \
  --limit=100 \
  --format=table
```

## Pagination Progress Example

When using `--all`, you'll see progress messages on stderr:

```bash
$ npm run print-sam:simple -- --all --agency=DOD --q="AI"

Fetching all SAM.gov opportunities (batch size: 100)...
Fetching records 0 to 100...
Retrieved 100 records. Total in database: 247. Fetched so far: 100
Fetching records 100 to 200...
Retrieved 100 records. Total in database: 247. Fetched so far: 200
Fetching records 200 to 300...
Retrieved 47 records. Total in database: 247. Fetched so far: 247
```

The actual data is written to stdout (not shown above), so you can redirect it:

```bash
npm run print-sam:simple -- --all --agency=DOD --q="AI" > dod-ai.json 2> progress.log
```

## Real-World Scenarios

### Scenario 1: Daily Opportunity Report

Create a cron job to fetch new opportunities daily:

```bash
#!/bin/bash
# daily-opportunities.sh

DATE=$(date +%Y-%m-%d)
OUTPUT_DIR=/var/reports/sam

npm run print-sam:simple -- \
  --from="$DATE" \
  --to="$DATE" \
  --format=csv > "$OUTPUT_DIR/opportunities-$DATE.csv"

# Email the report
mail -s "Daily SAM Opportunities - $DATE" \
  -a "$OUTPUT_DIR/opportunities-$DATE.csv" \
  team@company.com < /dev/null
```

### Scenario 2: Competitive Intelligence

Track specific competitors' wins:

```bash
# Get all DoD AI opportunities
npm run print-sam:simple -- \
  --all \
  --agency=DOD \
  --q="AI OR machine learning OR artificial intelligence" \
  --format=json > dod-ai-all.json

# Analyze with jq
cat dod-ai-all.json | jq -r '.opportunities[] | 
  "\(.postedDate) | \(.agency) | \(.title)"' | \
  sort -r > dod-ai-timeline.txt
```

### Scenario 3: Market Sizing

Count opportunities by category:

```bash
# Get all opportunities
npm run print-sam:simple -- --all --format=json > all-opps.json

# Analyze by NAICS
cat all-opps.json | jq -r '.opportunities[] | .naics[]' | \
  sort | uniq -c | sort -rn > naics-counts.txt

# Analyze by agency
cat all-opps.json | jq -r '.opportunities[].agency' | \
  sort | uniq -c | sort -rn > agency-counts.txt
```

### Scenario 4: BD Pipeline

Create a weekly report of high-value opportunities:

```bash
#!/bin/bash
# weekly-bd-pipeline.sh

# Fetch new opportunities from last week
LAST_WEEK=$(date -d '7 days ago' +%Y-%m-%d)
TODAY=$(date +%Y-%m-%d)

npm run print-sam:simple -- \
  --from="$LAST_WEEK" \
  --to="$TODAY" \
  --agency="DOD" \
  --type="Solicitation,Presolicitation" \
  --naics="541512,541511,541519" \
  --format=table > weekly-pipeline.txt

# Upload to cloud storage
aws s3 cp weekly-pipeline.txt s3://company-bd/weekly-reports/

# Send notification
echo "Weekly BD pipeline report generated" | \
  mail -s "BD Pipeline - Week of $TODAY" bd-team@company.com
```

## Performance Considerations

### Batch Sizing

- Default: 100 records per batch
- Maximum: 1000 records per batch (SAM.gov API limit)
- Adjust with `--limit=N`

Example: Fetch in larger batches (faster, but more memory):

```bash
npm run print-sam:simple -- --all --limit=1000
```

### Rate Limiting

- Automatic 500ms delay between batches
- Prevents hitting SAM.gov rate limits
- Configurable in code via `BATCH_DELAY_MS` constant

### Memory Usage

For very large datasets (>10,000 records), consider:
- Streaming output directly to file
- Processing in chunks
- Using the CSV format (more compact than JSON)

## Error Handling

### Common Errors

1. **Missing API Key**
   ```
   Error: SAM_API_KEY is required
   ```
   Solution: Set `SAM_API_KEY` environment variable

2. **Invalid API Key**
   ```
   Error: HTTP 403: Forbidden
   ```
   Solution: Check your API key is correct and active

3. **Rate Limit Exceeded**
   ```
   Error: HTTP 429: Too Many Requests
   ```
   Solution: Reduce batch size or increase delay

4. **Network Error**
   ```
   Error: ECONNREFUSED
   ```
   Solution: Check internet connection and SAM.gov API status

## Tips and Tricks

### 1. Preview Before Full Fetch

Always test your filters with a small limit first:

```bash
# Test filters
npm run print-sam:simple -- --agency=DOD --q="AI" --limit=5 --format=table

# If results look good, fetch all
npm run print-sam:simple -- --agency=DOD --q="AI" --all --format=json
```

### 2. Use stderr and stdout Separately

Progress goes to stderr, data to stdout:

```bash
# Save data, show progress
npm run print-sam:simple -- --all > data.json

# Save data and progress separately
npm run print-sam:simple -- --all > data.json 2> progress.log

# Hide progress, just get data
npm run print-sam:simple -- --all 2>/dev/null
```

### 3. Chain with Other Tools

```bash
# Count total
npm run print-sam:simple | jq '.fetched'

# Pretty print
npm run print-sam:simple | jq '.'

# Extract specific fields
npm run print-sam:simple | jq '.opportunities[] | {title, agency, posted: .postedDate}'

# Convert JSON to CSV with jq
npm run print-sam:simple | jq -r '.opportunities[] | 
  [.noticeId, .title, .agency, .postedDate] | @csv'
```

### 4. Incremental Fetching

Fetch data in date ranges to avoid refetching:

```bash
# January 2026
npm run print-sam:simple -- --from=2026-01-01 --to=2026-01-31 --all > jan-2026.json

# February 2026
npm run print-sam:simple -- --from=2026-02-01 --to=2026-02-28 --all > feb-2026.json

# Combine
jq -s '{"opportunities": ([.[].opportunities] | add)}' jan-2026.json feb-2026.json > q1-2026.json
```

## Documentation Links

- **Full Guide**: [docs/SAM_DATA_GUIDE.md](./docs/SAM_DATA_GUIDE.md)
- **Implementation Summary**: [SAM_IMPLEMENTATION_SUMMARY.md](./SAM_IMPLEMENTATION_SUMMARY.md)
- **SAM.gov API Docs**: https://open.gsa.gov/api/opportunities-api/
- **Get API Key**: https://sam.gov/data-services/

## Support

For questions or issues:
1. Check the documentation
2. Verify your API key is valid
3. Test with a small sample first
4. Review SAM.gov API status
