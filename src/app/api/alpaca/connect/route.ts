import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/licenseSession.crypto";
import { executeWithPresence } from "@/lib/execution/withPresence";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "BILLY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { apiKey, apiSecret } = await req.json();

  if (!apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "API key and secret required" },
      { status: 400 }
    );
  }

  return executeWithPresence({
    tenant_id: session.tenant,
    intent: "connect_alpaca_api",
    action: async () => {
      try {
        const alpacaRes = await fetch(
          "https://paper-api.alpaca.markets/v2/account",
          {
            headers: {
              "APCA-API-KEY-ID": apiKey,
              "APCA-API-SECRET-KEY": apiSecret,
            },
          }
        );

        if (!alpacaRes.ok) {
          return NextResponse.json(
            { error: "Invalid Alpaca credentials" },
            { status: 400 }
          );
        }

        const vercelToken = process.env.VERCEL_TOKEN;
        const vercelProjectId = process.env.VERCEL_PROJECT_ID;

        if (!vercelToken || !vercelProjectId) {
          return NextResponse.json(
            { error: "Vercel integration not configured" },
            { status: 500 }
          );
        }

        await fetch(
          `https://api.vercel.com/v10/projects/${vercelProjectId}/env`,
          {
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
          }
        );

        await fetch(
          `https://api.vercel.com/v10/projects/${vercelProjectId}/env`,
          {
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
          }
        );

        return NextResponse.json({
          success: true,
          message: "Alpaca API connected successfully",
        });
      } catch (error: any) {
        return NextResponse.json(
          { error: error.message || "Connection failed" },
          { status: 500 }
        );
      }
    },
  });
}
