import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/licenseSession.crypto";
import { executeWithPresence } from "@/lib/execution/withPresence";

export async function GET(_req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "BILLY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env[`ALPACA_API_KEY_${session.tenant}`];
  const apiSecret = process.env[`ALPACA_API_SECRET_${session.tenant}`];

  if (!apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "Alpaca API not connected" },
      { status: 400 }
    );
  }

  return executeWithPresence({
    tenant_id: session.tenant,
    intent: "fetch_alpaca_portfolio",
    action: async () => {
      try {
        const accountRes = await fetch(
          "https://paper-api.alpaca.markets/v2/account",
          {
            headers: {
              "APCA-API-KEY-ID": apiKey,
              "APCA-API-SECRET-KEY": apiSecret,
            },
          }
        );

        if (!accountRes.ok) {
          throw new Error("Failed to fetch account");
        }

        const account = await accountRes.json();

        const positionsRes = await fetch(
          "https://paper-api.alpaca.markets/v2/positions",
          {
            headers: {
              "APCA-API-KEY-ID": apiKey,
              "APCA-API-SECRET-KEY": apiSecret,
            },
          }
        );

        const positions = positionsRes.ok ? await positionsRes.json() : [];

        return NextResponse.json({
          equity: account.equity,
          cash: account.cash,
          buying_power: account.buying_power,
          portfolio_value: account.portfolio_value,
          positions,
        });
      } catch (error: any) {
        return NextResponse.json(
          { error: error.message || "Failed to fetch portfolio" },
          { status: 500 }
        );
      }
    },
  });
}
