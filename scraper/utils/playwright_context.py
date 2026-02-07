from __future__ import annotations

import os
import random
import re
from dataclasses import dataclass

from playwright.async_api import Browser, BrowserContext, Page, async_playwright
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
        # Parse http(s)://user:pass@host:port
        match = re.match(r"^(https?://)(?:(.+?):(.+?)@)?(.+)$", proxy_url.strip())
        if match:
            scheme, username, password, host = match.groups()
            server = f"{scheme}{host}"
            return ProxyConfig(server=server, username=username, password=password)
        return ProxyConfig(server=proxy_url)

    server = os.getenv("PROXY_SERVER") or os.getenv("SCRAPER_PROXY_SERVER")
    if not server:
        return None

    return ProxyConfig(
        server=server,
        username=os.getenv("PROXY_USERNAME") or os.getenv("SCRAPER_PROXY_USERNAME"),
        password=os.getenv("PROXY_PASSWORD") or os.getenv("SCRAPER_PROXY_PASSWORD"),
    )


async def launch_browser() -> tuple[Browser, BrowserContext, Page]:
    """Launch Chromium with stealth + random UA + optional proxy."""

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

        return browser, context, page


async def close_browser(browser: Browser) -> None:
    await browser.close()
