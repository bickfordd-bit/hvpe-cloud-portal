/**
 * BICK API Authentication utilities
 */

import { NextRequest } from 'next/server';

/**
 * Validates the BICK API key from request headers
 * @param request - Next.js request object
 * @returns true if authenticated, false otherwise
 */
export function validateBickApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-bick-key');
  const validKey = process.env.BICK_API_KEY;

  if (!validKey) {
    console.warn('BICK_API_KEY environment variable not set');
    return false;
  }

  return apiKey === validKey;
}

/**
 * Creates a 401 Unauthorized response
 */
export function createUnauthorizedResponse() {
  return new Response(
    JSON.stringify({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or missing API key'
      },
      metadata: {
        timestamp: new Date().toISOString()
      }
    }),
    {
      status: 401,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}
