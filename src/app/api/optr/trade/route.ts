import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, ErrorCodes } from '@/lib/apiResponse';
import { logger } from '@/lib/logger';

// Rate limiting: in-memory store (30 requests per minute per IP)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 30;

// Notional tracking: per-day per admin-key/IP (best effort, in-memory)
const notionalTracker = new Map<string, { total: number; date: string }>();

interface TradeRequest {
  symbol: string;
  side: 'buy' | 'sell';
  qty?: number;
  notional?: number;
  type?: 'market' | 'limit';
  time_in_force?: 'day' | 'gtc' | 'ioc' | 'fok';
  limit_price?: number;
}

interface TradeResponse {
  success: boolean;
  reason?: string;
  order_id?: string;
  filled_qty?: number;
  filled_avg_price?: number;
  status?: string;
  rid: string;
}

/**
 * Check rate limit for IP address
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Get current UTC date string (YYYY-MM-DD)
 */
function getCurrentDateUTC(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Track and check daily notional limit
 */
function checkDailyNotional(key: string, amount: number, maxDaily: number | undefined): { ok: boolean; current: number } {
  if (!maxDaily) {
    return { ok: true, current: 0 };
  }

  const today = getCurrentDateUTC();
  const record = notionalTracker.get(key);

  if (!record || record.date !== today) {
    // New day, reset counter
    notionalTracker.set(key, { total: amount, date: today });
    return { ok: amount <= maxDaily, current: amount };
  }

  const newTotal = record.total + amount;
  if (newTotal > maxDaily) {
    return { ok: false, current: record.total };
  }

  record.total = newTotal;
  return { ok: true, current: newTotal };
}

/**
 * Get client IP from request
 */
function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  return 'unknown';
}

/**
 * Validate symbol against allowlist if configured
 */
function validateSymbol(symbol: string, allowlist: string[] | null): { ok: boolean; reason?: string } {
  if (!allowlist || allowlist.length === 0) {
    return { ok: true };
  }

  const normalized = symbol.toUpperCase();
  if (!allowlist.includes(normalized)) {
    return { ok: false, reason: 'symbol_not_allowed' };
  }

  return { ok: true };
}

/**
 * Calculate notional amount from trade request
 */
function calculateNotional(trade: TradeRequest): number | null {
  if (trade.notional) {
    return trade.notional;
  }
  // For qty mode, we can't determine notional without price - executor will handle this
  return null;
}

/**
 * POST /api/optr/trade
 * Execute a trade via Alpaca worker with safety guards
 */
