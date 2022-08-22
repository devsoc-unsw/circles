"""
Tests for the `termsOffered/{course}/{year}` routes.

Tests for data can be run against specific examples from legacy years.
Be careful with anything from the LIVE_YEAR as that may change.
"""

import requests





def test_term_offered_comp1511_2021():
    res = requests.get("https://127.0.0.1:8000/courses/termsOffered/COMP1511/2021")

    assert res.status_code == 200
    data = res.json()

    assert data.get("fails", {}) == {}
    assert set(data.get("terms", {}).get("2021", [])) == { "T1", "T2", "T3" }


#TODO: Get a test out for multiple years, im not conviced of the `+` joined thingy
