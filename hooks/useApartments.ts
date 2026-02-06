"use client";

import { Apartment, ApartmentFilters, ImageAsset } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

function toQueryString(filters: ApartmentFilters) {
  const params = new URLSearchParams();

  if (filters.beds?.length) params.set("beds", filters.beds.join(","));

  for (const [key, value] of Object.entries(filters)) {
    if (key === "beds") continue;
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }

  return params.toString();
}

export function useApartments(filters: ApartmentFilters) {
  return useQuery<{
    apartments: Apartment[];
    images: ImageAsset[];
    total: number;
    last_scrape: string | null;
  }>(
    {
      queryKey: ["apartments", filters],
      queryFn: async () => {
        const query = toQueryString(filters);
        const response = await fetch(`/api/apartments${query ? `?${query}` : ""}`);
        if (!response.ok) throw new Error("Failed to load apartments");
        return response.json();
      },
      staleTime: 1000 * 60 * 5,
    }
  );
}
