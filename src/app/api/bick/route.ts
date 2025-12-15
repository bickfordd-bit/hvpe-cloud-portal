import { NextRequest, NextResponse } from "next/server";

/**
 * BICK API Endpoint - POST /api/bick
 * 
 * Calculates BICK value using the formula: (V / T) * E * L
 * Optionally computes delta from baseline.
 * 
 * Required headers:
 *   x-bick-key: API key matching BICK_API_KEY environment variable
 * 
 * Request body:
 *   {
 *     V: number,        // Required
 *     T: number,        // Required
 *     E: number,        // Required
 *     L: number,        // Required
 *     D?: number,       // Optional
 *     baseline?: number // Optional
 *   }
 * 
 * Response:
 *   {
 *     bick: number,
 *     components: {
 *       V: number,
 *       T: number,
 *       E: number,
 *       L: number,
 *       D: number | null,
 *       baseline: number | null
 *     },
 *     delta: number | null
 *   }
 */

interface BickRequest {
  V: number;
  T: number;
  E: number;
  L: number;
  D?: number;
  baseline?: number;
}

interface BickResponse {
  bick: number;
  components: {
    V: number;
    T: number;
    E: number;
    L: number;
    D: number | null;
    baseline: number | null;
  };
  delta: number | null;
}

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : null,
].filter(Boolean) as string[];

function getCorsHeaders(origin: string | null): HeadersInit {
  const headers: HeadersInit = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-bick-key",
    "Access-Control-Max-Age": "86400",
  };

  // Allow same-origin requests (no Origin header) or requests from allowed origins
  if (!origin || ALLOWED_ORIGINS.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin || "*";
    headers["Access-Control-Allow-Credentials"] = "true";
  }

  return headers;
}

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  try {
    // Check API key authentication
    const apiKey = request.headers.get("x-bick-key");
    const expectedKey = process.env.BICK_API_KEY;

    if (!expectedKey) {
      return NextResponse.json(
        { error: "Server configuration error: BICK_API_KEY not set" },
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }

    if (!apiKey || apiKey !== expectedKey) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or missing x-bick-key header" },
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    // Parse request body
    let body: BickRequest;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Validate required fields
    const { V, T, E, L, D, baseline } = body;

    if (typeof V !== "number" || isNaN(V)) {
      return NextResponse.json(
        { error: "Missing or invalid required field: V (must be a number)" },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    if (typeof T !== "number" || isNaN(T)) {
      return NextResponse.json(
        { error: "Missing or invalid required field: T (must be a number)" },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    if (typeof E !== "number" || isNaN(E)) {
      return NextResponse.json(
        { error: "Missing or invalid required field: E (must be a number)" },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    if (typeof L !== "number" || isNaN(L)) {
      return NextResponse.json(
        { error: "Missing or invalid required field: L (must be a number)" },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Check for division by zero
    if (T === 0) {
      return NextResponse.json(
        { error: "Invalid value: T cannot be zero (division by zero)" },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Validate optional fields if provided
    if (D !== undefined && (typeof D !== "number" || isNaN(D))) {
      return NextResponse.json(
        { error: "Invalid optional field: D (must be a number if provided)" },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    if (baseline !== undefined && (typeof baseline !== "number" || isNaN(baseline))) {
      return NextResponse.json(
        { error: "Invalid optional field: baseline (must be a number if provided)" },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Calculate BICK: (V / T) * E * L
    const bick = (V / T) * E * L;

    // Calculate delta if baseline is provided
    const delta = baseline !== undefined ? bick - baseline : null;

    // Construct response
    const response: BickResponse = {
      bick,
      components: {
        V,
        T,
        E,
        L,
        D: D ?? null,
        baseline: baseline ?? null,
      },
      delta,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Error processing BICK request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}
