from __future__ import annotations

from collections import defaultdict

from scrapers.base import ScrapedUnit

SOURCE_PRIORITY = {
    "maa": 0,
    "apartments_com": 1,
    "rentcafe": 2,
}


def _score(unit: ScrapedUnit) -> tuple[int, int, int]:
    return (
        SOURCE_PRIORITY.get(unit.source, 99),
        0 if unit.price is not None else 1,
        0 if unit.sq_ft is not None else 1,
    )


def normalize_units(units: list[ScrapedUnit]) -> list[ScrapedUnit]:
    """Deduplicate by floor plan + unit number and prefer higher-quality records."""

    index: dict[str, ScrapedUnit] = {}

    for unit in units:
        key = f"{unit.floor_plan_name.strip().lower()}::{unit.unit_number.strip().lower()}"
        existing = index.get(key)

        if existing is None or _score(unit) < _score(existing):
            index[key] = unit

    return list(index.values())


def summarize_by_source(units: list[ScrapedUnit]) -> dict[str, int]:
    counts: dict[str, int] = defaultdict(int)
    for unit in units:
        counts[unit.source] += 1
    return dict(counts)
