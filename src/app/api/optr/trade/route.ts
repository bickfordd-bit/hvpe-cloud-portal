import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { createSuccessResponse, createErrorResponse, ErrorCodes } from '@/lib/apiResponse';
import { randomUUID } from 'crypto';

// In-memory rate limiter (resets on server restart)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 30;

interface TradePayload {
  symbol?: string;
  side?: 'buy' | 'sell';
  mode?: 'auto' | 'dollars' | 'shares';
  dollars?: number;
  shares?: number;
  min_dollars?: number;
}

interface TradeRequest {
  symbol: string;
  side: 'buy' | 'sell';
  mode: 'auto' | 'dollars' | 'shares';
  dollars: number;
  shares: number;
  min_dollars: number;
  request_id: string;
}

function getClientIp(req: NextRequest): string {
  // Try to get real IP from headers (for proxies/load balancers)
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  // Fallback to a default (won't work well in production but prevents crashes)
  return 'unknown';
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetTime) {
    // New window
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  return { allowed: true, remaining: RATE_LIMIT_MAX - record.count };
}

function validatePayload(body: any, headerRequestId?: string): { valid: boolean; error?: string; data?: TradeRequest; requestId: string } {
  const requestId = headerRequestId || body.request_id || randomUUID();

  // Validate symbol
  if (!body.symbol || typeof body.symbol !== 'string') {
    return { valid: false, error: 'symbol is required and must be a string', requestId };
  }
  const symbol = body.symbol.toUpperCase().trim();
  if (symbol.length < 1 || symbol.length > 10) {
    return { valid: false, error: 'symbol must be 1-10 characters', requestId };
  }

  // Validate side
  const side = (body.side || 'buy').toLowerCase();
  if (side !== 'buy' && side !== 'sell') {
    return { valid: false, error: 'side must be buy or sell', requestId };
  }

  // Validate mode
  const mode = (body.mode || 'auto').toLowerCase();
  if (mode !== 'auto' && mode !== 'dollars' && mode !== 'shares') {
    return { valid: false, error: 'mode must be auto, dollars, or shares', requestId };
  }

  // Validate numbers
  const dollars = typeof body.dollars === 'number' ? body.dollars : 0;
  const shares = typeof body.shares === 'number' ? body.shares : 0;
  const minDollars = typeof body.min_dollars === 'number' ? body.min_dollars : 1;

  if (dollars < 0) {
    return { valid: false, error: 'dollars must be >= 0', requestId };
  }
  if (shares < 0) {
    return { valid: false, error: 'shares must be >= 0', requestId };
  }
  if (minDollars <= 0) {
    return { valid: false, error: 'min_dollars must be > 0', requestId };
  }

  // Mode-specific validation
  if (mode === 'shares' && shares <= 0) {
    return { valid: false, error: 'shares mode requires shares > 0', requestId };
  }
  if (mode === 'dollars' && dollars <= 0) {
    return { valid: false, error: 'dollars mode requires dollars > 0', requestId };
  }

  // Notional cap guardrail (for non-shares modes)
  const maxNotional = parseFloat(process.env.OPTR_MAX_NOTIONAL || '50');
  if (mode !== 'shares' && dollars > maxNotional) {
    return {
      valid: false,
      error: `dollars exceeds max notional cap of ${maxNotional}`,
      requestId
    };
  }

  return {
    valid: true,
    data: {
      symbol,
      side: side as 'buy' | 'sell',
      mode: mode as 'auto' | 'dollars' | 'shares',
      dollars,
      shares,
      min_dollars: minDollars,
      request_id: requestId
    },
    requestId
  };
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let requestId = '';

  try {
    // Check for x-request-id header
    const headerRequestId = req.headers.get('x-request-id');
    if (headerRequestId) {
      requestId = headerRequestId;
    }

    // Authentication
    const adminKey = req.headers.get('x-optr-admin-key');
    const expectedKey = process.env.OPTR_ADMIN_KEY;

    if (!expectedKey) {
      logger.error('OPTR_ADMIN_KEY not configured', { requestId });
      return createErrorResponse('Server misconfigured', 500, 'server_misconfigured');
    }

    if (!adminKey || adminKey !== expectedKey) {
      logger.warn('Unauthorized trade request attempt', { requestId, ip: getClientIp(req) });
      return createErrorResponse('Unauthorized', 401, ErrorCodes.UNAUTHORIZED);
    }

    // Rate limiting
    const ip = getClientIp(req);
    const { allowed, remaining } = checkRateLimit(ip);
    if (!allowed) {
      logger.warn('Rate limit exceeded', { requestId, ip });
      return createErrorResponse('Rate limit exceeded (30 requests per minute)', 429, 'rate_limited');
    }

    // Parse and validate payload
    const body = await req.json().catch(() => ({}));
    const validation = validatePayload(body, headerRequestId || undefined);
    requestId = validation.requestId; // Use the request ID from validation

    if (!validation.valid || !validation.data) {
      logger.warn('Invalid trade request', { requestId, error: validation.error, body });
      return createErrorResponse(validation.error || 'Invalid request body', 400, 'invalid_body');
    }

    const tradeRequest = validation.data;

    // Check worker URL
    const workerUrl = process.env.OPTR_WORKER_URL;
    if (!workerUrl) {
      logger.error('OPTR_WORKER_URL not configured', { requestId });
      return createErrorResponse('Worker not configured', 500, 'server_misconfigured');
    }

    // Log the trade request (without secrets)
    logger.info('Trade request received', {
      requestId,
      symbol: tradeRequest.symbol,
      side: tradeRequest.side,
      mode: tradeRequest.mode,
      dollars: tradeRequest.dollars,
      shares: tradeRequest.shares,
      ip
    });

    // Forward to worker
    try {
      const workerResponse = await fetch(workerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-optr-admin-key': adminKey,
          'x-request-id': requestId
        },
        body: JSON.stringify(tradeRequest)
      });

      const workerData = await workerResponse.json();
      const duration = Date.now() - startTime;

      if (!workerResponse.ok) {
        logger.error('Worker returned error', {
          requestId,
          status: workerResponse.status,
          response: workerData,
          duration
        });
        return NextResponse.json(
          {
            success: false,
            error: workerData.error || 'Worker execution failed',
            rid: requestId,
            metadata: {
              timestamp: new Date().toISOString(),
              duration,
              remaining
            }
          },
          { status: workerResponse.status }
        );
      }

      logger.info('Trade request completed', {
        requestId,
        duration,
        workerStatus: workerResponse.status
      });

      return NextResponse.json({
        success: true,
        data: workerData,
        rid: requestId,
        metadata: {
          timestamp: new Date().toISOString(),
          duration,
          remaining
        }
      });

    } catch (workerError: any) {
      logger.error('Failed to reach worker', {
        requestId,
        error: workerError.message,
        workerUrl
      });
      return createErrorResponse('Worker unreachable', 503, 'worker_unreachable');
    }

  } catch (error: any) {
    logger.error('Trade endpoint error', {
      requestId,
      error: error.message,
      stack: error.stack
    });
    return createErrorResponse(
      process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      500,
      ErrorCodes.INTERNAL_ERROR
    );
  }
}
