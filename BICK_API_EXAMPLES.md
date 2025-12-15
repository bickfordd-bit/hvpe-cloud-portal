# BICK API Examples

This document provides practical examples of using the BICK API endpoints.

## Environment Setup

Before testing, set up your environment variables:

```bash
# .env.local (for local development)
BICK_API_KEY=your-secret-api-key
BICK_VERSION=v1
```

## Example 1: Basic BICK Calculation

Calculate BICK without baseline or D parameter:

```bash
curl -X POST http://localhost:3000/api/bick \
  -H "Content-Type: application/json" \
  -H "x-bick-key: your-secret-api-key" \
  -d '{
    "V": 100,
    "T": 10,
    "E": 0.8,
    "L": 5
  }'
```

**Response:**
```json
{
  "bick": 40,
  "components": {
    "V": 100,
    "T": 10,
    "E": 0.8,
    "L": 5,
    "D": null,
    "baseline": null
  },
  "delta": null
}
```

**Explanation:** BICK = (100 / 10) * 0.8 * 5 = 40

## Example 2: BICK with Baseline Comparison

Calculate BICK and compare against a baseline:

```bash
curl -X POST http://localhost:3000/api/bick \
  -H "Content-Type: application/json" \
  -H "x-bick-key: your-secret-api-key" \
  -d '{
    "V": 100,
    "T": 10,
    "E": 0.8,
    "L": 5,
    "baseline": 35
  }'
```

**Response:**
```json
{
  "bick": 40,
  "components": {
    "V": 100,
    "T": 10,
    "E": 0.8,
    "L": 5,
    "D": null,
    "baseline": 35
  },
  "delta": 5
}
```

**Explanation:** 
- BICK = 40
- Delta = 40 - 35 = 5 (improvement of 5 units over baseline)

## Example 3: Full Parameters with D (Defensibility)

Include all parameters including optional D:

```bash
curl -X POST http://localhost:3000/api/bick \
  -H "Content-Type: application/json" \
  -H "x-bick-key: your-secret-api-key" \
  -d '{
    "V": 150,
    "T": 12,
    "E": 0.9,
    "L": 4,
    "D": 3,
    "baseline": 40
  }'
```

**Response:**
```json
{
  "bick": 45,
  "components": {
    "V": 150,
    "T": 12,
    "E": 0.9,
    "L": 4,
    "D": 3,
    "baseline": 40
  },
  "delta": 5
}
```

**Note:** D parameter is stored but not used in the BICK calculation formula.

## Example 4: Decimal Values

The API supports decimal/float values:

```bash
curl -X POST http://localhost:3000/api/bick \
  -H "Content-Type: application/json" \
  -H "x-bick-key: your-secret-api-key" \
  -d '{
    "V": 150.5,
    "T": 12.5,
    "E": 0.75,
    "L": 3
  }'
```

**Response:**
```json
{
  "bick": 27.09,
  "components": {
    "V": 150.5,
    "T": 12.5,
    "E": 0.75,
    "L": 3,
    "D": null,
    "baseline": null
  },
  "delta": null
}
```

## Example 5: Error Handling - Missing API Key

```bash
curl -X POST http://localhost:3000/api/bick \
  -H "Content-Type: application/json" \
  -d '{
    "V": 100,
    "T": 10,
    "E": 0.8,
    "L": 5
  }'
```

**Response (401):**
```json
{
  "error": "Unauthorized: Invalid or missing x-bick-key header"
}
```

## Example 6: Error Handling - Missing Required Field

```bash
curl -X POST http://localhost:3000/api/bick \
  -H "Content-Type: application/json" \
  -H "x-bick-key: your-secret-api-key" \
  -d '{
    "V": 100,
    "T": 10,
    "E": 0.8
  }'
```

**Response (400):**
```json
{
  "error": "Missing or invalid required field: L (must be a number)"
}
```

## Example 7: Error Handling - Division by Zero

```bash
curl -X POST http://localhost:3000/api/bick \
  -H "Content-Type: application/json" \
  -H "x-bick-key: your-secret-api-key" \
  -d '{
    "V": 100,
    "T": 0,
    "E": 0.8,
    "L": 5
  }'
```

