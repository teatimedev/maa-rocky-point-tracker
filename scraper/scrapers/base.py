from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol


@dataclass(slots=True)
class ScrapedUnit:
    unit_number: str
    floor_plan_name: str
    beds: int
    baths: float
    sq_ft: int | None
    price: float | None
    available_date: str | None
    move_in_special: str | None
    feature_tags: list[str]
    source: str
    source_url: str


class SourceScraper(Protocol):
    source_name: str

    async def scrape(self) -> list[ScrapedUnit]:
        ...
