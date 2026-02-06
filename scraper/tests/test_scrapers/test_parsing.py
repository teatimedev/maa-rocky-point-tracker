from utils.parsing import normalize_sq_ft, parse_price


def test_parse_price_variants():
    assert parse_price("$1,820") == 1820
    assert parse_price("$1,820/mo") == 1820
    assert parse_price("From $1,820") == 1820
    assert parse_price("$1,820 - $3,530") == 1820
    assert parse_price("N/A") is None


def test_normalize_sq_ft_variants():
    assert normalize_sq_ft("1,134 sq ft") == 1134
    assert normalize_sq_ft("1134 SF") == 1134
    assert normalize_sq_ft("1134") == 1134
    assert normalize_sq_ft("unknown") is None
