import { useEffect, useState } from 'react';

import { TradingEngineData, defaultTradingEngineData } from '@/lib/tradingEngineData';

export function useHvpeTrading() {
  const [data, setData] = useState<TradingEngineData>(defaultTradingEngineData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const res = await fetch('/api/hvpe-trading');
        if (!mounted) return;
        if (!res.ok) {
          throw new Error(`Trading request failed (${res.status} ${res.statusText})`);
        }
        const payload = (await res.json()) as TradingEngineData;
        setData(payload);
        setError(null);
      } catch (err: unknown) {
        console.error('Failed to load trading data', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Unable to load trading data');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 20_000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return { data, loading, error };
}
