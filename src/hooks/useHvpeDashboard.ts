import { useEffect, useState } from "react";
import {
  DashboardData,
  defaultDashboardData,
} from "@/lib/hvpeDashboardData";

export function useHvpeDashboard() {
  const [data, setData] = useState<DashboardData>(defaultDashboardData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const res = await fetch("/api/hvpe-dashboard");
        if (!mounted) return;
        if (!res.ok) {
          throw new Error(
            `Dashboard request failed (${res.status} ${res.statusText})`,
          );
        }
        const payload = (await res.json()) as DashboardData;
        setData(payload);
        setError(null);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
        if (mounted) {
          setError(
            err instanceof Error ? err.message : "Unable to load dashboard data",
          );
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