export async function POST(req: NextRequest) {
  const rid = req.headers.get('x-request-id') || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    // 1. Check rate limit (best effort)
    const clientIP = getClientIP(req);
    if (!checkRateLimit(clientIP)) {
      logger.warn('Rate limit exceeded', { ip: clientIP, rid });
      return createErrorResponse(
        'Rate limit exceeded. Maximum 30 requests per minute.',
        429,
        ErrorCodes.RATE_LIMIT_EXCEEDED
      );
    }

    // 2. Authenticate via x-optr-admin-key
    const adminKey = req.headers.get('x-optr-admin-key');
    const expectedKey = process.env.OPTR_ADMIN_KEY;

    if (!expectedKey) {
      logger.error('OPTR_ADMIN_KEY not configured', { rid });
      return createErrorResponse(
        'Trade API not configured',
        500,
        ErrorCodes.INTERNAL_ERROR
      );
    }

    if (!adminKey || adminKey !== expectedKey) {
      logger.warn('Unauthorized trade attempt', { ip: clientIP, rid });
      return createErrorResponse(
        'Unauthorized. Valid x-optr-admin-key required.',
        401,
        ErrorCodes.UNAUTHORIZED
      );
    }

    // 3. Parse and validate request body
    let body: TradeRequest;
    try {
      body = await req.json();
    } catch (err) {
      logger.warn('Invalid JSON in trade request', { rid });
      return createErrorResponse(
        'Invalid JSON payload',
        400,
        ErrorCodes.INVALID_INPUT
      );
    }

    if (!body.symbol || !body.side) {
      logger.warn('Missing required fields', { body, rid });
      return createErrorResponse(
        'Missing required fields: symbol, side',
        400,
        ErrorCodes.MISSING_REQUIRED_FIELD
      );
    }

    if (!['buy', 'sell'].includes(body.side)) {
      logger.warn('Invalid side value', { side: body.side, rid });
      return createErrorResponse(
        'Invalid side. Must be "buy" or "sell".',
        400,
        ErrorCodes.INVALID_INPUT
      );
    }

    if (!body.qty && !body.notional) {
      logger.warn('Must specify qty or notional', { body, rid });
      return createErrorResponse(
        'Must specify either qty (shares) or notional (dollars)',
        400,
        ErrorCodes.MISSING_REQUIRED_FIELD
      );
    }

    // 4. Check symbol allowlist
    const allowlistEnv = process.env.OPTR_SYMBOL_ALLOWLIST;
    const allowlist = allowlistEnv ? allowlistEnv.split(',').map(s => s.trim().toUpperCase()) : null;
    
    const symbolCheck = validateSymbol(body.symbol, allowlist);
    if (!symbolCheck.ok) {
      logger.warn('Symbol not in allowlist', { symbol: body.symbol, allowlist, rid });
      return NextResponse.json(
        {
          success: false,
          reason: symbolCheck.reason,
          rid,
          metadata: {
            timestamp: new Date().toISOString(),
            symbol: body.symbol,
            allowlist: allowlist || []
          }
        },
        { status: 400 }
      );
    }

    // 5. Check per-request notional cap (for dollars/notional mode)
    const maxNotional = process.env.OPTR_MAX_NOTIONAL ? parseFloat(process.env.OPTR_MAX_NOTIONAL) : 50;
    const notional = calculateNotional(body);
    
    if (notional !== null && notional > maxNotional) {
      logger.warn('Notional exceeds max', { notional, maxNotional, rid });
      return NextResponse.json(
        {
          success: false,
          reason: 'exceeds_max_notional',
          rid,
          metadata: {
            timestamp: new Date().toISOString(),
            requested: notional,
            max: maxNotional
          }
        },
        { status: 400 }
      );
    }

    // 6. Check per-day notional cap (best effort)
    const maxDaily = process.env.OPTR_MAX_NOTIONAL_PER_DAY ? parseFloat(process.env.OPTR_MAX_NOTIONAL_PER_DAY) : undefined;
    if (notional !== null && maxDaily) {
      const trackingKey = adminKey; // Track by admin key
      const dailyCheck = checkDailyNotional(trackingKey, notional, maxDaily);
      
      if (!dailyCheck.ok) {
        logger.warn('Daily notional limit exceeded', { 
          current: dailyCheck.current, 
          requested: notional, 
          maxDaily,
          rid 
        });
        return NextResponse.json(
          {
            success: false,
            reason: 'exceeds_daily_notional',
            rid,
            metadata: {
              timestamp: new Date().toISOString(),
              current: dailyCheck.current,
              requested: notional,
              max: maxDaily
            }
          },
          { status: 400 }
        );
      }
    }

    // 7. Forward to Python worker
    const workerUrl = process.env.OPTR_WORKER_URL;
    if (!workerUrl) {
      logger.error('OPTR_WORKER_URL not configured', { rid });
      return createErrorResponse(
        'Worker endpoint not configured',
        500,
        ErrorCodes.INTERNAL_ERROR
      );
    }

    logger.info('Forwarding trade to worker', { 
      symbol: body.symbol, 
      side: body.side, 
      qty: body.qty,
      notional: body.notional,
      workerUrl,
      rid 
    });

    const workerResponse = await fetch(workerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-optr-admin-key': adminKey,
        'x-request-id': rid
      },
      body: JSON.stringify(body)
    });

    const workerData = await workerResponse.json();

    if (!workerResponse.ok) {
      logger.error('Worker returned error', { 
        status: workerResponse.status, 
        data: workerData,
        rid 
      });
      
      // Return worker's response with rid
      return NextResponse.json(
        {
          ...workerData,
          rid
        },
        { status: workerResponse.status }
      );
    }

    logger.info('Trade executed successfully', { 
      orderId: workerData.order_id,
      rid 
    });

    // Success - include rid
    return NextResponse.json(
      {
        ...workerData,
        rid
      },
      { status: 200 }
    );

  } catch (error) {
    logger.error('Trade API error', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      rid 
    });

    return NextResponse.json(
      {
        success: false,
        reason: 'internal_error',
        error: error instanceof Error ? error.message : 'Unknown error',
        rid
      },
      { status: 500 }
    );
  }
}
