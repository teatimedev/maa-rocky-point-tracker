"use client";

import { ApartmentGrid } from "@/components/apartments/ApartmentGrid";
import { useApartments } from "@/hooks/useApartments";
import { useSaved } from "@/hooks/useSaved";

export default function SavedPage() {
  const { savedIds } = useSaved();
  const { data, isLoading } = useApartments({ is_available: false });

  const savedApartments = data?.apartments.filter((apt) => savedIds.includes(apt.id)) ?? [];

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Saved apartments</h2>
      {isLoading ? (
        <p className="text-cyan-100/70">Loading saved apartments...</p>
      ) : savedApartments.length ? (
        <ApartmentGrid apartments={savedApartments} images={data?.images ?? []} />
      ) : (
        <div className="rounded-2xl border border-white/10 bg-[#04162d]/70 p-6 text-cyan-100/80">
          Nothing saved yet. Tap the heart icon on any apartment card.
        </div>
      )}
    </section>
  );
}
