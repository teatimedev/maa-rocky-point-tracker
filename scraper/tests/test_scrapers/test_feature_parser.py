from utils.feature_parser import parse_feature_flags


def test_parse_feature_flags():
    flags = parse_feature_flags(
        [
            "Top Floor",
            "Wood Burning Fireplace",
            "Smart Home Technology",
            "Renovation Renewal Prog",
            "Sunroom",
        ]
    )

    assert flags["is_top_floor"] is True
    assert flags["has_fireplace"] is True
    assert flags["has_smart_home"] is True
    assert flags["is_renovated"] is True
    assert flags["has_sunroom"] is True
    assert flags["has_garage"] is False
