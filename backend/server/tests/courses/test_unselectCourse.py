import json
import requests
import copy

with open("algorithms/exampleUsers.json") as f:
    USERS = json.load(f)


USER_NO_UOC = copy.deepcopy(USERS["user6"])
for course in USER_NO_UOC["userData"]["courses"]:
    [uoc, mark] = USER_NO_UOC["userData"]["courses"][course]
    USER_NO_UOC["userData"]["courses"][course] = [mark]

def test_no_dependencies():
    x = requests.post("http://127.0.0.1:8000/courses/unselectCourse/COMP1531", json=USERS["user6"])
    assert x.status_code == 200
    assert x.json()["affected_courses"] == ["COMP1531"]

def test_locked_not_affected():
    # COMP9242 should be locked, and therefore not affected by 3231
    x = requests.post("http://127.0.0.1:8000/courses/unselectCourse/COMP3231", json=USERS["user6"])
    assert x.status_code == 200
    assert x.json()["affected_courses"] == ["COMP3231"]

def test_multiple_dependencies():
    x = requests.post("http://127.0.0.1:8000/courses/unselectCourse/COMP1511", json=USERS["user6"])
    assert x.status_code == 200
    assert x.json()["affected_courses"] == ["COMP1511", "COMP1521", "COMP1531", "COMP2521", "COMP3231"]

def test_require_query():
    # query is required for a valid request
    x = requests.post('http://127.0.0.1:8000/courses/unselectCourse', json=USERS["user6"])
    assert x.status_code == 422

def test_invalid_course():
    x = requests.post('http://127.0.0.1:8000/courses/unselectCourse/BADC0000', json=USERS["user6"])
    assert x.status_code == 200

def test_uoc_fixed():
    x = requests.post('http://127.0.0.1:8000/courses/unselectCourse/COMP1521', json=USER_NO_UOC)
    assert x.status_code == 200
    assert x.json()["affected_courses"] == ["COMP1521", "COMP3231"]
