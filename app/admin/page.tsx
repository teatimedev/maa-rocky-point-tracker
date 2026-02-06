"use client";

import { useQuery } from "@tanstack/react-query";

export default function AdminPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["scrape-logs"],
    queryFn: async () => {
      const response = await fetch("/api/scrape/logs");
      if (!response.ok) throw new Error("Failed to load logs");
      return response.json();
    },
  });

  const triggerScrape = async () => {
    await fetch("/api/scrape/trigger", { method: "POST" });
    await refetch();
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">Scrape status</h2>
        <button
          onClick={triggerScrape}
          className="rounded-lg bg-cyan-300 px-4 py-2 text-sm font-medium text-slate-900"
        >
          Trigger scrape
        </button>
      </div>

      {isLoading ? (
        <p className="text-cyan-100/70">Loading logs...</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#04162d]/70">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-cyan-100/70">
              <tr>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Units</th>
                <th className="px-4 py-3">Changes</th>
              </tr>
            </thead>
            <tbody>
              {data.logs.map((log: { id: number; source: string; status: string; units_found: number; price_changes: number }) => (
                <tr key={log.id} className="border-t border-white/10">
                  <td className="px-4 py-3">{log.source}</td>
                  <td className="px-4 py-3 capitalize">{log.status}</td>
                  <td className="px-4 py-3">{log.units_found}</td>
                  <td className="px-4 py-3">{log.price_changes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
