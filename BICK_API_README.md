# BICK API v1 Documentation

## Overview
The BICK API provides computation services for the BICK (Business Intelligence Computation Kernel) formula with authentication, CORS support, and input validation.

## Endpoints

### POST /api/bick
Compute BICK value from input parameters.

**Authentication**: Required (x-bick-key header)

**Request Body**:
```json
{
  "V": 100,      // Value (required, number > 0)
  "T": 10,       // Time (required, number > 0)
  "E": 0.8,      // Efficiency (required, 0-1 inclusive)
  "L": 0.9,      // Leverage (required, 0-1 inclusive)
  "D": 5,        // Dimension (optional, number)
  "baseline": {  // Optional baseline for delta computation
    "V": 80,
    "T": 10,
    "E": 0.7,
    "L": 0.8,
    "D": 3
  }
}
```

**Formula**: `BICK = (V / T) * E * L`

**Response**:
```json
{
  "success": true,
  "data": {
    "bick": 7.2,
    "components": {
      "V": 100,
      "T": 10,
      "E": 0.8,
      "L": 0.9,
      "D": 5
    },
    "delta": {
      "currentBick": 7.2,
      "baselineBick": 4.48,
      "deltaBick": 2.72,
      "baselineComponents": { ... }
    }
  },
  "metadata": {
    "timestamp": "2025-12-15T18:38:00Z",
    "responseTime": "1ms"
  }
}
```

### GET /api/version
Get API version.

**Authentication**: Required (x-bick-key header)

**Response**:
```json
{
  "success": true,
  "data": {
    "version": "v1"
  },
  "metadata": {
    "timestamp": "2025-12-15T18:38:00Z"
  }
}
```

### GET /api/health
Health check endpoint (no authentication required).

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-12-15T18:38:00Z",
  "version": "v1"
}
```

## Authentication

All endpoints except `/api/health` require authentication via the `x-bick-key` header.

**Example**:
```bash
curl -X POST http://localhost:3000/api/bick \
  -H "Content-Type: application/json" \
  -H "x-bick-key: your-api-key-here" \
  -d '{"V":100,"T":10,"E":0.8,"L":0.9}'
```

Set `BICK_API_KEY` environment variable to configure the valid API key.

## CORS

The API supports CORS for the following origins:
- `http://localhost:3000`
- `https://localhost:3000`
- Any `*.vercel.app` domain
- Custom origins via `ALLOWED_ORIGINS` environment variable (comma-separated)

Allowed methods: `GET`, `POST`, `OPTIONS`
Allowed headers: `Content-Type`, `x-bick-key`

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing API key"
  },
  "metadata": {
    "timestamp": "2025-12-15T18:38:00Z"
  }
}
```

### 400 Validation Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "E (Efficiency) must be between 0 and 1 (inclusive)"
  },
  "metadata": {
    "timestamp": "2025-12-15T18:38:00Z",
    "responseTime": "0ms"
  }
}
```

### 400 Invalid JSON
```json
{
  "success": false,
  "error": {
    "code": "INVALID_JSON",
    "message": "Request body must be valid JSON"
  },
  "metadata": {
    "timestamp": "2025-12-15T18:38:00Z"
  }
}
```

## Environment Variables

- `BICK_API_KEY` (required): API key for authentication
- `BICK_VERSION` (optional): API version string (defaults to "v1")
- `ALLOWED_ORIGINS` (optional): Comma-separated list of allowed CORS origins

## Testing

```bash
# Start dev server with API key
BICK_API_KEY=test-key-123 npm run dev

# Test health (no auth)
curl http://localhost:3000/api/health

# Test version (with auth)
curl http://localhost:3000/api/version -H "x-bick-key: test-key-123"

# Test BICK computation
curl -X POST http://localhost:3000/api/bick \
  -H "Content-Type: application/json" \
  -H "x-bick-key: test-key-123" \
  -d '{"V":100,"T":10,"E":0.8,"L":0.9}'

# Test with baseline
curl -X POST http://localhost:3000/api/bick \
  -H "Content-Type: application/json" \
  -H "x-bick-key: test-key-123" \
  -d '{"V":100,"T":10,"E":0.8,"L":0.9,"baseline":{"V":80,"T":10,"E":0.7,"L":0.8}}'
```

## Implementation Details

### File Structure
```
src/
├── app/api/
│   ├── bick/route.ts           # POST /api/bick endpoint
│   ├── version/route.ts        # GET /api/version endpoint
│   └── health/route.ts         # GET /api/health endpoint
└── lib/bick/
    ├── auth.ts                 # Authentication utilities
    ├── cors.ts                 # CORS handling
    ├── types.ts                # TypeScript type definitions
    └── compute.ts              # BICK computation logic
```

### Architecture
- **Stateless**: No in-memory state, suitable for serverless deployment
- **Type-safe**: Full TypeScript typing throughout
- **Validated**: Input validation with clear error messages
- **Logged**: Structured logging via Winston
- **Tested**: Manual testing confirms all requirements met

## Deployment

### Vercel
1. Set environment variables in Vercel Project Settings:
   - `BICK_API_KEY`
   - `BICK_VERSION` (optional)
   - `ALLOWED_ORIGINS` (optional)

2. Deploy:
```bash
npm run deploy:vercel
```

### Docker
```bash
docker build -t bick-api .
docker run -e BICK_API_KEY=your-key -p 3000:3000 bick-api
```
