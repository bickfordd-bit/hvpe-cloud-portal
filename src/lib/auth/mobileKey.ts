/**
 * Mobile API Key Authentication
 * Guards mobile-specific API endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import { createErrorResponse, ErrorCodes } from '@/lib/apiResponse';

/**
 * Require mobile API key from request header
 * Checks x-optr-mobile-key against MOBILE_API_KEY env var
 */
export function requireMobileKey(req: NextRequest): NextResponse | null {
  const mobileKey = req.headers.get('x-optr-mobile-key');
  const expectedKey = process.env.MOBILE_API_KEY;

  // If MOBILE_API_KEY is not configured, allow the request (development mode)
  if (!expectedKey) {
    console.warn('MOBILE_API_KEY not configured - mobile key check bypassed');
    return null;
  }

  // If key is missing or doesn't match, return error response
  if (!mobileKey || mobileKey !== expectedKey) {
    return createErrorResponse(
      'Invalid or missing mobile API key',
      401,
      ErrorCodes.UNAUTHORIZED
    );
  }

  return null;
}
