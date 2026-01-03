'use client';

import { useState, useEffect } from 'react';
import { Wallet, TrendingUp, DollarSign, CheckCircle, Circle, RefreshCw } from 'lucide-react';

interface FinancialData {
  periods: Array<{
    date: string;
    income: { jenna: number; derek: number };
    expenses: Array<{ category: string; amount: number }>;
    delta: number;
  }>;
  assets: {
    savings: number;
    stock: number;
    total: number;
  };
  todos: Array<{
    text: string;
    completed: boolean;
    date?: string;
  }>;
}

export default function FinancialLifePage() {
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [autoSync, setAutoSync] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/finance/sync');
      const result = await response.json();

      if (result.data) {
        setData(result.data);
        setLastSync(new Date(result.lastSync));
      }
    } catch (error: unknown) {
      console.error('Failed to fetch financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    if (autoSync) {
      const interval = setInterval(fetchData, 30000); // Sync every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoSync]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalIncome =
    data?.periods.reduce((sum, p) => sum + p.income.jenna + p.income.derek, 0) || 0;
  const totalExpenses =
    data?.periods.reduce(
      (sum, p) => sum + p.expenses.reduce((expSum, e) => expSum + e.amount, 0),
      0
    ) || 0;
  const totalDelta = data?.periods.reduce((sum, p) => sum + p.delta, 0) || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading your financial life...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-white/20 bg-gradient-to-r from-blue-900/50 to-slate-900/50 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 via-cyan-400 to-teal-400 shadow-lg">
                <Wallet className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-cyan-200">
                  Our Life
                </h1>
                <p className="text-sm text-blue-300 font-medium">In Your Pocket</p>
              </div>
            </div>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all"
            >
              <RefreshCw className="h-4 w-4" />
              Sync Now
            </button>
          </div>
          {lastSync && (
            <div className="mt-2 text-xs text-white/60 text-center">
              Last synced: {lastSync.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Assets Overview */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="bg-gradient-to-br from-emerald-600/30 to-teal-600/30 backdrop-blur-md rounded-2xl border border-emerald-400/40 p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-white/80">Savings</h3>
              <DollarSign className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold text-white">
              {formatCurrency(data?.assets.savings || 0)}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600/30 to-purple-600/30 backdrop-blur-md rounded-2xl border border-blue-400/40 p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-white/80">Stock</h3>
              <TrendingUp className="h-5 w-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-white">
              {formatCurrency(data?.assets.stock || 0)}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600/30 to-pink-600/30 backdrop-blur-md rounded-2xl border border-purple-400/40 p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-white/80">Total Net Worth</h3>
              <Wallet className="h-5 w-5 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-white">
              {formatCurrency(data?.assets.total || 0)}
            </div>
          </div>
        </div>

        {/* Period Summary */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
            <div className="text-sm text-white/60 mb-1">Total Income</div>
            <div className="text-2xl font-bold text-green-400">{formatCurrency(totalIncome)}</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
            <div className="text-sm text-white/60 mb-1">Total Expenses</div>
            <div className="text-2xl font-bold text-red-400">{formatCurrency(totalExpenses)}</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
            <div className="text-sm text-white/60 mb-1">Net Delta</div>
            <div className="text-2xl font-bold text-blue-400">{formatCurrency(totalDelta)}</div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Budget Periods */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white mb-4">Budget Periods</h2>
            {data?.periods.map((period, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">{period.date}</h3>
                  <div className="text-sm font-medium text-emerald-400">
                    Δ {formatCurrency(period.delta)}
                  </div>
                </div>

                {/* Income */}
                <div className="mb-4">
                  <div className="text-xs font-medium text-white/60 uppercase tracking-wider mb-2">
                    Income
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-xs text-white/60">Jenna</div>
                      <div className="text-lg font-semibold text-green-400">
                        {formatCurrency(period.income.jenna)}
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-xs text-white/60">Derek</div>
                      <div className="text-lg font-semibold text-green-400">
                        {formatCurrency(period.income.derek)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expenses */}
                {period.expenses.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-white/60 uppercase tracking-wider mb-2">
                      Expenses
                    </div>
                    <div className="space-y-2">
                      {period.expenses.map((expense, expIdx) => (
                        <div
                          key={expIdx}
                          className="flex items-center justify-between bg-white/5 rounded-lg p-2"
                        >
                          <span className="text-sm text-white/80">{expense.category}</span>
                          <span className="text-sm font-medium text-red-400">
                            -{formatCurrency(expense.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Todos */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Action Items</h2>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
              {data?.todos && data.todos.length > 0 ? (
                <div className="space-y-3">
                  {data.todos.map((todo, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-white/5 rounded-lg p-3">
                      {todo.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="h-5 w-5 text-white/40 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div
                          className={`text-sm ${todo.completed ? 'text-white/50 line-through' : 'text-white'}`}
                        >
                          {todo.text}
                        </div>
                        {todo.date && <div className="text-xs text-white/40 mt-1">{todo.date}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-white/60 py-8">No action items at the moment</div>
              )}
            </div>

            {/* Financial Health */}
            <div className="mt-6 bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-md rounded-2xl border border-blue-400/30 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Financial Health</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-white/70">Savings Rate</span>
                  <span className="text-sm font-semibold text-white">
                    {totalIncome > 0 ? Math.round((totalDelta / totalIncome) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-white/70">Avg Monthly Burn</span>
                  <span className="text-sm font-semibold text-white">
                    {formatCurrency(totalExpenses / (data?.periods.length || 1))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-white/70">Runway</span>
                  <span className="text-sm font-semibold text-emerald-400">
                    {Math.round(
                      (data?.assets.total || 0) / (totalExpenses / (data?.periods.length || 1))
                    )}{' '}
                    months
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/20 bg-gradient-to-r from-blue-900/30 to-slate-900/30 backdrop-blur-md mt-12">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="text-center text-xs text-white/70 space-y-2">
            <div className="font-semibold text-white/80">© 2025 Bickford Technologies LLC</div>
            <div className="flex items-center justify-center gap-3 text-white/60">
              <span>Synced with Google Sheets</span>
              <span>•</span>
              <span>Real-time Updates</span>
              <span>•</span>
              <span>Secure & Private</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
