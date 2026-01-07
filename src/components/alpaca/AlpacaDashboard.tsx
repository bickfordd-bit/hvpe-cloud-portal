"use client";

import { useEffect, useState } from "react";

interface PortfolioData {
  equity: string;
  cash: string;
  buying_power: string;
  portfolio_value: string;
  positions: Array<{
    symbol: string;
    qty: string;
    current_price: string;
    market_value: string;
    unrealized_pl: string;
  }>;
}

export function AlpacaDashboard() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPortfolio() {
      try {
        const res = await fetch("/api/alpaca/portfolio");
        if (res.ok) {
          const portfolio = await res.json();
          setData(portfolio);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchPortfolio();
    const interval = setInterval(fetchPortfolio, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="text-neutral-400">Loading portfolio...</div>;
  }

  if (!data) {
    return (
      <div className="text-neutral-400">Connect Alpaca to view portfolio</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Account Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="border border-neutral-700 rounded-lg p-4">
          <div className="text-xs uppercase text-neutral-500 mb-1">Equity</div>
          <div className="text-2xl font-bold">
            ${parseFloat(data.equity).toFixed(2)}
          </div>
        </div>
        <div className="border border-neutral-700 rounded-lg p-4">
          <div className="text-xs uppercase text-neutral-500 mb-1">Cash</div>
          <div className="text-2xl font-bold">
            ${parseFloat(data.cash).toFixed(2)}
          </div>
        </div>
        <div className="border border-neutral-700 rounded-lg p-4">
          <div className="text-xs uppercase text-neutral-500 mb-1">
            Buying Power
          </div>
          <div className="text-2xl font-bold">
            ${parseFloat(data.buying_power).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Positions */}
      <div className="border border-neutral-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Positions</h3>
        {data.positions.length === 0 ? (
          <div className="text-neutral-400 text-sm">No positions</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-neutral-500 border-b border-neutral-700">
                <th className="pb-2">Symbol</th>
                <th className="pb-2">Qty</th>
                <th className="pb-2">Price</th>
                <th className="pb-2">Value</th>
                <th className="pb-2">P&L</th>
              </tr>
            </thead>
            <tbody>
              {data.positions.map((pos) => (
                <tr key={pos.symbol} className="border-b border-neutral-800">
                  <td className="py-3 font-semibold">{pos.symbol}</td>
                  <td className="py-3">{pos.qty}</td>
                  <td className="py-3">
                    ${parseFloat(pos.current_price).toFixed(2)}
                  </td>
                  <td className="py-3">
                    ${parseFloat(pos.market_value).toFixed(2)}
                  </td>
                  <td
                    className={`py-3 ${
                      parseFloat(pos.unrealized_pl) >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    ${parseFloat(pos.unrealized_pl).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
