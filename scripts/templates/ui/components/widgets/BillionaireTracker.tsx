"use client";

import { Card } from "@/components/ui/Card";

type Person = {
  name: string;
  current: number;
  target: number;
  dailyVelocity: number;
};

const PEOPLE: Person[] = [
  { name: "Derek", current: 250_000, target: 1_000_000_000, dailyVelocity: 1250 },
  { name: "Jenna", current: 150_000, target: 1_000_000_000, dailyVelocity: 750 },
  { name: "Penelope", current: 25_000, target: 1_000_000_000, dailyVelocity: 125 },
  { name: "Xavier", current: 20_000, target: 1_000_000_000, dailyVelocity: 100 },
  { name: "Naomi", current: 15_000, target: 1_000_000_000, dailyVelocity: 75 },
];

function percent(p: Person) {
  return (p.current / p.target) * 100;
}

function calculateConfidenceScore(people: Person[]) {
  const aggregateCurrent = people.reduce((sum, p) => sum + p.current, 0);
  const aggregateVelocity = people.reduce((sum, p) => sum + p.dailyVelocity, 0);

  const coverage = Math.min(aggregateCurrent / (people.length * 1_000_000_000), 1);
  const velocityFactor = Math.min(aggregateVelocity / 10_000, 1);
  const normalized = Math.min(1, coverage * 0.6 + velocityFactor * 0.4);
  const score = Math.round(normalized * 100);

  if (score >= 75) {
    return { score, label: "High Confidence", color: "text-emerald-400" };
  }
  if (score >= 45) {
    return { score, label: "Operational Confidence", color: "text-yellow-300" };
  }
  return { score, label: "Experimental Confidence", color: "text-orange-400" };
}

export function BillionaireTracker() {
  const confidence = calculateConfidenceScore(PEOPLE);

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
              $1,000,000,000
            </span>
          </div>
          <div className="text-[11px] text-neutral-400">
            Billionaire Confidence:{" "}
            <span className={`font-semibold ${confidence.color}`}>
              {confidence.score}% – {confidence.label}
            </span>
          </div>
        </div>
        <div className="text-[11px] text-neutral-500 text-right">
          Velocity-driven wealth trajectories for the Bickford family.
        </div>
      </div>

      <div className="space-y-2 text-xs">
        {PEOPLE.map((p) => {
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
                <span>
                  Daily Velocity:{" "}
                  <span className="text-neutral-200">
                    {p.dailyVelocity.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 2,
                    })}
                    /day
                  </span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
