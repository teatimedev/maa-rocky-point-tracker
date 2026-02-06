from __future__ import annotations


def parse_feature_flags(tags: list[str]) -> dict[str, bool]:
    normalized = [tag.lower() for tag in tags]

    return {
        "has_garage": any("garage" in tag for tag in normalized),
        "has_fireplace": any("fireplace" in tag for tag in normalized),
        "is_renovated": any("renov" in tag or "upgrade" in tag for tag in normalized),
        "has_smart_home": any("smart" in tag for tag in normalized),
        "is_top_floor": any("top floor" in tag for tag in normalized),
        "has_sunroom": any("sunroom" in tag for tag in normalized),
        "has_balcony": any("balcony" in tag for tag in normalized),
    }
