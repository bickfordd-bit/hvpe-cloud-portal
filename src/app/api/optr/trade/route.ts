import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, ErrorCodes } from '@/lib/apiResponse';
import { apiLogger as logger } from '@/lib/logger';

/**
 * OPTR Trade Trigger API
 * 
 * Authenticates with OPTR_ADMIN_KEY and forwards trade requests to the execution worker.
 * 
 * POST /api/optr/trade
 * Headers: x-optr-admin-key (required)
 * Body: {
 *   symbol: string (e.g., "AAPL")
 *   side: "buy" | "sell"
 *   mode: "auto" | "dollars" | "shares"
 *   dollars?: number (required if mode is "dollars" or "auto")
 *   shares?: number (required if mode is "shares")
 *   min_dollars?: number (optional, minimum order size for auto mode)
 * }
 */

interface TradeRequest {
  symbol: string;
  side: 'buy' | 'sell';
  mode: 'auto' | 'dollars' | 'shares';
  dollars?: number;
  shares?: number;
  min_dollars?: number;
}

interface TradeResponse {
  success: boolean;
  message?: string;
  order_id?: string;
  details?: any;
  error?: string;
}

export async function POST(req: NextRequest) {
  try {
    // Authenticate with OPTR_ADMIN_KEY
    const adminKey = req.headers.get('x-optr-admin-key');
    const expectedKey = process.env.OPTR_ADMIN_KEY;

    if (!expectedKey) {
      logger.error('OPTR_ADMIN_KEY not configured');
      return createErrorResponse(
        'Service configuration error',
        500,
        ErrorCodes.INTERNAL_ERROR
      );
    }

    if (!adminKey || adminKey !== expectedKey) {
      logger.warn('Unauthorized OPTR trade attempt', {
        hasKey: !!adminKey,
        ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
      });
      return createErrorResponse(
        'Unauthorized - Invalid or missing x-optr-admin-key',
        401,
        ErrorCodes.UNAUTHORIZED
      );
    }

    // Parse and validate request body
    const body = await req.json() as TradeRequest;
    const { symbol, side, mode, dollars, shares, min_dollars } = body;

    if (!symbol || !side || !mode) {
      return createErrorResponse(
        'Missing required fields: symbol, side, mode',
        400,
        ErrorCodes.INVALID_INPUT
      );
    }

    if (!['buy', 'sell'].includes(side)) {
      return createErrorResponse(
        'Invalid side - must be "buy" or "sell"',
        400,
        ErrorCodes.INVALID_INPUT
      );
    }

    if (!['auto', 'dollars', 'shares'].includes(mode)) {
      return createErrorResponse(
        'Invalid mode - must be "auto", "dollars", or "shares"',
        400,
        ErrorCodes.INVALID_INPUT
      );
    }

    if (mode === 'shares' && !shares) {
      return createErrorResponse(
        'shares parameter required when mode is "shares"',
        400,
        ErrorCodes.MISSING_REQUIRED_FIELD
      );
    }

    if ((mode === 'dollars' || mode === 'auto') && !dollars) {
      return createErrorResponse(
        'dollars parameter required when mode is "dollars" or "auto"',
        400,
        ErrorCodes.MISSING_REQUIRED_FIELD
      );
    }

    // Forward to execution worker
    const workerUrl = process.env.OPTR_WORKER_URL;
    if (!workerUrl) {
      logger.error('OPTR_WORKER_URL not configured');
      return createErrorResponse(
        'Worker service not configured',
        500,
        ErrorCodes.INTERNAL_ERROR
      );
    }

    logger.info('Forwarding trade request to worker', {
      symbol,
      side,
      mode,
      workerUrl
    });

    const workerResponse = await fetch(workerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-optr-admin-key': adminKey
      },
      body: JSON.stringify({
        symbol,
        side,
        mode,
        dollars,
        shares,
        min_dollars
      })
    });

    const workerData = await workerResponse.json() as TradeResponse;

    if (!workerResponse.ok) {
      logger.error('Worker returned error', {
        status: workerResponse.status,
        data: workerData
      });
      return createErrorResponse(
        workerData.error || workerData.message || 'Worker execution failed',
        workerResponse.status,
        ErrorCodes.EXTERNAL_SERVICE_ERROR
      );
    }

    logger.info('Trade executed successfully', {
      symbol,
      side,
      order_id: workerData.order_id
    });

    return createSuccessResponse(workerData, 200);

  } catch (error: any) {
    logger.error('Trade API error', error, {
      message: error.message,
      stack: error.stack
    });

    if (error.name === 'AbortError' || error.code === 'ECONNREFUSED') {
      return createErrorResponse(
        'Unable to connect to execution worker',
        503,
        ErrorCodes.EXTERNAL_SERVICE_ERROR
      );
    }

    return createErrorResponse(
      error.message || 'Internal server error',
      500,
      ErrorCodes.INTERNAL_ERROR
    );
  }
}
