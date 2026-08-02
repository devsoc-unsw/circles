"""
Unit tests for the year-aware multiterm placement algorithm
(server.routers.utility.planner_terms.get_multiterm_placements).

Placements walk chronologically through terms that exist in each calendar
year (3 standard terms before 2028, 2 from 2028 onwards), skipping terms
that do not exist in a given year.
"""

import pytest
from fastapi import HTTPException

from data import config
from server.routers.utility.planner_terms import get_multiterm_placements


def test_three_term_year_spills_within_year():
    assert get_multiterm_placements(2026, 'T1', 3, ['T1', 'T2', 'T3'], False, 0) == [
        {'term': 'T1', 'row_offset': 0},
        {'term': 'T2', 'row_offset': 0},
        {'term': 'T3', 'row_offset': 0},
    ]


def test_two_term_year_skips_t3_and_wraps_to_next_year():
    assert get_multiterm_placements(2028, 'T1', 3, ['T1', 'T2', 'T3'], False, 0) == [
        {'term': 'T1', 'row_offset': 0},
        {'term': 'T2', 'row_offset': 0},
        {'term': 'T1', 'row_offset': 1},
    ]


def test_forward_spill_across_2027_to_2028_boundary():
    assert get_multiterm_placements(2027, 'T3', 3, ['T1', 'T2', 'T3'], False, 0) == [
        {'term': 'T3', 'row_offset': 0},
        {'term': 'T1', 'row_offset': 1},
        {'term': 'T2', 'row_offset': 1},
    ]


def test_backward_walk_within_three_term_years():
    assert get_multiterm_placements(2027, 'T1', 3, ['T1', 'T2', 'T3'], False, 2) == [
        {'term': 'T2', 'row_offset': -1},
        {'term': 'T3', 'row_offset': -1},
        {'term': 'T1', 'row_offset': 0},
    ]


def test_backward_walk_into_two_term_year_skips_t3():
    assert get_multiterm_placements(2029, 'T1', 3, ['T1', 'T2', 'T3'], False, 1) == [
        {'term': 'T2', 'row_offset': -1},
        {'term': 'T1', 'row_offset': 0},
        {'term': 'T2', 'row_offset': 0},
    ]


def test_summer_term_included_when_enabled():
    assert get_multiterm_placements(2028, 'T2', 3, ['T0', 'T1', 'T2'], True, 0) == [
        {'term': 'T2', 'row_offset': 0},
        {'term': 'T0', 'row_offset': 1},
        {'term': 'T1', 'row_offset': 1},
    ]


def test_summer_term_excluded_when_disabled():
    assert get_multiterm_placements(2028, 'T2', 2, ['T0', 'T1', 'T2'], False, 0) == [
        {'term': 'T2', 'row_offset': 0},
        {'term': 'T1', 'row_offset': 1},
    ]


def test_current_term_not_offered_returns_empty():
    assert get_multiterm_placements(2026, 'T1', 3, ['T2', 'T3'], False, 0) == []


def test_current_term_nonexistent_in_year_returns_empty():
    assert get_multiterm_placements(2028, 'T3', 3, ['T1', 'T2', 'T3'], False, 0) == []


def test_impossible_forward_placement_raises_400():
    # A course offered only in T3 can never spill forward past 2027,
    # since T3 does not exist from 2028 onwards.
    with pytest.raises(HTTPException) as err:
        get_multiterm_placements(2027, 'T3', 2, ['T3'], False, 0)
    assert err.value.status_code == 400


def test_impossible_backward_placement_raises_400(monkeypatch):
    # Under the real config a backward walk always ends in pre-2028 3-term
    # years, so force a config where T3 only exists from 2030 onwards.
    monkeypatch.setattr(config, 'TERMS_PER_YEAR', {2019: 2, 2030: 3})
    with pytest.raises(HTTPException) as err:
        get_multiterm_placements(2030, 'T3', 2, ['T3'], False, 1)
    assert err.value.status_code == 400
