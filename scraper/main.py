from __future__ import annotations

import asyncio
import os
import re
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Any

import structlog
from supabase import Client

from scrapers.apartments_com import ApartmentsComScraper
from scrapers.base import ScrapedUnit
from scrapers.maa_scraper import MAAScraper
from scrapers.normalizer import normalize_units, summarize_by_source
from utils.feature_parser import parse_feature_flags
from utils.supabase_client import get_supabase_client

logger = structlog.get_logger(__name__)


@dataclass(slots=True)
class PersistStats:
    new_units: int = 0
    price_changes: int = 0



def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-") or "unknown"


def build_composite_key(unit: ScrapedUnit) -> str:
    baths = str(unit.baths).replace(".", "_")
    sq_ft = unit.sq_ft or 0
    return f"{slugify(unit.floor_plan_name)}_{unit.beds}_{baths}_{sq_ft}_{slugify(unit.unit_number)}"


def get_or_create_floor_plan(supabase: Client, unit: ScrapedUnit) -> int | None:
    query = (
        supabase.table("floor_plans")
        .select("id")
        .eq("name", unit.floor_plan_name)
        .eq("beds", unit.beds)
        .eq("baths", unit.baths)
        .limit(1)
        .execute()
    )

    if query.data:
        return int(query.data[0]["id"])

    insert = (
        supabase.table("floor_plans")
        .insert(
            {
                "name": unit.floor_plan_name,
                "beds": unit.beds,
                "baths": unit.baths,
                "sq_ft_min": unit.sq_ft,
                "sq_ft_max": unit.sq_ft,
            }
        )
        .execute()
    )

    if insert.data:
        return int(insert.data[0]["id"])

    return None


def ensure_price_history(
    supabase: Client,
    apartment_id: int,
    price: float | None,
    move_in_special: str | None,
    source: str,
) -> bool:
    if price is None:
        return False

    latest = (
        supabase.table("price_history")
        .select("price")
        .eq("apartment_id", apartment_id)
        .order("recorded_at", desc=True)
        .limit(1)
        .execute()
    )

    previous_price = None
    if latest.data:
        previous_price = float(latest.data[0]["price"])

    if previous_price == price:
        return False

    supabase.table("price_history").insert(
        {
            "apartment_id": apartment_id,
            "price": price,
            "move_in_special": move_in_special,
            "source": source,
            "recorded_at": datetime.now(UTC).isoformat(),
        }
    ).execute()

    return previous_price is not None and previous_price != price


def persist_unit(supabase: Client, unit: ScrapedUnit) -> tuple[bool, bool]:
    now_iso = datetime.now(UTC).isoformat()
    floor_plan_id = get_or_create_floor_plan(supabase, unit)

    composite_key = build_composite_key(unit)
    feature_flags = parse_feature_flags(unit.feature_tags)

    payload: dict[str, Any] = {
        "unit_number": unit.unit_number,
        "floor_plan_id": floor_plan_id,
        "composite_key": composite_key,
        "beds": unit.beds,
        "baths": unit.baths,
        "sq_ft": unit.sq_ft,
        "current_price": unit.price,
        "available_date": unit.available_date,
        "move_in_special": unit.move_in_special,
        "feature_tags": unit.feature_tags,
        "source": unit.source,
        "source_url": unit.source_url,
        "is_available": True,
        "last_seen_at": now_iso,
        "updated_at": now_iso,
        **feature_flags,
    }

    existing = (
        supabase.table("apartments")
        .select("id,current_price")
        .eq("composite_key", composite_key)
        .limit(1)
        .execute()
    )

    is_new_unit = False
    apartment_id: int

    if existing.data:
        apartment_id = int(existing.data[0]["id"])
        supabase.table("apartments").update(payload).eq("id", apartment_id).execute()
    else:
        is_new_unit = True
        payload["first_seen_at"] = now_iso
        insert = supabase.table("apartments").insert(payload).execute()
        if not insert.data:
            return False, False
        apartment_id = int(insert.data[0]["id"])

    price_changed = ensure_price_history(
        supabase=supabase,
        apartment_id=apartment_id,
        price=unit.price,
        move_in_special=unit.move_in_special,
        source=unit.source,
    )

    return is_new_unit, price_changed


def mark_stale_units(supabase: Client, seen_composite_keys: set[str]) -> None:
    rows = supabase.table("apartments").select("id,composite_key").eq("is_available", True).execute()

    for row in rows.data or []:
        if row["composite_key"] in seen_composite_keys:
            continue
        supabase.table("apartments").update({"is_available": False}).eq("id", row["id"]).execute()


async def run_scrape() -> tuple[dict[str, int], str]:
    started_at = datetime.now(UTC)

    scrapers = [MAAScraper(), ApartmentsComScraper()]
    all_units: list[ScrapedUnit] = []
    source_errors: list[str] = []
    successful_sources = 0

    for scraper in scrapers:
        try:
            units = await scraper.scrape()
            logger.info("source_scrape_complete", source=scraper.source_name, units=len(units))
            all_units.extend(units)
            successful_sources += 1
        except Exception as exc:  # noqa: BLE001
            if "blocked" in str(exc).lower() or "closed" in str(exc).lower():
                # The scraper likely had a page object before it failed
                # but in this architecture, the context manager closed it.
                # We will add diagnostic capture inside the scrapers themselves next.
                pass
            message = f"{scraper.source_name}: {exc}"
            source_errors.append(message)
            logger.exception("source_scrape_failed", source=scraper.source_name, error=str(exc))

    normalized = normalize_units(all_units)
    summary = summarize_by_source(normalized)

    status = "success"
    if source_errors and successful_sources > 0:
        status = "partial"
    elif source_errors and successful_sources == 0:
        status = "failed"

    logger.info(
        "scrape_complete",
        started_at=started_at.isoformat(),
        completed_at=datetime.now(UTC).isoformat(),
        units=len(normalized),
        summary=summary,
        status=status,
        source_errors=source_errors,
    )

    supabase = get_supabase_client()
    stats = PersistStats()

    if supabase:
        seen_keys = set()
        for unit in normalized:
            seen_keys.add(build_composite_key(unit))
            try:
                is_new, price_changed = persist_unit(supabase, unit)
                if is_new:
                    stats.new_units += 1
                if price_changed:
                    stats.price_changes += 1
            except Exception as exc:  # noqa: BLE001
                logger.exception("persist_unit_failed", unit=unit.unit_number, error=str(exc))

        if status != "failed" and seen_keys:
            mark_stale_units(supabase, seen_keys)

        supabase.table("scrape_logs").insert(
            {
                "started_at": started_at.isoformat(),
                "completed_at": datetime.now(UTC).isoformat(),
                "source": "all",
                "status": status,
                "units_found": len(normalized),
                "new_units": stats.new_units,
                "price_changes": stats.price_changes,
                "error_message": " | ".join(source_errors) if source_errors else None,
                "duration_seconds": (datetime.now(UTC) - started_at).total_seconds(),
            }
        ).execute()

    return summary, status


if __name__ == "__main__":
    summary, status = asyncio.run(run_scrape())
    if status == "failed":
        raise SystemExit(1)
