# BICK API Documentation

## Overview

The BICK API provides endpoints for calculating BICK (Business Impact Conversion Key) values based on the T2V (Time-to-Value) workflow. This API is designed for use with Next.js App Router and can be deployed on Vercel serverless functions.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://[your-vercel-domain]/api`

## Authentication

All POST endpoints require API key authentication via the `x-bick-key` header.

```bash
x-bick-key: your-api-key-here
```

The API key must match the `BICK_API_KEY` environment variable configured on the server.

## CORS Policy

The API allows requests from:
- `http://localhost:3000` (development)
- Production Vercel domains (automatically configured)
- Same-origin requests (no Origin header)

Preflight OPTIONS requests are supported for all POST endpoints.

## Endpoints

### 1. POST /api/bick

Calculate BICK value using the formula: `(V / T) * E * L`

#### Request Headers

```
Content-Type: application/json
x-bick-key: your-api-key-here
```

#### Request Body

```json
{
  "V": 100,         // Required: Value (number)
  "T": 10,          // Required: Time (number, cannot be 0)
  "E": 0.8,         // Required: Efficiency (number)
  "L": 5,           // Required: Leverage (number)
  "D": 2,           // Optional: Defensibility (number)
  "baseline": 35    // Optional: Baseline value for delta calculation (number)
}
```

**Required Fields:**
- `V` (number): Value component
- `T` (number): Time component (cannot be zero)
- `E` (number): Efficiency component
- `L` (number): Leverage component

**Optional Fields:**
- `D` (number): Defensibility component (stored but not used in calculation)
- `baseline` (number): Baseline value for delta calculation

#### Response

**Success (200 OK):**

```json
{
  "bick": 40,
  "components": {
    "V": 100,
    "T": 10,
    "E": 0.8,
    "L": 5,
    "D": 2,
    "baseline": 35
  },
  "delta": 5
}
```

**Error Responses:**

```json
// 400 Bad Request - Missing required field
{
  "error": "Missing or invalid required field: V (must be a number)"
}

// 400 Bad Request - Division by zero
{
  "error": "Invalid value: T cannot be zero (division by zero)"
}

// 401 Unauthorized - Missing or invalid API key
{
  "error": "Unauthorized: Invalid or missing x-bick-key header"
}

// 500 Internal Server Error
{
  "error": "Internal server error"
}
```

#### Example Request

```bash
curl -X POST http://localhost:3000/api/bick \
  -H "Content-Type: application/json" \
  -H "x-bick-key: your-api-key-here" \
  -d '{
    "V": 100,
    "T": 10,
    "E": 0.8,
    "L": 5,
    "D": 2,
    "baseline": 35
  }'
```

#### Example Response

```json
{
  "bick": 40,
  "components": {
    "V": 100,
    "T": 10,
    "E": 0.8,
    "L": 5,
    "D": 2,
    "baseline": 35
  },
  "delta": 5
}
```

### 2. GET /api/health

Check API health status.

#### Request

No headers or body required.

#### Response

**Success (200 OK):**

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

#### Example Request

```bash
curl http://localhost:3000/api/health
```

### 3. GET /api/version

Get the current BICK API version.

#### Request

No headers or body required.

#### Response

**Success (200 OK):**

```json
{
  "version": "v1"
}
```

The version is read from the `BICK_VERSION` environment variable, defaulting to `"v1"` if not set.

#### Example Request

```bash
curl http://localhost:3000/api/version
```

## Environment Variables

### Required

- **BICK_API_KEY**: API key for authenticating requests to POST endpoints
  - Must be set in Vercel environment variables for production
  - Set in `.env.local` for local development

### Optional

- **BICK_VERSION**: Version string returned by `/api/version` endpoint (default: "v1")
- **VERCEL_URL**: Automatically set by Vercel (used for CORS)
- **NEXT_PUBLIC_VERCEL_URL**: Public Vercel URL (used for CORS)

## Local Development Setup

1. Create a `.env.local` file in the project root:

```bash
BICK_API_KEY=your-local-api-key
BICK_VERSION=v1
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Test the endpoints:

```bash
# Test version endpoint
curl http://localhost:3000/api/version

# Test health endpoint
curl http://localhost:3000/api/health

# Test BICK calculation
curl -X POST http://localhost:3000/api/bick \
  -H "Content-Type: application/json" \
  -H "x-bick-key: your-local-api-key" \
  -d '{"V": 100, "T": 10, "E": 0.8, "L": 5}'
```

## Vercel Deployment

1. Set environment variables in Vercel dashboard:
   - `BICK_API_KEY`: Your production API key
   - `BICK_VERSION`: (Optional) Your API version string

2. Deploy:

```bash
npm run deploy:vercel
```

or use the Vercel GitHub integration for automatic deployments.

## Error Handling

All endpoints return appropriate HTTP status codes:

- **200**: Success
- **204**: Success (no content) for OPTIONS requests
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (missing or invalid API key)
- **500**: Internal Server Error

Error responses include a descriptive error message in the response body.

## Rate Limiting

Currently, no rate limiting is implemented. Consider adding rate limiting middleware for production use to prevent abuse.

## Security Considerations

1. **API Key Storage**: Store `BICK_API_KEY` securely in Vercel environment variables. Never commit it to version control.
2. **HTTPS Only**: Use HTTPS in production to protect API keys in transit.
3. **CORS**: The API implements CORS headers to restrict cross-origin requests to allowed domains.
4. **Input Validation**: All numeric inputs are validated to prevent injection attacks and calculation errors.

## Support

For issues or questions, please refer to the main project documentation or create an issue in the repository.
