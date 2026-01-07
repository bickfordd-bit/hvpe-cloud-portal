import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/licenseSession.crypto";

export async function POST(req: NextRequest) {
  // 1. Verify Billy session
  const session = await getSession();
  if (!session || session.role !== "BILLY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Get credentials from request
  const { apiKey, apiSecret } = await req.json();

  if (!apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "API key and secret required" },
      { status: 400 },
    );
  }

  // 3. Validate credentials with Alpaca (test connection)
  try {
    const alpacaRes = await fetch(
      "https://paper-api.alpaca.markets/v2/account",
      {
        headers: {
          "APCA-API-KEY-ID": apiKey,
          "APCA-API-SECRET-KEY": apiSecret,
        },
      },
    );

    if (!alpacaRes.ok) {
      return NextResponse.json(
        { error: "Invalid Alpaca credentials" },
        { status: 400 },
      );
    }

    // 4. Store credentials in Vercel environment variables
    // Note: This requires VERCEL_TOKEN to be set as a secret
    const vercelToken = process.env.VERCEL_TOKEN;
    const vercelProjectId = process.env.VERCEL_PROJECT_ID;

    if (!vercelToken || !vercelProjectId) {
      return NextResponse.json(
        { error: "Vercel integration not configured" },
        { status: 500 },
      );
    }

    // Set environment variables via Vercel API
    await fetch(`https://api.vercel.com/v10/projects/${vercelProjectId}/env`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key: `ALPACA_API_KEY_${session.tenant}`,
        value: apiKey,
        type: "encrypted",
        target: ["production", "preview"],
      }),
    });

    await fetch(`https://api.vercel.com/v10/projects/${vercelProjectId}/env`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key: `ALPACA_API_SECRET_${session.tenant}`,
        value: apiSecret,
        type: "encrypted",
        target: ["production", "preview"],
      }),
    });

    return NextResponse.json({
      success: true,
      message: "Alpaca API connected successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Connection failed" },
      { status: 500 },
    );
  }
}
