"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { IPSellingEngine, type IPSaleOpportunity } from "@/lib/optr/ipSelling";
import { defaultDashboardData } from "@/lib/hvpeDashboardData";

export function IPSellingPanel() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    opportunities: IPSaleOpportunity[];
    totalValue: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreateIPOpportunities = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/optr/ip-sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Failed to create opportunities: ${response.statusText}`);
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const portfolio = defaultDashboardData.billionaires.people;
  const sellableIP = portfolio.filter(p => p.ipCreated && p.ipValue > 0);
  const totalIPValue = sellableIP.reduce((sum, p) => sum + p.ipValue, 0);

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs uppercase tracking-[0.16em] text-neutral-500">
            IP Selling Engine
          </div>
          <div className="mt-1 text-sm font-semibold text-neutral-100">
            Monetize Created IP Through OPTR
          </div>
        </div>
        <button
          onClick={handleCreateIPOpportunities}
          disabled={isLoading || sellableIP.length === 0}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-600 text-white text-sm font-medium rounded-lg transition"
        >
          {isLoading ? 'Creating...' : 'Create Sale Opportunities'}
        </button>
      </div>

      <div className="space-y-3">
        {/* Portfolio Summary */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-neutral-400">Sellable IP Items</div>
            <div className="text-lg font-semibold text-neutral-100">{sellableIP.length}</div>
          </div>
          <div className="text-center">
            <div className="text-neutral-400">Total IP Value</div>
            <div className="text-lg font-semibold text-emerald-400">
              ${totalIPValue.toLocaleString()}
            </div>
          </div>
          <div className="text-center">
            <div className="text-neutral-400">Avg Sale Timeline</div>
            <div className="text-lg font-semibold text-blue-400">
              {sellableIP.length > 0
                ? Math.round(
                    sellableIP.reduce((sum, p) => {
                      const days = Math.ceil((new Date(p.saleTimeline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                      return sum + Math.max(0, days);
                    }, 0) / sellableIP.length
                  )
                : 0} days
            </div>
          </div>
        </div>

        {/* IP Items List */}
        <div className="space-y-2">
          <div className="text-xs text-neutral-500 uppercase tracking-wide">IP Portfolio</div>
          {sellableIP.map((person) => {
            const daysUntilSale = Math.ceil((new Date(person.saleTimeline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            const ipType = 'patent'; // Simplified - can be enhanced later

            return (
              <div key={person.name} className="flex items-center justify-between p-3 bg-neutral-900/50 rounded-lg">
                <div>
                  <div className="font-medium text-neutral-100">{person.name}</div>
                  <div className="text-xs text-neutral-400">
                    {ipType.charAt(0).toUpperCase() + ipType.slice(1)} • ${person.ipValue.toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-neutral-200">
                    {daysUntilSale > 0 ? `${daysUntilSale} days` : 'Overdue'}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {new Date(person.saleTimeline).toLocaleDateString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Results */}
        {error && (
          <div className="p-3 bg-red-900/20 border border-red-500/50 rounded-lg">
            <div className="text-sm text-red-400">Error: {error}</div>
          </div>
        )}

        {results && (
          <div className="p-3 bg-emerald-900/20 border border-emerald-500/50 rounded-lg">
            <div className="text-sm text-emerald-400 mb-2">
              ✅ Created {results.opportunities.length} IP sale opportunities
            </div>
            <div className="text-xs text-neutral-400">
              Total portfolio value: ${results.totalValue.toLocaleString()}
            </div>
            <div className="mt-2 space-y-1">
              {results.opportunities.slice(0, 3).map((opp) => (
                <div key={opp.id} className="text-xs text-neutral-500">
                  • {opp.title} (${opp.ipValue.toLocaleString()})
                </div>
              ))}
              {results.opportunities.length > 3 && (
                <div className="text-xs text-neutral-500">
                  • ... and {results.opportunities.length - 3} more
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}