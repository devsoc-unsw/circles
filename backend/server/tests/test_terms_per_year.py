"""Unit tests for the terms-per-year configuration in data.config.

These are pure unit tests and do not require the server to be running.
"""
from data.config import LIVE_YEAR, TERMS_PER_YEAR, get_terms_list, get_terms_per_year


def test_three_terms_before_2028():
    for year in range(2019, 2028):
        assert get_terms_per_year(year) == 3


def test_two_terms_from_2028_onwards():
    for year in range(2028, 2040):
        assert get_terms_per_year(year) == 2


def test_years_before_first_configured_year_fall_back_to_earliest():
    assert get_terms_per_year(2015) == TERMS_PER_YEAR[min(TERMS_PER_YEAR)]


def test_terms_list_trimester_years():
    assert get_terms_list(2026) == ['T1', 'T2', 'T3']
    assert get_terms_list(2026, include_summer=True) == ['T0', 'T1', 'T2', 'T3']


def test_terms_list_semester_years():
    assert get_terms_list(2028) == ['T1', 'T2']
    assert get_terms_list(2028, include_summer=True) == ['T0', 'T1', 'T2']


def test_live_year_is_configured():
    assert get_terms_per_year(LIVE_YEAR) in (2, 3)
