"use client";

import { useFilterStore } from "@/store/filterStore";

export function FilterSidebar() {
  const { filters, setFilter, reset } = useFilterStore();

  const toggleBed = (value: number) => {
    const current = filters.beds ?? [];
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value].sort((a, b) => a - b);

    setFilter("beds", next.length ? next : undefined);
  };

  return (
    <aside className="space-y-5 rounded-2xl border border-white/10 bg-[#04162d]/70 p-5 text-sm text-cyan-100 shadow-xl shadow-cyan-950/20 backdrop-blur">
      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-cyan-300/80">Bedrooms</p>
        <div className="flex gap-2">
          {[1, 2, 3].map((bed) => (
            <button
              key={bed}
              onClick={() => toggleBed(bed)}
              className={`rounded-full border px-3 py-1 transition ${
                filters.beds?.includes(bed)
                  ? "border-cyan-300 bg-cyan-300 text-slate-900"
                  : "border-white/20 hover:border-cyan-300/70"
              }`}
            >
              {bed} BR
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-cyan-300/80">Max price</label>
        <input
          type="number"
          value={filters.price_max ?? ""}
          onChange={(e) => setFilter("price_max", e.target.value ? Number(e.target.value) : undefined)}
          placeholder="2500"
          className="w-full rounded-lg border border-white/20 bg-[#021024] px-3 py-2 outline-none ring-cyan-300 transition focus:ring"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-cyan-300/80">Min sq ft</label>
        <input
          type="number"
          value={filters.sqft_min ?? ""}
          onChange={(e) => setFilter("sqft_min", e.target.value ? Number(e.target.value) : undefined)}
          placeholder="900"
          className="w-full rounded-lg border border-white/20 bg-[#021024] px-3 py-2 outline-none ring-cyan-300 transition focus:ring"
        />
      </div>

      <div className="space-y-2">
        {[
          ["has_garage", "Garage"],
          ["has_fireplace", "Fireplace"],
          ["is_renovated", "Renovated"],
          ["is_top_floor", "Top floor"],
          ["has_sunroom", "Sunroom"],
        ].map(([key, label]) => {
          const typedKey = key as keyof typeof filters;
          return (
            <label key={key} className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={Boolean(filters[typedKey])}
                onChange={(e) => setFilter(typedKey, e.target.checked ? true : undefined)}
                className="size-4 rounded border-white/20 bg-transparent"
              />
              {label}
            </label>
          );
        })}
      </div>

      <button
        onClick={reset}
        className="w-full rounded-xl border border-white/20 py-2 text-center font-medium text-cyan-100 transition hover:border-cyan-300 hover:bg-cyan-300 hover:text-slate-900"
      >
        Clear all filters
      </button>
    </aside>
  );
}
