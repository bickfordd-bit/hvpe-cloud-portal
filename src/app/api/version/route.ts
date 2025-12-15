/**
 * BICK API v1 - Version endpoint
 * GET /api/version
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { validateBickApiKey, createUnauthorizedResponse } from '@/lib/bick/auth';
import { addCorsHeaders, handlePreflight } from '@/lib/bick/cors';

/**
 * Handle OPTIONS preflight request
 */
export async function OPTIONS(request: NextRequest) {
  logger.info('Version API OPTIONS request');
  return handlePreflight(request, ['GET', 'OPTIONS']);
}

/**
 * Handle GET request - Return API version
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate
    if (!validateBickApiKey(request)) {
      logger.warn('Version API: Unauthorized request', {
        origin: request.headers.get('origin'),
        userAgent: request.headers.get('user-agent')
      });
      const response = createUnauthorizedResponse();
      return addCorsHeaders(response, request, ['GET', 'OPTIONS']);
    }

    const version = process.env.BICK_VERSION || 'v1';
    
    logger.info('Version API: Request successful', { version });

    const response = NextResponse.json(
      {
        success: true,
        data: { version },
        metadata: {
          timestamp: new Date().toISOString()
        }
      },
      { status: 200 }
    );

    return addCorsHeaders(response, request, ['GET', 'OPTIONS']);

  } catch (error) {
    logger.error('Version API: Unexpected error', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    const response = new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred'
        },
        metadata: {
          timestamp: new Date().toISOString()
        }
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );

    return addCorsHeaders(response, request, ['GET', 'OPTIONS']);
  }
}
