import { NextResponse } from "next/server";

/**
 * Version API Endpoint - GET /api/version
 * 
 * Returns the current BICK API version.
 * Version is read from BICK_VERSION environment variable,
 * defaulting to "v1" if not set.
 */

export async function GET() {
  const version = process.env.BICK_VERSION ?? "v1";
  
  return NextResponse.json(
    { version },
    {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=3600",
      },
    }
  );
}
