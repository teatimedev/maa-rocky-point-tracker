from __future__ import annotations

import asyncio
from pathlib import Path

from playwright.async_api import async_playwright

SOURCES = {
    "maa_rocky_point_page": "https://www.maac.com/florida/tampa/maa-rocky-point/",
    "apartments_com_page": "https://www.apartments.com/maa-rocky-point-tampa-fl/7wemg5w/",
    "rentcafe_page": "https://www.rentcafe.com/apartments/fl/tampa/maa-rocky-point/default.aspx",
}


async def capture() -> None:
    fixtures_dir = Path(__file__).resolve().parents[1] / "tests" / "fixtures"
    fixtures_dir.mkdir(parents=True, exist_ok=True)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()

        for name, url in SOURCES.items():
            page = await context.new_page()
            await page.goto(url, wait_until="domcontentloaded", timeout=120_000)
            await page.wait_for_timeout(5000)

            html = await page.content()
            (fixtures_dir / f"{name}.html").write_text(html, encoding="utf-8")
            await page.screenshot(path=str(fixtures_dir / f"{name}.png"), full_page=True)
            await page.close()
            print(f"Captured fixture: {name}")

        await browser.close()


if __name__ == "__main__":
    asyncio.run(capture())
