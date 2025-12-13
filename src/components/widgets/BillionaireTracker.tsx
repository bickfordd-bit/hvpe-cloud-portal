"use client";

import { Card } from "@/components/ui/Card";
import type {
  BillionairePerson,
} from "@/lib/hvpeDashboardData";

function formatSaleDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function getDaysUntilSale(dateString: string): number {
  const saleDate = new Date(dateString);
  const today = new Date();
  const diffTime = saleDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs uppercase tracking-[0.16em] text-neutral-500">
            IP Portfolio Sale Tracker
          </div>
          <div className="mt-1 text-[11px] text-neutral-400">
            Created IP awaiting sale through OPTR opportunities.
          </div>
        </div>
        <div className="text-[11px] text-neutral-500 text-right">
          {description}
        </div>
      </div>

      <div className="space-y-2 text-xs">
        {people.map((p) => {
          const daysUntil = getDaysUntilSale(p.saleTimeline);
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
