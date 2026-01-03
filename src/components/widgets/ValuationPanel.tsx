'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import type { ValuationResult } from '@/lib/valuation/ValuationEngine';

interface ExtendedValuationResult extends ValuationResult {
  scenarioLabel?: string;
}

export function ValuationPanel() {
  const [valuation, setValuation] = useState<ValuationResult | null>(null);
  const [sensitivity, setSensitivity] = useState<ExtendedValuationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runValuation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/valuation/run');
      if (!response.ok) {
        throw new Error(`Failed to run valuation: ${response.statusText}`);
      }

      const data = await response.json();
      setValuation(data.valuation);
      setSensitivity(data.sensitivityAnalysis || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runValuation();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs uppercase tracking-[0.16em] text-neutral-500">
            Company Valuation Engine
          </div>
          <div className="mt-1 text-sm font-semibold text-neutral-100">
            Bickford Technologies Valuation
          </div>
        </div>
        <button
          onClick={runValuation}
          disabled={isLoading}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-600 text-white text-sm font-medium rounded-lg transition"
        >
          {isLoading ? 'Calculating...' : 'Run Valuation'}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-900/20 border border-red-500/50 rounded-lg mb-4">
          <div className="text-sm text-red-400">Error: {error}</div>
        </div>
      )}

      {valuation && (
        <div className="space-y-4">
          {/* Main Valuation */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-neutral-900/50 rounded-lg">
              <div className="text-xs text-neutral-500 uppercase tracking-wide">
                Final Valuation
              </div>
              <div className="text-lg font-bold text-emerald-400 mt-1">
                {formatCurrency(valuation.finalValuation)}
              </div>
            </div>
            <div className="text-center p-3 bg-neutral-900/50 rounded-lg">
              <div className="text-xs text-neutral-500 uppercase tracking-wide">IP Portfolio</div>
              <div className="text-lg font-bold text-blue-400 mt-1">
                {formatCurrency(valuation.totalIPValue)}
              </div>
            </div>
            <div className="text-center p-3 bg-neutral-900/50 rounded-lg">
              <div className="text-xs text-neutral-500 uppercase tracking-wide">Confidence</div>
              <div className="text-lg font-bold text-yellow-400 mt-1">
                {formatPercent(valuation.confidence)}
              </div>
            </div>
            <div className="text-center p-3 bg-neutral-900/50 rounded-lg">
              <div className="text-xs text-neutral-500 uppercase tracking-wide">Risk Adjusted</div>
              <div className="text-lg font-bold text-purple-400 mt-1">
                {formatCurrency(valuation.riskAdjustedValue)}
              </div>
            </div>
          </div>

          {/* Valuation Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-neutral-900/30 rounded-lg">
              <div className="text-sm font-medium text-neutral-200 mb-3">Valuation Methods</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-400">DCF Valuation:</span>
                  <span className="text-neutral-200">
                    {formatCurrency(valuation.discountedCashFlow)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Market Multiples:</span>
                  <span className="text-neutral-200">
                    {formatCurrency(valuation.marketMultiples)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Risk Adjustment:</span>
                  <span className="text-red-400">
                    -{formatCurrency(valuation.breakdown.riskDiscount)}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-neutral-900/30 rounded-lg">
              <div className="text-sm font-medium text-neutral-200 mb-3">Value Breakdown</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-400">IP Value:</span>
                  <span className="text-blue-400">
                    {formatCurrency(valuation.breakdown.ipValue)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Growth Value:</span>
                  <span className="text-emerald-400">
                    +{formatCurrency(valuation.breakdown.growthValue)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Market Premium:</span>
                  <span className="text-yellow-400">
                    +{formatCurrency(valuation.breakdown.marketPremium)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Assumptions */}
          <div className="p-4 bg-neutral-900/30 rounded-lg">
            <div className="text-sm font-medium text-neutral-200 mb-3">Key Assumptions</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-neutral-400">
              {valuation.assumptions.map((assumption, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-neutral-600 mt-0.5">•</span>
                  <span>{assumption}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sensitivity Analysis */}
          {sensitivity.length > 0 && (
            <div className="p-4 bg-neutral-900/30 rounded-lg">
              <div className="text-sm font-medium text-neutral-200 mb-3">Sensitivity Analysis</div>
              <div className="space-y-2">
                {sensitivity.map((scenario, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-neutral-900/50 rounded"
                  >
                    <span className="text-sm text-neutral-300">{scenario.scenarioLabel}</span>
                    <span className="text-sm font-medium text-emerald-400">
                      {formatCurrency(scenario.finalValuation)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
