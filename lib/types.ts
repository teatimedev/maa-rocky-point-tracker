export type Source = "maa" | "apartments_com" | "rentcafe";

export interface FloorPlan {
  id: number;
  name: string;
  beds: number;
  baths: number;
  sq_ft_min?: number;
  sq_ft_max?: number;
  description?: string;
  floor_plan_image_url?: string;
}

export interface ImageAsset {
  id: number;
  apartment_id?: number;
  floor_plan_id?: number;
  image_type: "unit_photo" | "floor_plan" | "property" | "amenity";
  source_url: string;
  public_url: string;
  storage_path?: string;
  sort_order: number;
  alt_text?: string;
}

export interface Apartment {
  id: number;
  unit_number: string;
  floor_plan_id: number;
  composite_key: string;
  beds: number;
  baths: number;
  sq_ft: number;
  floor?: number;
  current_price: number;
  price_min?: number;
  price_max?: number;
  is_available: boolean;
  available_date?: string;
  move_in_special?: string;
  lease_terms?: string;
  has_garage: boolean;
  has_fireplace: boolean;
  has_smart_home: boolean;
  is_renovated: boolean;
  is_top_floor: boolean;
  is_end_unit: boolean;
  has_sunroom: boolean;
  has_balcony: boolean;
  has_washer_dryer: boolean;
  view_type?: "garden" | "courtyard" | "bay";
  feature_tags: string[];
  description?: string;
  source: Source;
  source_url?: string;
  first_seen_at: string;
  last_seen_at: string;
  last_price_change_at?: string;
}

export interface PriceHistoryPoint {
  apartment_id: number;
  date: string;
  price: number;
  special?: string | null;
}

export interface ScrapeLog {
  id: number;
  started_at: string;
  completed_at: string;
  source: Source;
  status: "success" | "partial" | "failed";
  units_found: number;
  new_units: number;
  price_changes: number;
  duration_seconds: number;
  error_message?: string;
}

export interface ApartmentFilters {
  beds?: number[];
  baths_min?: number;
  price_min?: number;
  price_max?: number;
  sqft_min?: number;
  sqft_max?: number;
  is_available?: boolean;
  has_garage?: boolean;
  has_fireplace?: boolean;
  is_renovated?: boolean;
  is_top_floor?: boolean;
  has_sunroom?: boolean;
  has_balcony?: boolean;
  has_smart_home?: boolean;
  has_washer_dryer?: boolean;
  view_type?: string;
  sort_by?: "price" | "sqft" | "beds" | "updated";
  sort_order?: "asc" | "desc";
}

export interface SavedApartment {
  apartment_id: number;
  user_notes?: string;
  notify_on_price_change: boolean;
  price_when_saved: number;
  saved_at: string;
}
