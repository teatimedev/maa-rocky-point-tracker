#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   SUPABASE_URL=... SUPABASE_SERVICE_KEY=... SUPABASE_DB_URL=... ./scripts/setup-supabase.sh
#
# Notes:
# - SUPABASE_URL + SUPABASE_SERVICE_KEY are used by the Supabase skill script for API checks.
# - SUPABASE_DB_URL is optional but recommended to apply schema via psql.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKILL_SCRIPT="/home/ubuntu/clawd/skills/supabase/scripts/supabase.sh"
SCHEMA_FILE="$ROOT_DIR/db/schema.sql"

if [[ -z "${SUPABASE_URL:-}" ]]; then
  echo "Error: SUPABASE_URL not set"
  exit 1
fi

if [[ -z "${SUPABASE_SERVICE_KEY:-}" ]]; then
  echo "Error: SUPABASE_SERVICE_KEY not set"
  exit 1
fi

echo "[1/4] Validating Supabase API access via skill script..."
bash "$SKILL_SCRIPT" tables >/dev/null

echo "[2/4] Skill access confirmed."

if [[ -n "${SUPABASE_DB_URL:-}" ]]; then
  echo "[3/4] Applying schema via psql..."
  psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f "$SCHEMA_FILE"
else
  echo "[3/4] SUPABASE_DB_URL not set; skipping schema apply."
  echo "      Run schema manually in Supabase SQL editor: $SCHEMA_FILE"
fi

echo "[4/4] Smoke test (apartments table)..."
bash "$SKILL_SCRIPT" select apartments --limit 1 || true

echo "Done. Supabase setup checks complete."
