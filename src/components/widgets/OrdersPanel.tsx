"use client";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

type OrderStatus = "pending" | "filled" | "canceled";

type Order = {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  qty: number;
  type: "market" | "limit";
  limitPrice?: number;
  status: OrderStatus;
  time: string;
};

const DEFAULT_ORDERS: Order[] = [
  {
    id: "1",
    symbol: "NVDA",
    side: "buy",
    qty: 50,
    type: "limit",
    limitPrice: 138.5,
    status: "pending",
    time: "09:46:12",
  },
  {
    id: "2",
    symbol: "TSLA",
    side: "sell",
    qty: 20,
    type: "market",
    status: "filled",
    time: "09:41:03",
  },
  {
    id: "3",
    symbol: "SPY",
    side: "sell",
    qty: 10,
    type: "limit",
    limitPrice: 518.0,
    status: "canceled",
    time: "09:39:27",
  },
];

export function OrdersPanel({ orders }: { orders: Order[] }) {
  const rows = orders.length ? orders : DEFAULT_ORDERS;
  return (
    <Card>
      <div className="flex items-center justify-between mb-3 text-xs">
        <div>
          <div className="uppercase tracking-[0.16em] text-neutral-500">Orders</div>
          <div className="mt-1 text-[11px] text-neutral-400">
            Snapshot of recent and working orders.
          </div>
        </div>
        <button className="text-[11px] text-blue-300 hover:text-blue-200">
          View in broker{"->"}
        </button>
      </div>

      <div className="space-y-2 text-[11px]">
        {rows.map((order) => (
          <div
            key={order.id}
            className="flex items-center justify-between gap-2 rounded-lg border border-neutral-800 bg-neutral-950 px-2.5 py-1.5"
          >
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-neutral-100">
                {order.symbol}
              </span>
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded-full text-[10px] font-medium",
                  order.side === "buy"
                    ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40"
                    : "bg-red-500/10 text-red-300 border border-red-500/40"
                )}
              >
                {order.side.toUpperCase()} {order.qty}
              </span>
              <span className="text-[10px] text-neutral-500 uppercase">
                {order.type}
              </span>
              {order.limitPrice && (
                <span className="text-[10px] text-neutral-400">
                  @{order.limitPrice.toFixed(2)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-neutral-500">
              <OrderStatusBadge status={order.status} />
              <span>{order.time}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const cfg =
    status === "pending"
      ? {
          label: "Pending",
          cls: "bg-yellow-500/10 text-yellow-200 border-yellow-500/40",
        }
      : status === "filled"
      ? {
          label: "Filled",
          cls: "bg-emerald-500/10 text-emerald-200 border-emerald-500/40",
        }
      : {
          label: "Canceled",
          cls: "bg-neutral-700/20 text-neutral-200 border-neutral-500/40",
        };

  return (
    <span className={cn("px-1.5 py-0.5 rounded-full text-[10px] border", cfg.cls)}>
      {cfg.label}
    </span>
  );
}
