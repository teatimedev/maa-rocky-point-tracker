"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function AdminPage() {
  const [importToken, setImportToken] = useState("");
  const [importPayload, setImportPayload] = useState(
    JSON.stringify(
      {
        units: [
          {
            unit_number: "A-123",
            floor_plan_name: "Example Plan",
            beds: 1,
            baths: 1,
            sq_ft: 750,
            price: 1999,
            available_date: null,
            move_in_special: null,
            feature_tags: ["balcony"],
            source: "manual",
            source_url: "",
          },
        ],
      },
      null,
      2
    )
  );
  const [importResult, setImportResult] = useState<string | null>(null);

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

  const submitImport = async () => {
    setImportResult(null);
    const response = await fetch("/api/import", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-import-token": importToken,
      },
      body: importPayload,
    });

    const text = await response.text();
    setImportResult(`${response.status} ${response.statusText}\n${text}`);
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
              {data.logs.map(
                (log: {
                  id: number;
                  source: string;
                  status: string;
                  units_found: number;
                  price_changes: number;
                }) => (
                  <tr key={log.id} className="border-t border-white/10">
                    <td className="px-4 py-3">{log.source}</td>
                    <td className="px-4 py-3 capitalize">{log.status}</td>
                    <td className="px-4 py-3">{log.units_found}</td>
                    <td className="px-4 py-3">{log.price_changes}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="space-y-3 rounded-2xl border border-white/10 bg-[#04162d]/70 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">$0 mode: manual import</h3>
          <button
            onClick={submitImport}
            className="rounded-lg bg-cyan-300 px-4 py-2 text-sm font-medium text-slate-900"
          >
            Import JSON
          </button>
        </div>

        <p className="text-sm text-cyan-100/70">
          Because Cloudflare blocks GitHub/AWS, the free workaround is: you grab
          data from your normal browser and paste it here.
        </p>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1">
            <div className="text-xs font-medium text-cyan-100/70">Import token</div>
            <input
              value={importToken}
              onChange={(e) => setImportToken(e.target.value)}
              placeholder="Set IMPORT_TOKEN in Vercel env vars"
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-cyan-50"
            />
          </label>
        </div>

        <label className="space-y-1">
          <div className="text-xs font-medium text-cyan-100/70">Payload</div>
          <textarea
            value={importPayload}
            onChange={(e) => setImportPayload(e.target.value)}
            rows={12}
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-xs text-cyan-50"
          />
        </label>

        {importResult ? (
          <pre className="whitespace-pre-wrap rounded-lg border border-white/10 bg-black/30 p-3 text-xs text-cyan-50">
            {importResult}
          </pre>
        ) : null}

        <details className="text-sm text-cyan-100/70">
          <summary className="cursor-pointer select-none">Quick console snippet</summary>
          <pre className="mt-2 whitespace-pre-wrap rounded-lg border border-white/10 bg-black/30 p-3 text-xs text-cyan-50">
{`// Paste into DevTools console on any page where you can SEE unit cards\n// Then copy the printed JSON into the payload box above.\n(() => {\n  const text = document.body.innerText;\n  console.log(JSON.stringify({ units: [{\n    unit_number: 'A-123',\n    floor_plan_name: 'Unknown',\n    beds: 1,\n    baths: 1,\n    sq_ft: null,\n    price: null,\n    available_date: null,\n    move_in_special: null,\n    feature_tags: [],\n    source: 'manual',\n    source_url: location.href,\n  }] }, null, 2));\n})();`}
          </pre>
        </details>
      </div>
    </section>
  );
}
