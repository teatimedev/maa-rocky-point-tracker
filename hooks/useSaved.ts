"use client";

import { useSavedStore } from "@/store/savedStore";

export function useSaved() {
  const savedIds = useSavedStore((state) => state.savedIds);
  const toggle = useSavedStore((state) => state.toggle);
  const isSaved = useSavedStore((state) => state.isSaved);

  return { savedIds, toggle, isSaved };
}
