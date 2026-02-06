"use client";

import { ApartmentFilters } from "@/lib/types";
import { create } from "zustand";

interface FilterState {
  filters: ApartmentFilters;
  setFilter: <K extends keyof ApartmentFilters>(key: K, value: ApartmentFilters[K]) => void;
  reset: () => void;
}

const initialFilters: ApartmentFilters = {
  is_available: true,
  sort_by: "price",
  sort_order: "asc",
};

export const useFilterStore = create<FilterState>((set) => ({
  filters: initialFilters,
  setFilter: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
      },
    })),
  reset: () => set({ filters: initialFilters }),
}));