**Response (400):**
```json
{
  "error": "Invalid value: T cannot be zero (division by zero)"
}
```

## Example 8: Error Handling - Invalid Type

```bash
curl -X POST http://localhost:3000/api/bick \
  -H "Content-Type: application/json" \
  -H "x-bick-key: your-secret-api-key" \
  -d '{
    "V": "not-a-number",
    "T": 10,
    "E": 0.8,
    "L": 5
  }'
```

**Response (400):**
```json
{
  "error": "Missing or invalid required field: V (must be a number)"
}
```

## Example 9: CORS Preflight Request

Check CORS configuration:

```bash
curl -X OPTIONS http://localhost:3000/api/bick \
  -H "Origin: http://localhost:3000" \
  -i
```

**Response (204):**
```
HTTP/1.1 204 No Content
access-control-allow-origin: http://localhost:3000
access-control-allow-methods: POST, OPTIONS
access-control-allow-headers: Content-Type, x-bick-key
access-control-allow-credentials: true
access-control-max-age: 86400
```

## Example 10: Check API Version

```bash
curl http://localhost:3000/api/version
```

**Response:**
```json
{
  "version": "v1"
}
```

## Example 11: Check API Health

```bash
curl http://localhost:3000/api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "checks": {
    "api": { "status": "ok" },
    "database": { "status": "ok" },
    "openai": { "status": "configured" }
  },
  "version": "1.0.0",
  "environment": "development",
  "responseTime": "15ms"
}
```

## JavaScript/TypeScript Example

Here's how to call the BICK API from a frontend application:

```typescript
interface BickRequest {
  V: number;
  T: number;
  E: number;
  L: number;
  D?: number;
  baseline?: number;
}

interface BickResponse {
  bick: number;
  components: {
    V: number;
    T: number;
    E: number;
    L: number;
    D: number | null;
    baseline: number | null;
  };
  delta: number | null;
}

async function calculateBick(params: BickRequest): Promise<BickResponse> {
  const response = await fetch('http://localhost:3000/api/bick', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-bick-key': process.env.NEXT_PUBLIC_BICK_API_KEY || '',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to calculate BICK');
  }

  return response.json();
}

// Usage
try {
  const result = await calculateBick({
    V: 100,
    T: 10,
    E: 0.8,
    L: 5,
    baseline: 35,
  });
  
  console.log('BICK:', result.bick);
  console.log('Delta:', result.delta);
} catch (error) {
  console.error('Error:', error.message);
}
```

## Python Example

```python
import requests
import os

def calculate_bick(V, T, E, L, D=None, baseline=None):
    """Calculate BICK using the API."""
    url = 'http://localhost:3000/api/bick'
    headers = {
        'Content-Type': 'application/json',
        'x-bick-key': os.environ.get('BICK_API_KEY')
    }
    
    data = {
        'V': V,
        'T': T,
        'E': E,
        'L': L
    }
    
    if D is not None:
        data['D'] = D
    if baseline is not None:
        data['baseline'] = baseline
    
    response = requests.post(url, json=data, headers=headers)
    response.raise_for_status()
    
    return response.json()

# Usage
try:
    result = calculate_bick(V=100, T=10, E=0.8, L=5, baseline=35)
    print(f"BICK: {result['bick']}")
    print(f"Delta: {result['delta']}")
except requests.exceptions.HTTPError as e:
    print(f"Error: {e.response.json()['error']}")
```

## Testing Checklist

Use this checklist to verify your API integration:

- [ ] `/api/version` returns version string
- [ ] `/api/health` returns health status
- [ ] `/api/bick` with valid auth and data returns BICK calculation
- [ ] `/api/bick` without API key returns 401
- [ ] `/api/bick` with missing required fields returns 400
- [ ] `/api/bick` with T=0 returns 400 (division by zero)
- [ ] `/api/bick` with invalid types returns 400
- [ ] `/api/bick` calculates delta when baseline provided
- [ ] `/api/bick` accepts optional D parameter
- [ ] OPTIONS preflight requests return 204 with CORS headers
- [ ] CORS allows configured origins
- [ ] CORS blocks unauthorized origins
