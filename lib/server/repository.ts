import { apartments, floorPlans, images, priceHistory, scrapeLogs } from "@/lib/mock-data";
import { applyApartmentFilters } from "@/lib/server/query-filters";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Apartment, ApartmentFilters, ImageAsset, PriceHistoryPoint, SavedApartment } from "@/lib/types";

const savedInMemory = new Map<number, SavedApartment>();

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return 0;
}

function normalizeApartment(row: Record<string, unknown>): Apartment {
  return {
    id: toNumber(row.id),
    unit_number: String(row.unit_number ?? ""),
    floor_plan_id: toNumber(row.floor_plan_id),
    composite_key: String(row.composite_key ?? ""),
    beds: toNumber(row.beds),
    baths: toNumber(row.baths),
    sq_ft: toNumber(row.sq_ft),
    floor: row.floor ? toNumber(row.floor) : undefined,
    current_price: toNumber(row.current_price),
    price_min: row.price_min ? toNumber(row.price_min) : undefined,
    price_max: row.price_max ? toNumber(row.price_max) : undefined,
    is_available: Boolean(row.is_available),
    available_date: row.available_date ? String(row.available_date) : undefined,
    move_in_special: row.move_in_special ? String(row.move_in_special) : undefined,
    lease_terms: row.lease_terms ? String(row.lease_terms) : undefined,
    has_garage: Boolean(row.has_garage),
    has_fireplace: Boolean(row.has_fireplace),
    has_smart_home: Boolean(row.has_smart_home),
    is_renovated: Boolean(row.is_renovated),
    is_top_floor: Boolean(row.is_top_floor),
    is_end_unit: Boolean(row.is_end_unit),
    has_sunroom: Boolean(row.has_sunroom),
    has_balcony: Boolean(row.has_balcony),
    has_washer_dryer: Boolean(row.has_washer_dryer),
    view_type: row.view_type ? String(row.view_type) as Apartment["view_type"] : undefined,
    feature_tags: Array.isArray(row.feature_tags) ? (row.feature_tags as string[]) : [],
    description: row.description ? String(row.description) : undefined,
    source: (row.source ? String(row.source) : "maa") as Apartment["source"],
    source_url: row.source_url ? String(row.source_url) : undefined,
    first_seen_at: String(row.first_seen_at ?? new Date().toISOString()),
    last_seen_at: String(row.last_seen_at ?? new Date().toISOString()),
    last_price_change_at: row.last_price_change_at ? String(row.last_price_change_at) : undefined,
  };
}

function normalizeImage(row: Record<string, unknown>): ImageAsset {
  return {
    id: toNumber(row.id),
    apartment_id: row.apartment_id ? toNumber(row.apartment_id) : undefined,
    floor_plan_id: row.floor_plan_id ? toNumber(row.floor_plan_id) : undefined,
    image_type: (row.image_type ? String(row.image_type) : "unit_photo") as ImageAsset["image_type"],
    source_url: String(row.source_url ?? ""),
    public_url: String(row.public_url ?? ""),
    storage_path: row.storage_path ? String(row.storage_path) : undefined,
    sort_order: row.sort_order ? toNumber(row.sort_order) : 0,
    alt_text: row.alt_text ? String(row.alt_text) : undefined,
  };
}

function normalizePricePoint(row: Record<string, unknown>): PriceHistoryPoint {
  return {
    apartment_id: toNumber(row.apartment_id),
    date: String(row.recorded_at ?? "").slice(0, 10),
    price: toNumber(row.price),
    special: row.move_in_special ? String(row.move_in_special) : null,
  };
}

