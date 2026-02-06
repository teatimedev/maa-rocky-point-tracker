"use client";

import { formatCurrency } from "@/lib/utils";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Point {
  date: string;
  price: number;
}

export function PriceHistoryChart({ data }: { data: Point[] }) {
  if (!data.length) {
    return <p className="text-sm text-cyan-100/70">No history yet.</p>;
  }

  return (
    <div className="h-72 w-full rounded-2xl border border-white/10 bg-[#031529]/70 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="date" stroke="#67e8f9" tick={{ fontSize: 12 }} />
          <YAxis
            stroke="#67e8f9"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `$${Number(value).toLocaleString()}`}
          />
          <Tooltip
            contentStyle={{
              background: "#021024",
              border: "1px solid rgba(103, 232, 249, 0.2)",
              borderRadius: "10px",
              color: "white",
            }}
            formatter={(value) => formatCurrency(Number(value))}
          />
          <Line type="monotone" dataKey="price" stroke="#67e8f9" strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
