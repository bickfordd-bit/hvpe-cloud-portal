"use client";

import { ReactNode } from "react";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

type Position = {
  symbol: string;
  qty: number;
  side: "long" | "short";
  avgPrice: number;
  lastPrice: number;
  unrealized: number;
  today: number;
};

const DEFAULT_POSITIONS: Position[] = [
  {
    symbol: "NVDA",
    qty: 120,
    side: "long",
    avgPrice: 135.4,
    lastPrice: 138.9,
    unrealized: 420.0,
    today: 260.5,
  },
  {
    symbol: "TSLA",
    qty: 80,
    side: "long",
    avgPrice: 210.2,
    lastPrice: 205.1,
    unrealized: -408.0,
    today: -132.7,
  },
  {
    symbol: "AAPL",
    qty: 200,
    side: "long",
    avgPrice: 190.0,
    lastPrice: 193.2,
    unrealized: 640.0,
    today: 180.0,
  },
  {
    symbol: "SPY",
    qty: 50,
    side: "short",
    avgPrice: 520.5,
    lastPrice: 517.8,
    unrealized: 135.0,
    today: 88.4,
  },
];

export function LivePositionsTable({ positions }: { positions: Position[] }) {
  const rows = positions.length ? positions : DEFAULT_POSITIONS;
  return (
    <Card>
      <div className="flex items-center justify-between mb-3 text-xs">
        <div>
          <div className="uppercase tracking-[0.16em] text-neutral-500">
            Live Positions
          </div>
          <div className="mt-1 text-[11px] text-neutral-400">
            Real-time view of active exposure. Wire this to Alpaca positions.
          </div>
        </div>
        <div className="text-[11px] text-neutral-400 text-right">
          Gross Exposure:{" "}
          <span className="text-neutral-100 font-semibold">$142,317.00</span>
          <br />
          Net P/L Today:{" "}
          <span className="text-emerald-400 font-semibold">+$1,742.32</span>
        </div>
      </div>

      <div className="overflow-x-auto text-[11px]">
        <table className="min-w-full border-separate border-spacing-y-1">
          <thead className="text-neutral-500">
            <tr>
              <Th>Symbol</Th>
              <Th>Side</Th>
              <Th>Qty</Th>
              <Th>Avg Price</Th>
              <Th>Last</Th>
              <Th>Unrealized</Th>
              <Th>Today</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((position) => (
              <tr key={position.symbol}>
                <TdSymbol symbol={position.symbol} />
                <TdSide side={position.side} />
                <Td>{position.qty}</Td>
                <Td>${position.avgPrice.toFixed(2)}</Td>
                <Td>${position.lastPrice.toFixed(2)}</Td>
                <TdPnL value={position.unrealized} />
                <TdPnL value={position.today} small />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function Th({ children }: { children: ReactNode }) {
  return (
    <th className="py-1 px-2 text-left font-normal text-[10px] uppercase tracking-[0.12em]">
      {children}
    </th>
  );
}

function Td({ children }: { children: ReactNode }) {
  return (
    <td className="py-1.5 px-2 rounded-lg bg-neutral-950 border border-neutral-800">
      {children}
    </td>
  );
}

function TdSymbol({ symbol }: { symbol: string }) {
  return (
    <Td>
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold text-neutral-100">{symbol}</span>
        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-400">
          Equity
        </span>
      </div>
    </Td>
  );
}

function TdSide({ side }: { side: "long" | "short" }) {
  const isLong = side === "long";
  return (
    <Td>
      <span
        className={cn(
          "px-1.5 py-0.5 rounded-full text-[10px] font-medium",
          isLong
            ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40"
            : "bg-red-500/10 text-red-300 border border-red-500/40"
        )}
      >
        {isLong ? "LONG" : "SHORT"}
      </span>
    </Td>
  );
}

function TdPnL({ value, small }: { value: number; small?: boolean }) {
  const positive = value >= 0;
  return (
    <Td>
      <span
        className={cn(
          "font-semibold",
          small ? "text-[10px]" : "text-[11px]",
          positive ? "text-emerald-400" : "text-red-400"
        )}
      >
        {positive ? "+" : "-"}$
        {Math.abs(value).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>
    </Td>
  );
}
