"""
Unit tests for the year-aware default autoplan UOC caps.

Pure tests - no server or database required.
"""

from server.routers.utility.planner_terms import build_autoplan_uoc_max


def test_three_term_year_summer_enabled():
    assert build_autoplan_uoc_max(2026, (2026, 3), is_summer_enabled=True) == [12, 20, 20, 20]


def test_three_term_year_summer_disabled():
    assert build_autoplan_uoc_max(2026, (2026, 3), is_summer_enabled=False) == [0, 20, 20, 20]


def test_two_term_year_ends_at_last_real_term():
    assert build_autoplan_uoc_max(2028, (2028, 2), is_summer_enabled=True) == [12, 20, 20]


def test_two_term_year_zeroes_nonexistent_t3_slot():
    assert build_autoplan_uoc_max(2028, (2028, 3), is_summer_enabled=True) == [12, 20, 20, 0]


def test_span_crossing_2028_boundary():
    assert build_autoplan_uoc_max(2027, (2029, 2), is_summer_enabled=True) == [
        12, 20, 20, 20,  # 2027: summer + 3 terms
        12, 20, 20, 0,   # 2028: summer + 2 terms, T3 slot capped at 0
        12, 20, 20,      # 2029: up to the end term T2
    ]
