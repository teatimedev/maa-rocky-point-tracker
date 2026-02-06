from __future__ import annotations

import re


def parse_price(value: str | None) -> float | None:
    if not value:
        return None

    matches = re.findall(r"\$?([0-9,]+(?:\.[0-9]{1,2})?)", value)
    if not matches:
        return None

    return float(matches[0].replace(",", ""))


def normalize_sq_ft(value: str | None) -> int | None:
    if not value:
        return None

    match = re.search(r"([0-9]{3,4})", value.replace(",", ""))
    if not match:
        return None

    return int(match.group(1))
