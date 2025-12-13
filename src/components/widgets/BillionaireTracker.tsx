"use client";

import { Card } from "@/components/ui/Card";
import type {
  BillionairePerson,
} from "@/lib/hvpeDashboardData";

function percent(p: BillionairePerson) {
  return (p.current / p.target) * 100;
}

function yearsToTarget(p: BillionairePerson) {
  const remaining = p.target - p.current;
  if (remaining <= 0) return 0;
  const days = remaining / p.dailyVelocity;
  return days / 365.25; // account for leap years
}

export function BillionaireTracker({
  target,
  description,
  people,
}: {
  target: number;
  description: string;
  people: BillionairePerson[];
}) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs uppercase tracking-[0.16em] text-neutral-500">
            Independent Billionaire Tracker
          </div>
          <div className="mt-1 text-[11px] text-neutral-400">
            Target per person:{" "}
            <span className="text-neutral-100 font-semibold">
              ${target.toLocaleString("en-US")}
            </span>
          </div>
        </div>
        <div className="text-[11px] text-neutral-500 text-right">
          {description}
        </div>
      </div>

      <div className="space-y-2 text-xs">
        {people.map((p) => {
          const pct = percent(p);
          return (
            <div key={p.name} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-neutral-100">{p.name}</span>
                <span className="text-neutral-300">
                  {p.current.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
              <div className="h-3 rounded-full bg-neutral-900 border border-neutral-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 shadow-[0_0_18px_rgba(34,197,235,0.7)]"
                  style={{ width: `${Math.max(pct, 0.5)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-neutral-500">
                <span>{pct.toFixed(4)}% of target</span>
                <div className="text-right">
                  <div>
                    Daily Velocity:{" "}
                    <span className="text-neutral-200">
                      {p.dailyVelocity.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                        maximumFractionDigits: 2,
                      })}
                      /day
                    </span>
                  </div>
                  <div>
                    Timeline:{" "}
                    <span className="text-neutral-200">
                      {yearsToTarget(p).toFixed(1)} years
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
