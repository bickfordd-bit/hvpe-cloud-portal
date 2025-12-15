import { NextResponse } from "next/server";

/**
 * Health check endpoint
 * GET /api/health - Public, no authentication required
 */
export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      version: process.env.BICK_VERSION || "v1"
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    }
  );
}
