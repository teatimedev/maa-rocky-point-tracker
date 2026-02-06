"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SavedState {
  savedIds: number[];
  toggle: (id: number) => void;
  isSaved: (id: number) => boolean;
}

export const useSavedStore = create<SavedState>()(
  persist(
    (set, get) => ({
      savedIds: [],
      toggle: (id) =>
        set((state) => {
          const exists = state.savedIds.includes(id);
          return {
            savedIds: exists
              ? state.savedIds.filter((savedId) => savedId !== id)
              : [...state.savedIds, id],
          };
        }),
      isSaved: (id) => get().savedIds.includes(id),
    }),
    {
      name: "maa-tracker-saved",
    }
  )
);
