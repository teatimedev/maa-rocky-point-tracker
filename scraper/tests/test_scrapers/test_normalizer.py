from scrapers.base import ScrapedUnit
from scrapers.normalizer import normalize_units


def make_unit(source: str, unit: str, price: float | None):
    return ScrapedUnit(
        unit_number=unit,
        floor_plan_name="Traditional 2x2",
        beds=2,
        baths=2.0,
        sq_ft=1134,
        price=price,
        available_date=None,
        move_in_special=None,
        feature_tags=[],
        source=source,
        source_url="https://example.com",
    )


def test_normalizer_prefers_maa_source():
    units = [
        make_unit("apartments_com", "B-312", 1830),
        make_unit("maa", "B-312", 1820),
    ]

    normalized = normalize_units(units)
    assert len(normalized) == 1
    assert normalized[0].source == "maa"
    assert normalized[0].price == 1820
