"use client";

import { PriceHistoryChart } from "@/components/charts/PriceHistoryChart";
import { useQuery } from "@tanstack/react-query";

interface TrendPoint {
  date: string;
  avg_price: number;
}

export default function AnalyticsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["price-trends"],
    queryFn: async () => {
      const response = await fetch("/api/stats/price-trends");
      if (!response.ok) throw new Error("Failed to load trends");
      return response.json();
    },
  });

  const twoBeds: TrendPoint[] = data?.trends_by_beds?.["2"] ?? [];

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Analytics</h2>

      {isLoading ? (
        <p className="text-cyan-100/70">Crunching numbers...</p>
      ) : error ? (
        <p className="text-rose-200">Could not load trend data.</p>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-[#04162d]/70 p-5">
            <h3 className="mb-2 text-lg font-medium">2BR Average Price Trend</h3>
            <PriceHistoryChart
              data={twoBeds.map((point) => ({ date: point.date, price: point.avg_price }))}
            />
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#04162d]/70 p-5">
            <h3 className="mb-2 text-lg font-medium">Date Range</h3>
            <p className="text-cyan-100/80">
              {data.date_range.start} → {data.date_range.end}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
