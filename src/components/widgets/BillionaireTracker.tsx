"use client";

import { Card } from "@/components/ui/Card";
import type {
  BillionairePerson,
} from "@/lib/hvpeDashboardData";
import { useState, useEffect } from "react";

function formatSaleDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC'
  });
}

function getDaysUntilSale(dateString: string, now: number): number {
  const saleDate = new Date(dateString);
  const diffTime = saleDate.getTime() - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function calculateBillionairePath(totalValue: number, years: number): { 
  requiredReturn: number; 
  projectedValue: number; 
  isAchievable: boolean 
} {
  const target = 1_000_000_000; // $1B
  const currentValue = totalValue;
  
  if (currentValue >= target) {
    return { requiredReturn: 0, projectedValue: currentValue, isAchievable: true };
  }
  
  // Calculate required annual return to reach $1B
  const requiredReturn = Math.pow(target / currentValue, 1 / years) - 1;
  
  // Assuming 15% annual return (conservative for high-growth investments)
  const assumedReturn = 0.15;
  const projectedValue = currentValue * Math.pow(1 + assumedReturn, years);
  
  return {
    requiredReturn,
    projectedValue,
    isAchievable: projectedValue >= target
  };
}

function calculateProjectedWealth(people: BillionairePerson[]): {
  totalValue: number;
  timelineYears: number;
} {
  // Calculate total projected value from IP portfolio
  const totalValue = people.reduce((sum, person) => {
    // Estimate value based on status and sale dates
    let value = 0;
    switch (person.status) {
      case 'sold':
        value = person.projectedValue || 0;
        break;
      case 'ready-to-sell':
        value = (person.projectedValue || 0) * 0.9; // 90% probability
        break;
      case 'created':
        value = (person.projectedValue || 0) * 0.7; // 70% probability
        break;
      case 'in-development':
        value = (person.projectedValue || 0) * 0.4; // 40% probability
        break;
      default:
        value = 0;
    }
    return sum + value;
  }, 0);

  // Calculate timeline based on earliest sale date
  const saleDates = people
    .filter(p => p.saleDate)
    .map(p => new Date(p.saleDate!))
    .sort((a, b) => a.getTime() - b.getTime());

  // Use a fixed reference date to avoid hydration issues
  const referenceDate = new Date('2025-12-14T00:00:00Z').getTime();
  const timelineYears = saleDates.length > 0
    ? Math.max(1, (saleDates[0].getTime() - referenceDate) / (1000 * 60 * 60 * 24 * 365))
    : 3; // Default 3 years if no dates

  return { totalValue, timelineYears };
}

const STATUS_CONFIDENCE_WEIGHT: Record<BillionairePerson["status"], number> = {
  "sold": 1,
  "ready-to-sell": 0.85,
  "created": 0.65,
  "in-development": 0.4,
};

function calculateConfidenceScore(
  people: BillionairePerson[],
  projection: { totalValue: number; timelineYears: number },
  billionairePath: { isAchievable: boolean }
): { score: number; label: string; color: string; commentary: string } {
  const target = 1_000_000_000;
  const coverage = Math.min(projection.totalValue / target, 1); // value progress
  const readiness =
    people.length > 0
      ? people.reduce((sum, person) => sum + STATUS_CONFIDENCE_WEIGHT[person.status], 0) /
        people.length
      : 0;
  const timelineFactor = Math.max(0, Math.min(1, 1 - (projection.timelineYears - 3) / 7));
  const achievabilityBoost = billionairePath.isAchievable ? 0.08 : 0;

  const normalizedScore = Math.min(
    1,
    coverage * 0.5 + readiness * 0.3 + timelineFactor * 0.2 + achievabilityBoost
  );
  const score = Math.round(normalizedScore * 100);

  if (score >= 75) {
    return {
      score,
      label: "High Confidence",
      color: "text-emerald-400",
      commentary: "Track passes proof gate thresholds.",
    };
  }

  if (score >= 45) {
    return {
      score,
      label: "Operational Confidence",
      color: "text-yellow-300",
      commentary: "Momentum is good but requires acceleration.",
    };
  }

  return {
    score,
    label: "Experimental Confidence",
    color: "text-orange-400",
    commentary: "Scale IP creation + readiness before compounding.",
  };
}

function getStatusColor(status: BillionairePerson['status']): string {
  switch (status) {
    case 'sold': return 'text-emerald-400';
    case 'ready-to-sell': return 'text-blue-400';
    case 'created': return 'text-yellow-400';
    case 'in-development': return 'text-neutral-400';
    default: return 'text-neutral-400';
  }
}

export function BillionaireTracker({
  people,
  description,
}: {
  people: BillionairePerson[];
  description: string;
}) {
  // Use client-side state for current time to avoid hydration mismatch
  const [currentTime, setCurrentTime] = useState<number>(new Date('2025-12-14T00:00:00Z').getTime());
  
  useEffect(() => {
    // Only update to real time on client after initial render
    setCurrentTime(Date.now());
  }, []);
  
  const projection = calculateProjectedWealth(people);
  const billionairePath = calculateBillionairePath(projection.totalValue, projection.timelineYears);
  const confidence = calculateConfidenceScore(people, projection, billionairePath);
  
  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs uppercase tracking-[0.16em] text-neutral-500">
            IP Portfolio Sale Tracker
          </div>
          <div className="mt-1 text-[11px] text-neutral-400">
            Projected Total Value: <span className="text-neutral-100 font-semibold">${projection.totalValue.toLocaleString("en-US")}</span>
          </div>
          <div className="text-[11px] text-neutral-400">
            Timeline to Complete: <span className="text-neutral-100 font-semibold">{projection.timelineYears.toFixed(1)} years</span>
          </div>
          <div className="text-[11px] text-neutral-400">
            Billionaire Path: <span className={`font-semibold ${billionairePath.isAchievable ? 'text-emerald-400' : 'text-orange-400'}`}>
              ${billionairePath.projectedValue.toLocaleString("en-US")} 
              {billionairePath.isAchievable ? ' ✓' : ' (needs acceleration)'}
            </span>
          </div>
          <div className="text-[11px] text-neutral-400">
            Billionaire Confidence:{" "}
            <span className={`font-semibold ${confidence.color}`}>
              {confidence.score}% – {confidence.label}
            </span>
          </div>
          <div className="text-[10px] text-neutral-500">
            {confidence.commentary}
          </div>
        </div>
        <div className="text-[11px] text-neutral-500 text-right">
          {description}
        </div>
      </div>

      <div className="space-y-2 text-xs">
        {people.map((p) => {
          const daysUntil = getDaysUntilSale(p.saleTimeline, currentTime);
          const isOverdue = daysUntil < 0;
          return (
            <div key={p.name} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-neutral-100">{p.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(p.status)} bg-current/10`}>
                  {p.status.replace('-', ' ')}
                </span>
              </div>
              <div className="h-3 rounded-full bg-neutral-900 border border-neutral-800 overflow-hidden">
                <div
                  className={`h-full ${p.ipCreated ? 'bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400' : 'bg-neutral-700'} shadow-[0_0_18px_rgba(34,197,235,0.7)]`}
                  style={{ width: p.ipCreated ? '100%' : '30%' }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-neutral-500">
                <div>
                  <div>
                    IP Value:{" "}
                    <span className="text-neutral-200">
                      {p.ipValue > 0 ? `$${p.ipValue.toLocaleString("en-US")}` : 'N/A'}
                    </span>
                  </div>
                  <div>
                    Sale Timeline:{" "}
                    <span className={`text-neutral-200 ${isOverdue ? 'text-red-400' : ''}`}>
                      {formatSaleDate(p.saleTimeline)}
                      {isOverdue && ' (Overdue)'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div>
                    Days Until Sale:{" "}
                    <span className={`text-neutral-200 ${isOverdue ? 'text-red-400' : daysUntil < 30 ? 'text-yellow-400' : ''}`}>
                      {isOverdue ? `${Math.abs(daysUntil)} past` : `${daysUntil} days`}
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
