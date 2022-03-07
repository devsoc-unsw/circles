import json
import requests

PATH = "algorithms/exampleUnselectCourse.json"

with open(PATH) as f:
    USER = json.load(f)

def test_require_query():
    # query is required for a valid request
    x = requests.post('http://127.0.0.1:8000/courses/unselectCourse', json=USER)
    assert x.status_code == 422

def test_no_dependencies():
    x = requests.post('http://127.0.0.1:8000/courses/unselectCourse?unselectedCourse=COMP1531', json=USER)
    assert x.status_code == 200
    assert x.json()["affected_courses"] == ["COMP1531"]

def test_locked_not_affected():
    # COMP9242 should be locked, and therefore not affected by 3231
    x = requests.post('http://127.0.0.1:8000/courses/unselectCourse?unselectedCourse=COMP3231', json=USER)
    assert x.status_code == 200
    assert x.json()["affected_courses"] == ["COMP3231"]

def test_one_dependency():
    x = requests.post('http://127.0.0.1:8000/courses/unselectCourse?unselectedCourse=COMP2521', json=USER)
    assert x.status_code == 200
    assert x.json()["affected_courses"] == ["COMP2521", "COMP3231"]

def test_multiple_dependencies():
    x = requests.post('http://127.0.0.1:8000/courses/unselectCourse?unselectedCourse=COMP1511', json=USER)
    assert x.status_code == 200
    assert x.json()["affected_courses"] == ["COMP1511", "COMP1521", "COMP1531", "COMP2521", "COMP3231"]

def test_invalid_course():
    x = requests.post('http://127.0.0.1:8000/courses/unselectCourse?unselectedCourse=BADC0000', json=USER)
    assert x.status_code == 200
