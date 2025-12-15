/**
 * BICK API v1 - Main computation endpoint
 * POST /api/bick
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { validateBickApiKey, createUnauthorizedResponse } from '@/lib/bick/auth';
import { addCorsHeaders, handlePreflight } from '@/lib/bick/cors';
import { processBickRequest, BickValidationError } from '@/lib/bick/compute';

/**
 * Handle OPTIONS preflight request
 */
export async function OPTIONS(request: NextRequest) {
  logger.info('BICK API OPTIONS request');
  return handlePreflight(request, ['POST', 'OPTIONS']);
}

/**
 * Handle POST request - BICK computation
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Authenticate
    if (!validateBickApiKey(request)) {
      logger.warn('BICK API: Unauthorized request', {
        origin: request.headers.get('origin'),
        userAgent: request.headers.get('user-agent')
      });
      const response = createUnauthorizedResponse();
      return addCorsHeaders(response, request, ['POST', 'OPTIONS']);
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      logger.error('BICK API: Invalid JSON', { error });
      const response = new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'INVALID_JSON',
            message: 'Request body must be valid JSON'
          },
          metadata: {
            timestamp: new Date().toISOString()
          }
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
      return addCorsHeaders(response, request, ['POST', 'OPTIONS']);
    }

    // Process BICK computation
    const result = processBickRequest(body);
    
    const responseTime = Date.now() - startTime;
    logger.info('BICK API: Computation successful', {
      bick: result.bick,
      hasDelta: !!result.delta,
      responseTime
    });

    const response = NextResponse.json(
      {
        success: true,
        data: result,
        metadata: {
          timestamp: new Date().toISOString(),
          responseTime: `${responseTime}ms`
        }
      },
      { status: 200 }
    );

    return addCorsHeaders(response, request, ['POST', 'OPTIONS']);

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    if (error instanceof BickValidationError) {
      logger.warn('BICK API: Validation error', { 
        error: error.message,
        responseTime 
      });
      
      const response = new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message
          },
          metadata: {
            timestamp: new Date().toISOString(),
            responseTime: `${responseTime}ms`
          }
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      return addCorsHeaders(response, request, ['POST', 'OPTIONS']);
    }

    // Unexpected error
    logger.error('BICK API: Unexpected error', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      responseTime
    });

    const response = new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred'
        },
        metadata: {
          timestamp: new Date().toISOString(),
          responseTime: `${responseTime}ms`
        }
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );

    return addCorsHeaders(response, request, ['POST', 'OPTIONS']);
  }
}
