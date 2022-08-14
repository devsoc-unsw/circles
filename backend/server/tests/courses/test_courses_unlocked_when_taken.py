# pylint: disable=missing-function-docstring
# pylint: disable=missing-module-docstring
import json
import requests

PATH = "./algorithms/tests/exampleUsers.json"

with open(PATH, encoding="utf8") as f:
    USERS = json.load(f)

def test_no_courses_completed():
    x = requests.post(
        'http://127.0.0.1:8000/courses/coursesUnlockedWhenTaken/COMP1511', json=USERS["user3"])
    assert x.json() == {
        "direct_unlock": [
            'COMP1521',
            'COMP1531',
            'COMP2041',
            'COMP2121',
            'COMP2521',
            'COMP9334'
        ],
        "indirect_unlock": []
    }


def test_malformed_request():
    x = requests.post(
        'http://127.0.0.1:8000/courses/coursesUnlockedWhenTaken/&&&&&', json=USERS["user3"])
    assert x.status_code == 400
    x = requests.post(
        'http://127.0.0.1:8000/courses/coursesUnlockedWhenTaken/COMPXXXX', json=USERS["user3"])
    assert x.status_code == 400


def test_two_courses_completed():
    x = requests.post(
        'http://127.0.0.1:8000/courses/coursesUnlockedWhenTaken/COMP2521', json=USERS["user1"])
    # TABL2710 is unlocked because USER1 now meets the 18UOC requirement
    assert x.json() == {
        "direct_unlock": [
            "COMP3121",
            "COMP3141",
            "COMP3151",
            "COMP3161",
            "COMP3231",
            "COMP3311",
            "COMP3331",
            "COMP3411",
            "COMP3431",
            "COMP3821",
            "COMP3891",
            "COMP6451",
            "COMP6714",
            "COMP6991",
            "COMP9319",
            "COMP9417",
            "COMP9444",
            "COMP9517",
            "COMP9727",
        ],
        "indirect_unlock": ["TABL2710"]
    }
