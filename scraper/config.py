from dataclasses import dataclass
from typing import Final

REQUEST_DELAY_SECONDS: Final[tuple[int, int]] = (2, 5)
STALE_THRESHOLD_HOURS: Final[int] = 18
MAX_RETRIES: Final[int] = 3

USER_AGENTS: Final[list[str]] = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14.7; rv:133.0) Gecko/20100101 Firefox/133.0",
]


@dataclass(slots=True)
class ScraperSource:
    name: str
    url: str
    enabled: bool = True


SOURCES: Final[list[ScraperSource]] = [
    ScraperSource(name="maa", url="https://www.maac.com/florida/tampa/maa-rocky-point/"),
    ScraperSource(
        name="apartments_com",
        url="https://www.apartments.com/maa-rocky-point-tampa-fl/7wemg5w/",
    ),
    ScraperSource(
        name="rentcafe",
        url="https://www.rentcafe.com/apartments/fl/tampa/maa-rocky-point/default.aspx",
        enabled=False,
    ),
]
