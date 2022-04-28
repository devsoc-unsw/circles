import json
import requests
import copy

with open("algorithms/exampleUsers.json") as f:
    USERS = json.load(f)


USER_NO_UOC = copy.deepcopy(USERS["user6"])
for course in USER_NO_UOC["courses"]:
    [uoc, mark] = USER_NO_UOC["courses"][course]
    USER_NO_UOC["courses"][course] = [mark]

def test_no_dependencies():
    x = requests.post("http://127.0.0.1:8000/courses/unselectCourse/COMP1531", json=USERS["user6"])
    assert x.status_code == 200
    assert x.json()["affected_courses"] == ["COMP1531", "COMP9242"]


def test_multiple_dependencies():
    x = requests.post("http://127.0.0.1:8000/courses/unselectCourse/COMP1511", json=USERS["user6"])
    assert x.status_code == 200
    assert x.json()["affected_courses"] == ["COMP1511", "COMP1521", "COMP1531", "COMP2521", "COMP3231", "COMP9242"]

def test_invalid_course():
    x = requests.post('http://127.0.0.1:8000/courses/unselectCourse/BADC0000', json=USERS["user6"])
    assert x.status_code == 200

