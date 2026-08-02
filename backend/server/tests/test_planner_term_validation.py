"""Unit tests for year-aware planner term validation.

These are pure unit tests and do not require the server to be running.
"""
import pytest
from fastapi import HTTPException

from server.routers.utility.planner_terms import (
    validate_locked_term_string,
    validate_multiterm_terms,
    validate_term_exists,
)


def test_trimester_year_accepts_all_standard_terms():
    for term in ['T1', 'T2', 'T3']:
        validate_term_exists(2027, term, is_summer_enabled=False)


def test_semester_year_rejects_t3():
    with pytest.raises(HTTPException) as exc:
        validate_term_exists(2028, 'T3', is_summer_enabled=True)
    assert exc.value.status_code == 400


def test_semester_year_accepts_t1_and_t2():
    for term in ['T1', 'T2']:
        validate_term_exists(2028, term, is_summer_enabled=False)


def test_summer_term_requires_summer_enabled():
    validate_term_exists(2027, 'T0', is_summer_enabled=True)
    with pytest.raises(HTTPException) as exc:
        validate_term_exists(2027, 'T0', is_summer_enabled=False)
    assert exc.value.status_code == 400


def test_nonsense_term_rejected():
    with pytest.raises(HTTPException):
        validate_term_exists(2027, 'T9', is_summer_enabled=True)


def test_locked_term_string_trimester_t3_allowed():
    validate_locked_term_string('2027T3')


def test_locked_term_string_semester_t3_rejected():
    with pytest.raises(HTTPException) as exc:
        validate_locked_term_string('2028T3')
    assert exc.value.status_code == 400


def test_locked_term_string_semester_t0_t1_t2_allowed():
    # locking the summer term is always allowed, regardless of the summer toggle
    for termyear in ['2028T0', '2028T1', '2028T2']:
        validate_locked_term_string(termyear)


def test_locked_term_string_malformed_rejected():
    for termyear in ['garbage', '2028', 'T3', '2028T', 'xxT3', '2028T-1']:
        with pytest.raises(HTTPException) as exc:
            validate_locked_term_string(termyear)
        assert exc.value.status_code == 400


def test_multiterm_terms_within_trimester_years_allowed():
    terms_list = [
        {'term': 'T3', 'row_offset': 0},
        {'term': 'T1', 'row_offset': 1},
    ]
    validate_multiterm_terms(2026, 0, terms_list, is_summer_enabled=False)


def test_multiterm_terms_spilling_into_semester_year_t3_rejected():
    # starting in 2027 (3 terms) and spilling into 2028's T3, which does not exist
    terms_list = [
        {'term': 'T2', 'row_offset': 0},
        {'term': 'T3', 'row_offset': 1},
    ]
    with pytest.raises(HTTPException) as exc:
        validate_multiterm_terms(2027, 0, terms_list, is_summer_enabled=False)
    assert exc.value.status_code == 400


def test_multiterm_terms_row_offset_uses_dest_row():
    # dest_row 2 of a 2026 planner is 2028: T3 there must be rejected
    terms_list = [{'term': 'T3', 'row_offset': 0}]
    with pytest.raises(HTTPException):
        validate_multiterm_terms(2026, 2, terms_list, is_summer_enabled=False)
