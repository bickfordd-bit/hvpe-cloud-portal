"use client";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

type Trade = {
  id: string;
  time: string;
  symbol: string;
  side: "buy" | "sell";
  qty: number;
  price: number;
  pnl: number;
};

const DEFAULT_TRADES: Trade[] = [
  {
    id: "t1",
    time: "09:52:14",
    symbol: "NVDA",
    side: "buy",
    qty: 30,
    price: 138.7,
    pnl: 96.4,
  },
  {
    id: "t2",
    time: "09:48:33",
    symbol: "AAPL",
    side: "sell",
    qty: 50,
    price: 193.0,
    pnl: 212.5,
  },
  {
    id: "t3",
    time: "09:43:05",
    symbol: "TSLA",
    side: "buy",
    qty: 15,
    price: 205.9,
    pnl: -54.2,
  },
];

export function TradeTimeline({ trades }: { trades: Trade[] }) {
  const rows = trades.length ? trades : DEFAULT_TRADES;
  return (
    <Card>
      <div className="flex items-center justify-between mb-3 text-xs">
        <div>
          <div className="uppercase tracking-[0.16em] text-neutral-500">
            Executed Trades
          </div>
          <div className="mt-1 text-[11px] text-neutral-400">
            Chronological log of fills. Wire directly to HVPE trade history.
          </div>
        </div>
        <div className="text-[11px] text-neutral-400 text-right">
          Trades (session):{" "}
          <span className="text-neutral-100 font-semibold">
            {rows.length}
          </span>
        </div>
      </div>

      <div className="relative mt-1 pl-4 text-[11px]">
        <div className="absolute left-[7px] top-0 bottom-0 w-px bg-neutral-800" />
        <div className="space-y-2">
          {rows.map((trade, index) => (
            <div key={trade.id} className="relative flex gap-2">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "h-3 w-3 rounded-full border-2",
                    index === 0
                      ? "border-emerald-400 bg-emerald-500/40"
                      : "border-blue-400 bg-blue-500/40"
                  )}
                />
              </div>
              <div className="flex-1 rounded-lg border border-neutral-800 bg-neutral-950 px-2.5 py-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-neutral-500">{trade.time}</span>
                    <span className="text-[11px] font-semibold text-neutral-100">
                      {trade.symbol}
                    </span>
                    <span
                      className={cn(
                        "px-1.5 py-0.5 rounded-full text-[10px] font-medium",
                        trade.side === "buy"
                          ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40"
                          : "bg-red-500/10 text-red-300 border border-red-500/40"
                      )}
                    >
                      {trade.side.toUpperCase()} {trade.qty}
                    </span>
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    @{trade.price.toFixed(2)}
                  </div>
                </div>
                <div className="mt-1 text-[10px] text-neutral-500">
                  Session P/L:{" "}
                  <span
                    className={cn(
                      "font-semibold",
                      trade.pnl >= 0 ? "text-emerald-400" : "text-red-400"
                    )}
                  >
                    {trade.pnl >= 0 ? "+" : "-"}$
                    {Math.abs(trade.pnl).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
