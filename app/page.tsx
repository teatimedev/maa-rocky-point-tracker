"use client";

import { ApartmentGrid } from "@/components/apartments/ApartmentGrid";
import { FilterSidebar } from "@/components/filters/FilterSidebar";
import { useApartments } from "@/hooks/useApartments";
import { useFilterStore } from "@/store/filterStore";
import { Loader2 } from "lucide-react";

export default function Home() {
  const filters = useFilterStore((state) => state.filters);
  const { data, isLoading, error } = useApartments(filters);

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <FilterSidebar />

      <section className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-[#04162d]/70 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/70">Live Snapshot</p>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <h2 className="text-2xl font-semibold text-white">
              {data?.total ?? "--"} available apartments
            </h2>
            <span className="text-sm text-cyan-100/70">Refreshed every 5 min</span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#04162d]/70 p-6 text-cyan-100/80">
            <Loader2 className="size-4 animate-spin" />
            Loading apartment data...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-300/40 bg-rose-950/30 p-4 text-rose-100">
            Could not load apartment data.
          </div>
        ) : data && data.apartments.length ? (
          <ApartmentGrid apartments={data.apartments} images={data.images} />
        ) : (
          <div className="rounded-2xl border border-white/10 bg-[#04162d]/70 p-8 text-cyan-100/80">
            No apartments match your current filters.
          </div>
        )}
      </section>
    </div>
  );
}
