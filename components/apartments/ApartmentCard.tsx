"use client";

import { Apartment, ImageAsset } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useSaved } from "@/hooks/useSaved";
import { Heart } from "lucide-react";
import Link from "next/link";

interface ApartmentCardProps {
  apartment: Apartment;
  image?: ImageAsset;
}

export function ApartmentCard({ apartment, image }: ApartmentCardProps) {
  const { isSaved, toggle } = useSaved();
  const saved = isSaved(apartment.id);

  return (
    <article className="group overflow-hidden rounded-2xl border border-white/10 bg-[#031529]/80 shadow-lg shadow-cyan-950/20 transition hover:-translate-y-0.5 hover:border-cyan-300/60">
      <div className="relative aspect-[16/10] overflow-hidden">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.public_url}
            alt={image.alt_text ?? apartment.unit_number}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-600/30 to-blue-900/40 text-cyan-100">
            No photo yet
          </div>
        )}

        <button
          type="button"
          onClick={() => toggle(apartment.id)}
          className="absolute right-3 top-3 rounded-full border border-white/30 bg-[#021024]/70 p-2 text-white backdrop-blur"
          aria-label={saved ? "Unsave apartment" : "Save apartment"}
        >
          <Heart className={`size-4 ${saved ? "fill-rose-400 text-rose-300" : ""}`} />
        </button>
      </div>

      <div className="space-y-3 p-4">
        <div>
          <p className="text-2xl font-semibold text-white">{formatCurrency(apartment.current_price)}/mo</p>
          <p className="text-sm text-cyan-100/80">Unit {apartment.unit_number}</p>
        </div>

        <p className="text-sm text-cyan-100/90">
          {apartment.beds} bed • {apartment.baths} bath • {apartment.sq_ft.toLocaleString()} sq ft
        </p>

        <div className="flex flex-wrap gap-2">
          {apartment.feature_tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-2 py-0.5 text-xs text-cyan-100"
            >
              {tag}
            </span>
          ))}
        </div>

        <Link
          href={`/apartment/${apartment.id}`}
          className="inline-flex rounded-lg bg-cyan-300 px-3 py-1.5 text-sm font-medium text-slate-900 transition hover:bg-cyan-200"
        >
          View details
        </Link>
      </div>
    </article>
  );
}
