from __future__ import annotations

import re

from scrapers.base import ScrapedUnit
from utils.parsing import normalize_sq_ft, parse_price
from utils.playwright_context import close_browser, launch_browser


def _parse_beds_and_baths(text: str) -> tuple[int, float]:
    beds_match = re.search(r"(\d+)\s*(?:bed|br)", text, re.IGNORECASE)
    baths_match = re.search(r"(\d(?:\.\d)?)\s*(?:bath|ba)", text, re.IGNORECASE)
    beds = int(beds_match.group(1)) if beds_match else 0
    baths = float(baths_match.group(1)) if baths_match else 0.0
    return beds, baths


class ApartmentsComScraper:
    source_name = "apartments_com"
    source_url = "https://www.apartments.com/maa-rocky-point-tampa-fl/7wemg5w/"

    async def scrape(self) -> list[ScrapedUnit]:
        units: list[ScrapedUnit] = []

        browser = None
        try:
            browser, _context, page = await launch_browser()
            await page.goto(self.source_url, wait_until="domcontentloaded")
            await page.wait_for_timeout(3000)

            title = (await page.title()).lower()
            html = (await page.content()).lower()
            if "access denied" in title or "cloudflare" in title or "you have been blocked" in html:
                raise RuntimeError("apartments_com_blocked")

            cards = page.locator("article, [class*='pricing'], [class*='unitCard']")
            count = min(await cards.count(), 60)

            for i in range(count):
                text = (await cards.nth(i).inner_text()).strip()
                if not text:
                    continue

                price = parse_price(text)
                beds, baths = _parse_beds_and_baths(text)
                if beds == 0 and baths == 0.0 and price is None:
                    continue

                floor_plan = re.search(r"([0-9]x[0-9](?:\.[0-9])?)", text)

                units.append(
                    ScrapedUnit(
                        unit_number=f"APT-{i+1:03d}",
                        floor_plan_name=floor_plan.group(1) if floor_plan else "Unknown",
                        beds=beds,
                        baths=baths,
                        sq_ft=normalize_sq_ft(text),
                        price=price,
                        available_date=None,
                        move_in_special=None,
                        feature_tags=[],
                        source=self.source_name,
                        source_url=self.source_url,
                    )
                )

        finally:
            if browser is not None:
                await close_browser(browser)

        return units