export async function listApartments(filters: ApartmentFilters) {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return applyApartmentFilters(apartments, filters);
  }

  let query = supabase.from("apartments").select("*");

  if (filters.beds?.length) query = query.in("beds", filters.beds);
  if (filters.baths_min !== undefined) query = query.gte("baths", filters.baths_min);
  if (filters.price_min !== undefined) query = query.gte("current_price", filters.price_min);
  if (filters.price_max !== undefined) query = query.lte("current_price", filters.price_max);
  if (filters.sqft_min !== undefined) query = query.gte("sq_ft", filters.sqft_min);
  if (filters.sqft_max !== undefined) query = query.lte("sq_ft", filters.sqft_max);

  const boolFilters: (keyof ApartmentFilters)[] = [
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

  for (const key of boolFilters) {
    if (filters[key] !== undefined) query = query.eq(key, filters[key]);
  }

  if (filters.view_type) query = query.eq("view_type", filters.view_type);

  const sortField =
    filters.sort_by === "price"
      ? "current_price"
      : filters.sort_by === "sqft"
        ? "sq_ft"
        : filters.sort_by === "beds"
          ? "beds"
          : filters.sort_by === "updated"
            ? "last_seen_at"
            : "current_price";

  query = query.order(sortField, { ascending: filters.sort_order !== "desc" });

  const { data, error } = await query;
  if (error || !data) {
    return applyApartmentFilters(apartments, filters);
  }

  return data.map((row) => normalizeApartment(row));
}

export async function getApartmentById(id: number) {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return apartments.find((apt) => apt.id === id) ?? null;
  }

  const { data, error } = await supabase.from("apartments").select("*").eq("id", id).single();

  if (error || !data) {
    return apartments.find((apt) => apt.id === id) ?? null;
  }

  return normalizeApartment(data);
}

export async function getApartmentImages(apartmentId: number) {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return images.filter((img) => img.apartment_id === apartmentId);
  }

  const { data, error } = await supabase
    .from("images")
    .select("*")
    .eq("apartment_id", apartmentId)
    .order("sort_order", { ascending: true });

  if (error || !data) {
    return images.filter((img) => img.apartment_id === apartmentId);
  }

  return data.map((row) => normalizeImage(row));
}

export async function getApartmentPriceHistory(apartmentId: number) {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return priceHistory.filter((point) => point.apartment_id === apartmentId);
  }

  const { data, error } = await supabase
    .from("price_history")
    .select("*")
    .eq("apartment_id", apartmentId)
    .order("recorded_at", { ascending: true });

  if (error || !data) {
    return priceHistory.filter((point) => point.apartment_id === apartmentId);
  }

  return data.map((row) => normalizePricePoint(row));
}

export async function listFloorPlans() {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return floorPlans;
  }

  const { data, error } = await supabase.from("floor_plans").select("*").order("beds");
  if (error || !data) return floorPlans;
  return data as typeof floorPlans;
}

export async function getFloorPlanById(id: number) {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return floorPlans.find((plan) => plan.id === id) ?? null;
  }

  const { data, error } = await supabase.from("floor_plans").select("*").eq("id", id).single();
  if (error || !data) return floorPlans.find((plan) => plan.id === id) ?? null;
  return data as (typeof floorPlans)[number];
}

export async function listScrapeLogs() {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return scrapeLogs;
  }

  const { data, error } = await supabase
    .from("scrape_logs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(50);

  if (error || !data) {
    return scrapeLogs;
  }

  return data as typeof scrapeLogs;
}

export async function listSavedApartments() {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return [...savedInMemory.values()];
  }

  const { data, error } = await supabase.from("saved_apartments").select("*").order("saved_at", {
    ascending: false,
  });

  if (error || !data) {
    return [...savedInMemory.values()];
  }

  return data as SavedApartment[];
}

export async function saveApartment(apartmentId: number, notes?: string) {
  const apartment = await getApartmentById(apartmentId);
  if (!apartment) return null;

  const entry: SavedApartment = {
    apartment_id: apartmentId,
    user_notes: notes,
    notify_on_price_change: true,
    price_when_saved: apartment.current_price,
    saved_at: new Date().toISOString(),
  };

  const supabase = getSupabaseServerClient();

  if (!supabase) {
    savedInMemory.set(apartmentId, entry);
    return entry;
  }

  const { data, error } = await supabase
    .from("saved_apartments")
    .upsert(entry, { onConflict: "apartment_id" })
    .select("*")
    .single();

  if (error || !data) {
    savedInMemory.set(apartmentId, entry);
    return entry;
  }

  return data as SavedApartment;
}

