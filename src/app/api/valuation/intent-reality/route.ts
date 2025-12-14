import { NextResponse, NextRequest } from "next/server";
import { ValuationEngine } from "@/lib/valuation/ValuationEngine";
import { IntentToRealityEngine } from "@/lib/valuation/IntentToRealityEngine";
import { defaultDashboardData } from "@/lib/hvpeDashboardData";

/**
 * Intent to Reality Valuation API
 *
 * Copyright (c) 2025 Bickford Technologies LLC
 * All Rights Reserved. Patent Pending.
 *
 * This API and the valuation methodologies contained herein are proprietary
 * intellectual property of Bickford Technologies LLC. Unauthorized access,
 * use, reproduction, or reverse engineering is strictly prohibited.
 *
 * CONFIDENTIAL AND PROPRIETARY
 * Protected under US Patent Law and International Copyright Conventions
 */

// IP Protection: Rate Limiting Store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// IP Protection: Rate Limiting Configuration
const RATE_LIMIT = {
  maxRequests: 10, // requests per window
  windowMs: 60 * 1000, // 1 minute window
};

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitStore.get(identifier);

  if (!userLimit || now > userLimit.resetTime) {
    // Reset or initialize rate limit
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT.windowMs
    });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT.maxRequests) {
    return false; // Rate limit exceeded
  }

  userLimit.count++;
  return true;
}

// IP Protection: Authentication Check
async function checkAuthentication(request: NextRequest): Promise<boolean> {
  // Check for API key in headers
  const apiKey = request.headers.get('X-API-Key');
  const authToken = request.headers.get('Authorization');

  // In production, validate against database or external auth service
  // For now, accept any authenticated session
  const usageId = request.headers.get('X-Usage-ID');

  if (!usageId) {
    return false; // Require usage tracking
  }

  // Placeholder validation - implement proper auth logic
  const hasValidCredentials = apiKey || authToken || usageId;
  return Boolean(hasValidCredentials);
}

// IP Protection: Usage Tracking
function logUsage(request: NextRequest, response: Record<string, unknown>) {
  const usageId = request.headers.get('X-Usage-ID');
  const userAgent = request.headers.get('User-Agent');
  const ip = request.headers.get('X-Forwarded-For') ||
             request.headers.get('CF-Connecting-IP') ||
             'unknown';

  console.log(`[IP PROTECTION] Intent-to-Reality API Usage:`, {
    usageId,
    ip,
    userAgent,
    timestamp: new Date().toISOString(),
    endpoint: '/api/valuation/intent-reality',
    responseSize: JSON.stringify(response).length
  });

  // In production, store this in database for audit trail
}

export async function GET(request: NextRequest) {
  try {
    // IP Protection: Authentication Check
    const isAuthenticated = await checkAuthentication(request);
    if (!isAuthenticated) {
      return NextResponse.json(
        { message: 'Authentication required. Please provide valid credentials.' },
        {
          status: 401,
          headers: {
            'WWW-Authenticate': 'Bearer',
            'X-IP-Protected': 'true'
          }
        }
      );
    }

    // IP Protection: Rate Limiting
    const clientIP = request.headers.get('X-Forwarded-For') ||
                     request.headers.get('CF-Connecting-IP') ||
                     'unknown';
    const usageId = request.headers.get('X-Usage-ID') || 'anonymous';

    const rateLimitKey = `${clientIP}:${usageId}`;
    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        { message: 'Rate limit exceeded. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-Rate-Limit-Reset': new Date(Date.now() + RATE_LIMIT.windowMs).toISOString()
          }
        }
      );
    }

    // Get traditional valuation
    const inputs = ValuationEngine.getDefaultInputs(defaultDashboardData.billionaires.people);
    const traditionalValuation = await ValuationEngine.runValuation(inputs);

    // Get intent-to-reality metrics
    const intentMetrics = IntentToRealityEngine.getDefaultMetrics();

    // Calculate enhanced valuation
    const enhancedValuation = IntentToRealityEngine.calculateEnhancedValuation(
      traditionalValuation.finalValuation,
      intentMetrics
    );

    // Calculate intent value breakdown
    const intentValue = IntentToRealityEngine.calculateIntentValue(
      traditionalValuation.finalValuation,
      intentMetrics
    );

    const response = {
      valuation: {
        traditional: traditionalValuation,
        intentToReality: intentValue,
        enhanced: enhancedValuation,
        timestamp: new Date().toISOString(),
        company: "Bickford Technologies"
      },
      _metadata: {
        generated: new Date().toISOString(),
        version: "1.0.0",
        license: "Proprietary - Bickford Technologies LLC",
        patent: "Patent Pending",
        usageId: usageId,
        rateLimitRemaining: RATE_LIMIT.maxRequests - (rateLimitStore.get(rateLimitKey)?.count || 0)
      }
    };

    // IP Protection: Usage Logging
    logUsage(request, response);

    // IP Protection: Legal Headers
    return NextResponse.json(response, {
      headers: {
        'X-IP-Protected': 'true',
        'X-Patent-Pending': 'US Provisional Patent Application Filed',
        'X-Copyright': '© 2025 Bickford Technologies LLC - All Rights Reserved',
        'X-License': 'Proprietary - Confidential',
        'X-Usage-ID': usageId,
        'Cache-Control': 'private, no-cache, no-store',
        'X-Content-Type-Options': 'nosniff'
      }
    });

  } catch (error) {
    console.error('Intent-to-reality valuation error:', error);

    // IP Protection: Error Logging (without exposing sensitive details)
    console.log(`[IP PROTECTION] API Error logged for usage ID: ${request.headers.get('X-Usage-ID')}`);

    return NextResponse.json(
      { message: `Access denied or system error. Contact support if this persists.` },
      {
        status: 500,
        headers: {
          'X-IP-Protected': 'true',
          'X-Error-Type': 'protected'
        }
      }
    );
  }
}