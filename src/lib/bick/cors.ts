/**
 * BICK API CORS utilities
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Default allowed origins for BICK API
 */
const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://localhost:3000'
];

/**
 * Get allowed origins from environment or defaults
 */
function getAllowedOrigins(): string[] {
  const envOrigins = process.env.ALLOWED_ORIGINS;
  if (envOrigins) {
    return envOrigins.split(',').map(o => o.trim());
  }
  return DEFAULT_ALLOWED_ORIGINS;
}

/**
 * Check if origin is allowed
 * @param origin - Request origin
 * @returns true if allowed
 */
function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  
  const allowedOrigins = getAllowedOrigins();
  
  // Check exact matches
  if (allowedOrigins.includes(origin)) {
    return true;
  }
  
  // Check for vercel.app domains
  if (origin.endsWith('.vercel.app')) {
    return true;
  }
  
  // Allow * if configured
  if (allowedOrigins.includes('*')) {
    return true;
  }
  
  return false;
}

/**
 * Add CORS headers to a response
 * @param response - Response to add headers to
 * @param request - Request object to get origin from
 * @param methods - Allowed methods
 * @returns Response with CORS headers
 */
export function addCorsHeaders(
  response: Response,
  request: NextRequest,
  methods: string[] = ['GET', 'POST', 'OPTIONS']
): Response {
  const origin = request.headers.get('origin');
  
  const headers = new Headers(response.headers);
  
  if (isOriginAllowed(origin)) {
    headers.set('Access-Control-Allow-Origin', origin as string);
  }
  
  headers.set('Access-Control-Allow-Methods', methods.join(', '));
  headers.set('Access-Control-Allow-Headers', 'Content-Type, x-bick-key');
  headers.set('Access-Control-Allow-Credentials', 'false');
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

/**
 * Handle OPTIONS preflight request
 * @param request - Request object
 * @param methods - Allowed methods
 * @returns 204 response with CORS headers
 */
export function handlePreflight(
  request: NextRequest,
  methods: string[] = ['GET', 'POST', 'OPTIONS']
): Response {
  const response = new Response(null, { status: 204 });
  return addCorsHeaders(response, request, methods);
}