export async function deleteSavedApartment(apartmentId: number) {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return savedInMemory.delete(apartmentId);
  }

  const { error } = await supabase.from("saved_apartments").delete().eq("apartment_id", apartmentId);

  if (error) {
    return savedInMemory.delete(apartmentId);
  }

  return true;
}

export async function updateSavedApartment(
  apartmentId: number,
  patch: Partial<Pick<SavedApartment, "user_notes" | "notify_on_price_change">>
) {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    const existing = savedInMemory.get(apartmentId);
    if (!existing) return null;
    const updated = { ...existing, ...patch };
    savedInMemory.set(apartmentId, updated);
    return updated;
  }

  const { data, error } = await supabase
    .from("saved_apartments")
    .update(patch)
    .eq("apartment_id", apartmentId)
    .select("*")
    .single();

  if (error || !data) {
    const existing = savedInMemory.get(apartmentId);
    if (!existing) return null;
    const updated = { ...existing, ...patch };
    savedInMemory.set(apartmentId, updated);
    return updated;
  }

  return data as SavedApartment;
}

export async function getStats() {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    const available = apartments.filter((apt) => apt.is_available);
    const avg =
      available.length > 0
        ? available.reduce((sum, apt) => sum + apt.current_price, 0) / available.length
        : 0;

    return {
      available_count: available.length,
      total_count: apartments.length,
      avg_price: Math.round(avg),
      saved_count: savedInMemory.size,
    };
  }

  const [apartmentRows, savedRows] = await Promise.all([
    supabase.from("apartments").select("id,current_price,is_available"),
    supabase.from("saved_apartments").select("id", { count: "exact", head: true }),
  ]);

  const fallback = {
    available_count: apartments.filter((apt) => apt.is_available).length,
    total_count: apartments.length,
    avg_price: Math.round(apartments.reduce((sum, apt) => sum + apt.current_price, 0) / apartments.length),
    saved_count: savedInMemory.size,
  };

  if (apartmentRows.error || !apartmentRows.data) return fallback;

  const available = apartmentRows.data.filter((row) => row.is_available);
  const avg =
    available.length > 0
      ? available.reduce((sum, row) => sum + toNumber(row.current_price), 0) / available.length
      : 0;

  return {
    available_count: available.length,
    total_count: apartmentRows.data.length,
    avg_price: Math.round(avg),
    saved_count: savedRows.count ?? 0,
  };
}

function getPriceTrendsFromMock() {
  const byBeds = new Map<number, { date: string; avg_price: number; available_count: number }[]>();

  [1, 2, 3].forEach((beds) => byBeds.set(beds, []));

  for (const beds of [1, 2, 3]) {
    const matching = apartments.filter((apt) => apt.beds === beds);
    if (!matching.length) continue;

    byBeds.set(beds, [
      {
        date: new Date().toISOString().slice(0, 10),
        avg_price: Math.round(matching.reduce((sum, apt) => sum + apt.current_price, 0) / matching.length),
        available_count: matching.filter((apt) => apt.is_available).length,
      },
    ]);
  }

  return {
    date_range: {
      start: "2026-01-01",
      end: new Date().toISOString().slice(0, 10),
    },
    trends_by_beds: Object.fromEntries(
      [...byBeds.entries()].map(([beds, points]) => [String(beds), points])
    ),
  };
}

export async function getPriceTrends() {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return getPriceTrendsFromMock();
  }

  const { data, error } = await supabase.from("apartments").select("beds,current_price,is_available");

  if (error || !data) {
    return getPriceTrendsFromMock();
  }

  const result: Record<string, { date: string; avg_price: number; available_count: number }[]> = {
    "1": [],
    "2": [],
    "3": [],
  };

  for (const beds of [1, 2, 3]) {
    const matching = data.filter((row) => toNumber(row.beds) === beds);
    if (!matching.length) continue;

    result[String(beds)] = [
      {
        date: new Date().toISOString().slice(0, 10),
        avg_price: Math.round(
          matching.reduce((sum, row) => sum + toNumber(row.current_price), 0) / matching.length
        ),
        available_count: matching.filter((row) => row.is_available).length,
      },
    ];
  }

  return {
    date_range: {
      start: "2026-01-01",
      end: new Date().toISOString().slice(0, 10),
    },
    trends_by_beds: result,
  };
}
