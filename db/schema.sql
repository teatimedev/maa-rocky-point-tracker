-- MAA Rocky Point Tracker schema

CREATE TABLE IF NOT EXISTS floor_plans (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  beds INTEGER NOT NULL,
  baths NUMERIC(3,1) NOT NULL,
  sq_ft_min INTEGER,
  sq_ft_max INTEGER,
  description TEXT,
  floor_plan_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS apartments (
  id SERIAL PRIMARY KEY,
  unit_number TEXT,
  floor_plan_id INTEGER REFERENCES floor_plans(id),
  composite_key TEXT UNIQUE NOT NULL,
  beds INTEGER NOT NULL,
  baths NUMERIC(3,1) NOT NULL,
  sq_ft INTEGER,
  floor INTEGER,
  current_price NUMERIC(10,2),
  price_min NUMERIC(10,2),
  price_max NUMERIC(10,2),
  is_available BOOLEAN DEFAULT TRUE,
  available_date TEXT,
  move_in_special TEXT,
  lease_terms TEXT,
  has_garage BOOLEAN DEFAULT FALSE,
  has_fireplace BOOLEAN DEFAULT FALSE,
  has_smart_home BOOLEAN DEFAULT FALSE,
  is_renovated BOOLEAN DEFAULT FALSE,
  is_top_floor BOOLEAN DEFAULT FALSE,
  is_end_unit BOOLEAN DEFAULT FALSE,
  has_sunroom BOOLEAN DEFAULT FALSE,
  has_balcony BOOLEAN DEFAULT FALSE,
  has_washer_dryer BOOLEAN DEFAULT FALSE,
  view_type TEXT,
  feature_tags JSONB DEFAULT '[]',
  description TEXT,
  source TEXT NOT NULL,
  source_url TEXT,
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_price_change_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS price_history (
  id SERIAL PRIMARY KEY,
  apartment_id INTEGER NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
  price NUMERIC(10,2) NOT NULL,
  move_in_special TEXT,
  source TEXT,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS images (
  id SERIAL PRIMARY KEY,
  apartment_id INTEGER REFERENCES apartments(id) ON DELETE CASCADE,
  floor_plan_id INTEGER REFERENCES floor_plans(id) ON DELETE CASCADE,
  image_type TEXT NOT NULL,
  source_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  alt_text TEXT,
  width INTEGER,
  height INTEGER,
  file_size_bytes INTEGER,
  sort_order INTEGER DEFAULT 0,
  content_hash TEXT,
  downloaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS saved_apartments (
  id SERIAL PRIMARY KEY,
  apartment_id INTEGER NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
  user_notes TEXT,
  notify_on_price_change BOOLEAN DEFAULT TRUE,
  price_when_saved NUMERIC(10,2),
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(apartment_id)
);

CREATE TABLE IF NOT EXISTS scrape_logs (
  id SERIAL PRIMARY KEY,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  source TEXT NOT NULL,
  status TEXT NOT NULL,
  units_found INTEGER DEFAULT 0,
  new_units INTEGER DEFAULT 0,
  price_changes INTEGER DEFAULT 0,
  units_removed INTEGER DEFAULT 0,
  error_message TEXT,
  duration_seconds NUMERIC(10,2),
  github_run_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_apartments_available ON apartments(is_available);
CREATE INDEX IF NOT EXISTS idx_apartments_price ON apartments(current_price);
CREATE INDEX IF NOT EXISTS idx_price_history_apartment ON price_history(apartment_id, recorded_at);
