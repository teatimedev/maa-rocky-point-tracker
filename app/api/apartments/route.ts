import { getApartmentImages, listApartments } from "@/lib/server/repository";
import { ApartmentFilters } from "@/lib/types";
import { parseBoolean, parseNumber } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const filters: ApartmentFilters = {
    beds: params.get("beds")?.split(",").map(Number).filter(Boolean),
    baths_min: parseNumber(params.get("baths_min")),
    price_min: parseNumber(params.get("price_min")),
    price_max: parseNumber(params.get("price_max")),
    sqft_min: parseNumber(params.get("sqft_min")),
    sqft_max: parseNumber(params.get("sqft_max")),
    is_available: parseBoolean(params.get("is_available")),
    has_garage: parseBoolean(params.get("has_garage")),
    has_fireplace: parseBoolean(params.get("has_fireplace")),
    is_renovated: parseBoolean(params.get("is_renovated")),
    is_top_floor: parseBoolean(params.get("is_top_floor")),
    has_sunroom: parseBoolean(params.get("has_sunroom")),
    has_balcony: parseBoolean(params.get("has_balcony")),
    has_smart_home: parseBoolean(params.get("has_smart_home")),
    has_washer_dryer: parseBoolean(params.get("has_washer_dryer")),
    view_type: params.get("view_type") ?? undefined,
    sort_by: (params.get("sort_by") as ApartmentFilters["sort_by"]) ?? "price",
    sort_order: (params.get("sort_order") as ApartmentFilters["sort_order"]) ?? "asc",
  };

  const apartments = await listApartments(filters);

  const images = (
    await Promise.all(
      apartments.map(async (apt) => {
        const apartmentImages = await getApartmentImages(apt.id);
        return apartmentImages[0] ?? null;
      })
    )
  ).filter(Boolean);

  return NextResponse.json({
    apartments,
    images,
    total: apartments.length,
    last_scrape: new Date().toISOString(),
  });
}
