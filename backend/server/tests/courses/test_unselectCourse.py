import json
import requests
import copy

with open("algorithms/exampleUnselectCourse.json") as f:
    USER = json.load(f)

USER_NO_UOC = copy.deepcopy(USER)
for course in USER_NO_UOC["userData"]["courses"]:
    [uoc, mark] = USER_NO_UOC["userData"]["courses"][course]
    USER_NO_UOC["userData"]["courses"][course] = [mark]


def test_require_query():
    # query is required for a valid request
    x = requests.post('http://127.0.0.1:8000/courses/unselectCourse', json=USER)
    assert x.status_code == 422

def test_invalid_course():
    x = requests.post('http://127.0.0.1:8000/courses/unselectCourse?unselectedCourse=BADC0000', json=USER)
    assert x.status_code == 200

def test_uoc_fixed():
    x = requests.post('http://127.0.0.1:8000/courses/unselectCourse?unselectedCourse=COMP1521', json=USER_NO_UOC)
    assert x.status_code == 200
    assert x.json()["affected_courses"] == ["COMP1521", "COMP3231"]
