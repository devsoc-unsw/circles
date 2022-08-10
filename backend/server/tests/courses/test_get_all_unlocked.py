import json

import requests

PATH = "./algorithms/tests/exampleUsers.json"

with open(PATH, encoding="utf8") as f:
    USERS = json.load(f)


def test_fix_wam_only_unlock_given_course():
    x = requests.post(
        "http://127.0.0.1:8000/courses/getAllUnlocked", json=USERS["user5"]
    )    
    assert x.status_code != 500
    assert x.json()["courses_state"]["COMP1521"]["unlocked"] is True
    assert x.json()["courses_state"]["COMP1521"]["is_accurate"] is True


def test_unlock_dependant_course():
    x = requests.post(
        "http://127.0.0.1:8000/courses/getAllUnlocked", json=USERS["user2"]
    )
    assert x.status_code != 500
    assert x.json()["courses_state"]["MATH1231"]["unlocked"] is True
    assert x.json()["courses_state"]["MATH1231"]["is_accurate"] is True
