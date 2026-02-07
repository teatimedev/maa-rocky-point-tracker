from __future__ import annotations

import re
from typing import Iterable

from playwright.async_api import Locator

from scrapers.base import ScrapedUnit
from utils.parsing import normalize_sq_ft, parse_price
from utils.playwright_context import browser_page


def _extract_first(patterns: Iterable[str], text: str) -> str | None:
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1).strip()
    return None


def _parse_beds(text: str) -> int:
    value = _extract_first([r"(\d+)\s*(?:bed|br)", r"(\d+)x\d"], text)
    return int(value) if value else 0


def _parse_baths(text: str) -> float:
    value = _extract_first([r"(\d(?:\.\d)?)\s*(?:bath|ba)", r"\d+x(\d(?:\.\d)?)"], text)
    return float(value) if value else 0.0


def _parse_unit_number(text: str, fallback: str) -> str:
    unit = _extract_first(
        [r"unit\s*([a-z0-9\-]+)", r"home\s*#?\s*([a-z0-9\-]+)", r"apt\.?\s*([a-z0-9\-]+)"],
        text,
    )
    return unit.upper() if unit else fallback


def _parse_floor_plan(text: str) -> str:
    floor_plan = _extract_first(
        [
            r"((?:traditional|townhome|floor\s*plan)[^\n\r|]*)",
            r"([0-9]x[0-9](?:\.[0-9])?[^\n\r|]*)",
        ],
        text,
    )
    return floor_plan or "Unknown Floor Plan"


def _parse_feature_tags(text: str) -> list[str]:
    known = [
        "Top Floor",
        "Wood Burning Fireplace",
        "Attached Garage",
        "Detached Garage",
        "Renovation Renewal Prog",
        "Kitchen and Bath Upgrade",
        "Smart Home Technology",
        "Sunroom",
        "Balcony",
        "Courtyard View",
        "Garden View",
        "Bay View",
        "Roommate Plan",
    ]

    lowered = text.lower()
    found = [tag for tag in known if tag.lower() in lowered]
    return found


async def _find_cards(page) -> Locator:
    candidate_selectors = [
        "[data-testid='unit-card']",
        "[data-testid='available-unit-card']",
        ".unit-card",
        ".fp-unit-card",
        "[class*='unit'][class*='card']",
        "[class*='available'][class*='card']",
    ]

    for selector in candidate_selectors:
        cards = page.locator(selector)
        if await cards.count() > 0:
            return cards

    return page.locator("article")


class MAAScraper:
    source_name = "maa"
    source_url = "https://www.maac.com/florida/tampa/maa-rocky-point/"

    async def scrape(self) -> list[ScrapedUnit]:
        units: list[ScrapedUnit] = []

        async with browser_page() as (_context, page):
            await page.goto(self.source_url, wait_until="domcontentloaded")
            await page.wait_for_timeout(4000)

            title = (await page.title()).lower()
            html = (await page.content()).lower()
            if "cloudflare" in title or "you have been blocked" in html:
                from utils.playwright_context import upload_block_snapshot
                from utils.supabase_client import get_supabase_client
                sb = get_supabase_client()
                if sb:
                    await upload_block_snapshot(sb, self.source_name, page)
                raise RuntimeError("maa_blocked_by_cloudflare")

            cards = await _find_cards(page)
            count = await cards.count()

            for i in range(count):
                card = cards.nth(i)
                card_text = (await card.inner_text()).strip()
                if not card_text:
                    continue

                unit_number = _parse_unit_number(card_text, fallback=f"MAA-{i+1:03d}")
                floor_plan_name = _parse_floor_plan(card_text)
                price = parse_price(card_text)
                sq_ft = normalize_sq_ft(card_text)
                beds = _parse_beds(card_text)
                baths = _parse_baths(card_text)
                available_date = _extract_first(
                    [r"available\s*(?:on|now)?\s*([a-z0-9\-/ ,]+)", r"move\s*in\s*([a-z0-9\-/ ,]+)"],
                    card_text,
                )

                if beds == 0 and baths == 0.0 and price is None:
                    continue

                units.append(
                    ScrapedUnit(
                        unit_number=unit_number,
                        floor_plan_name=floor_plan_name,
                        beds=beds,
                        baths=baths,
                        sq_ft=sq_ft,
                        price=price,
                        available_date=available_date,
                        move_in_special=_extract_first(
                            [r"(\d+\s*weeks?\s*free)", r"(look-and-lease[^\n\r]*)"],
                            card_text,
                        ),
                        feature_tags=_parse_feature_tags(card_text),
                        source=self.source_name,
                        source_url=self.source_url,
                    )
                )

        return units
