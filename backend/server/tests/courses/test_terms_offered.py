"""
Tests for the `termsOffered/{course}/{year}` routes.

Tests for data can be run against specific examples from legacy years.
Be careful with anything from the LIVE_YEAR as that may change.
"""

import requests

from data.config import LIVE_YEAR


def test_term_offered_comp1511_2021():
    res = requests.get("http://127.0.0.1:8000/courses/termsOffered/COMP1511/2021")

    assert res.status_code == 200
    data = res.json()

    assert data.get("fails", {}) == {}
    assert set(data.get("terms", {}).get("2021", [])) == { "T1", "T2", "T3" }


#TODO: Get a test out for multiple years, im not conviced of the `+` joined thingy
def test_term_offered_comp1511_all_terms():
    res = requests.get("http://127.0.0.1:8000/courses/termsOffered/COMP1511/2020+2021")

    assert res.status_code == 200
    data = res.json()
    expected = { "T1", "T2", "T3" }

    assert set(data.get("terms", {}).get("2020", [])) == expected
    assert set(data.get("terms", {}).get("2021", [])) == expected

def test_term_offered_comp1511_bad_years():
    res = requests.get(f"http://127.0.0.1:8000/courses/termsOffered/COMP1511/{LIVE_YEAR + 1}+2001")

    assert res.status_code == 200
    data = res.json()

    fails = data.get("fails", [])
    assert len(fails) == 2
    check_year_in_fails("2022", fails)
    check_year_in_fails("2001", fails)

def test_term_offered_fake_course():
    res = requests.get("http://127.0.0.1:8000/courses/termsOffered/CODEXXXX/2020+2021")

    assert res.status_code == 200
    data = res.json()

    fails = data.get("fails", [])
    assert len(fails) == 2
    assert "2001" in fails
    assert "2021" in fails

def check_year_in_fails(year, fails):
    return any(
        fails,
        lambda fail: year in fail
    )

