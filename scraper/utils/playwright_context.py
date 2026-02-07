from __future__ import annotations

import os
import random
import re
from contextlib import asynccontextmanager
from dataclasses import dataclass
from urllib.parse import unquote, urlsplit

from playwright.async_api import BrowserContext, Page, async_playwright
from playwright_stealth import Stealth

from config import USER_AGENTS


@dataclass(slots=True)
class ProxyConfig:
    server: str
    username: str | None = None
    password: str | None = None


def _proxy_from_env() -> ProxyConfig | None:
    """Supported env vars:

    - PROXY_URL (e.g. http://user:pass@host:port)
    - PROXY_SERVER + PROXY_USERNAME + PROXY_PASSWORD

    Names also accept SCRAPER_PROXY_* aliases.
    """

    proxy_url = os.getenv("PROXY_URL") or os.getenv("SCRAPER_PROXY_URL")
    if proxy_url:
        # Supports e.g. http(s)/socks5://user:pass@host:port
        # Use urlsplit so percent-encoding in creds works.
        parsed = urlsplit(proxy_url.strip())
        if parsed.scheme and parsed.hostname:
            server = f"{parsed.scheme}://{parsed.hostname}"
            if parsed.port:
                server += f":{parsed.port}"
            username = unquote(parsed.username) if parsed.username else None
            password = unquote(parsed.password) if parsed.password else None
            return ProxyConfig(server=server, username=username, password=password)

        # Fallback: treat as Playwright proxy.server string
        return ProxyConfig(server=proxy_url.strip())

    server = os.getenv("PROXY_SERVER") or os.getenv("SCRAPER_PROXY_SERVER")
    if not server:
        return None

    return ProxyConfig(
        server=server,
        username=os.getenv("PROXY_USERNAME") or os.getenv("SCRAPER_PROXY_USERNAME"),
        password=os.getenv("PROXY_PASSWORD") or os.getenv("SCRAPER_PROXY_PASSWORD"),
    )


@asynccontextmanager
async def browser_page() -> tuple[BrowserContext, Page]:
    """Async context manager providing (context, page).

    Keeps Playwright alive for the lifetime of the context manager.
    """

    proxy = _proxy_from_env()
    user_agent = random.choice(USER_AGENTS)

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            proxy=(
                {
                    "server": proxy.server,
                    **({"username": proxy.username} if proxy and proxy.username else {}),
                    **({"password": proxy.password} if proxy and proxy.password else {}),
                }
                if proxy
                else None
            ),
        )

        context = await browser.new_context(
            user_agent=user_agent,
            locale="en-US",
            extra_http_headers={
                "Accept-Language": "en-US,en;q=0.9",
            },
        )

        page = await context.new_page()
        await Stealth().apply_stealth_async(page)

        try:
            yield context, page
        finally:
            await browser.close()


async def upload_block_snapshot(supabase, source_name: str, page: Page) -> str | None:
    """Take a snapshot of the blocked page and upload to Supabase for debugging."""
    try:
        from datetime import datetime

        now = datetime.now().strftime("%Y%m%d_%H%M%S")
        path = f"debug/block_{source_name}_{now}.png"
        screenshot = await page.screenshot(full_page=True)
        html = await page.content()

        # Upload image
        supabase.storage.from_("apt-images").upload(
            path,
            screenshot,
            {"content-type": "image/png", "upsert": True},
        )

        # Upload HTML as well
        supabase.storage.from_("apt-images").upload(
            path.replace(".png", ".html"),
            html.encode(),
            {"content-type": "text/html", "upsert": True},
        )

        return path
    except Exception:
        return None
