import { Apartment, ApartmentFilters } from "@/lib/types";

export function applyApartmentFilters(apartments: Apartment[], filters: ApartmentFilters) {
  let next = [...apartments];

  if (filters.beds?.length) {
    next = next.filter((apt) => filters.beds?.includes(apt.beds));
  }

  if (filters.baths_min !== undefined) {
    next = next.filter((apt) => apt.baths >= filters.baths_min!);
  }

  if (filters.price_min !== undefined) {
    next = next.filter((apt) => apt.current_price >= filters.price_min!);
  }

  if (filters.price_max !== undefined) {
    next = next.filter((apt) => apt.current_price <= filters.price_max!);
  }

  if (filters.sqft_min !== undefined) {
    next = next.filter((apt) => apt.sq_ft >= filters.sqft_min!);
  }

  if (filters.sqft_max !== undefined) {
    next = next.filter((apt) => apt.sq_ft <= filters.sqft_max!);
  }

  const booleanKeys: (keyof ApartmentFilters)[] = [
    "is_available",
    "has_garage",
    "has_fireplace",
    "is_renovated",
    "is_top_floor",
    "has_sunroom",
    "has_balcony",
    "has_smart_home",
    "has_washer_dryer",
  ];

  for (const key of booleanKeys) {
    if (filters[key] !== undefined) {
      next = next.filter((apt) => {
        const aptValue = apt[key as keyof Apartment] as boolean | undefined;
        return aptValue === filters[key];
      });
    }
  }

  if (filters.view_type) {
    next = next.filter((apt) => apt.view_type === filters.view_type);
  }

  const sortBy = filters.sort_by ?? "price";
  const sortOrder = filters.sort_order ?? "asc";

  const direction = sortOrder === "asc" ? 1 : -1;

  next.sort((a, b) => {
    switch (sortBy) {
      case "beds":
        return (a.beds - b.beds) * direction;
      case "sqft":
        return (a.sq_ft - b.sq_ft) * direction;
      case "updated":
        return (
          (new Date(a.last_seen_at).getTime() - new Date(b.last_seen_at).getTime()) * direction
        );
      case "price":
      default:
        return (a.current_price - b.current_price) * direction;
    }
  });

  return next;
}
