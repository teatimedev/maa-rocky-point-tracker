# MAA Rocky Point Apartment Tracker

Apartment intelligence dashboard built with **Next.js + Supabase + GitHub Actions + Playwright**.

## Current status

Implemented end-to-end scaffold with working pages, API routes, scraper pipeline, and Supabase-ready persistence.

### ✅ Built already

- Next.js app routes:
  - `/` dashboard with filters + card grid
  - `/apartment/[id]` detail + price chart
  - `/saved` saved units view
  - `/analytics` trends page
  - `/admin` scrape logs + trigger button
- API routes:
  - `/api/apartments` (filters + image preview)
  - `/api/apartments/[id]`
  - `/api/apartments/[id]/price-history`
  - `/api/apartments/[id]/images`
  - `/api/floor-plans`, `/api/floor-plans/[id]`
  - `/api/saved`, `/api/saved/[apartment_id]`
  - `/api/stats`, `/api/stats/price-trends`
  - `/api/scrape/logs`, `/api/scrape/trigger`
- Repository layer supports:
  - Supabase-backed reads/writes when env vars are present
  - mock fallback when env vars are missing
- SQL schema in `db/schema.sql`
- GitHub Actions cron workflow in `.github/workflows/scrape.yml`
- Python scraper framework:
  - MAA + Apartments.com scrapers
  - normalization + deduplication
  - feature parsing
  - Supabase persistence (`floor_plans`, `apartments`, `price_history`, `scrape_logs`)
  - stale unit marking

## Project structure

- `app/` Next.js routes + API route handlers
- `components/` cards, filters, charts, layout
- `lib/server/repository.ts` central data layer
- `db/schema.sql` full database schema
- `scraper/` scheduled scraping engine

## Local setup

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Open <http://localhost:3000>

## Environment variables

Copy `.env.local.example` and fill values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GITHUB_REPO`
- `GITHUB_PAT`

## Supabase bootstrap

1. Create project in Supabase.
2. Run `db/schema.sql` in SQL Editor.
3. Create public storage bucket: `apt-images`.
4. Add env vars in Vercel + GitHub Actions Secrets.

## Scraper usage

### Run scraper locally

```bash
cd scraper
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
playwright install chromium
python main.py
```

### Capture rendered HTML fixtures

```bash
cd scraper
python scripts/capture_fixtures.py
```

Outputs:
- `scraper/tests/fixtures/maa_rocky_point_page.html`
- `scraper/tests/fixtures/apartments_com_page.html`
- screenshots alongside HTML files

## GitHub Actions schedule

Workflow: `.github/workflows/scrape.yml`

- Runs at `0 0,6,12,18 * * *` (every 6 hours UTC)
- Installs Playwright Chromium
- Runs `python scraper/main.py`

## Tests

Python parser/normalizer tests:

```bash
cd scraper
pytest tests/test_scrapers
```

## Anti-bot protection notes

The target sites (MAA, Apartments.com, RentCafe) use Cloudflare and similar anti-bot measures. The scraper detects blocks and logs them without hanging.

**Mitigation strategies for production:**
- Use residential proxies with Playwright (brightdata, oxylabs, etc.)
- Rotate user agents + use real browser fingerprints
- Add delays between page loads (already implemented)
- Consider API-first alternatives (Yardi, RentCafe API if available)
- Manual data entry fallback for critical markets

Current behavior: scraper logs "blocked" status and exits with error code for GitHub Actions retry logic.

## Next improvements queue

1. Tighten live selectors against freshly captured fixtures
2. Add image ingestion + Supabase storage uploads
3. Add frontend/API test suite (Vitest + RTL + route tests)
4. Add analytics aggregates from `price_history`
5. Add CSV export for saved apartments
