# pylint: disable=missing-function-docstring
# pylint: disable=missing-module-docstring
import json
import requests
from server.tests.user.utility import clear

PATH = "server/example_input/example_local_storage_data.json"

with open(PATH, encoding="utf8") as f:
    DATA = json.load(f)


def test_validateTermPlanner_empty_planner():
    clear()
    requests.post('http://127.0.0.1:8000/user/saveLocalStorage', json=DATA["empty_year"])

    x = requests.get(
        'http://127.0.0.1:8000/planner/validateTermPlanner')
    assert x.status_code == 200
    assert x.json()['courses_state'] == {}


def test_validateTermPlanner_valid_progress():
    clear()
    requests.post('http://127.0.0.1:8000/user/saveLocalStorage', json=DATA["simple_year"])
    x = requests.get(
        'http://127.0.0.1:8000/planner/validateTermPlanner')
    assert x.status_code == 200
    assert x.json()['courses_state'] == {
        "COMP1511": {
            "is_accurate": True,
            "handbook_note": "",
            "unlocked": True,
            "warnings": [],
            "suppressed": False
        },
        "MATH1141": {
            "is_accurate": True,
            "handbook_note": "",
            "unlocked": True,
            "warnings": [],
            "suppressed": False,
        },
        "MATH1081": {
            "is_accurate": True,
            "handbook_note": "",
            "unlocked": True,
            "warnings": [],
            "suppressed": False
        },
        "COMP1521": {
            "is_accurate": True,
            "handbook_note": "",
            "unlocked": True,
            "warnings": [],
            "suppressed": False
        },
        "COMP1531": {
            "is_accurate": True,
            "handbook_note": "",
            "unlocked": True,
            "warnings": [],
            "suppressed": False
        },
        "COMP2521": {
            "is_accurate": True,
            "handbook_note": "",
            "unlocked": True,
            "warnings": [],
            "suppressed": False
        },
        "ENGG2600": {
            'handbook_note': 'Please refer to the course overview section for further information on requirements',
            'is_accurate': True,
            'suppressed': False,
            'unlocked': False,
            'warnings': ['((((DESN1000) OR you need to do a program of type COMP OR you need to do a program of type FOOD OR you need to do a program of type MEDC) AND 42 UOC required in all courses you have 38 UOC))']
        }
    }


def test_validateTermPlanner_invalid_progress():
    clear()
    requests.post('http://127.0.0.1:8000/user/saveLocalStorage', json=DATA["no_uoc"])

    x = requests.get(
        'http://127.0.0.1:8000/planner/validateTermPlanner')
    assert x.status_code == 200
    assert x.json()['courses_state'] == {
        "COMP1511": {
            "is_accurate": True,
            "unlocked": True,
            "handbook_note": "",
            "warnings": [],
            "suppressed": False
        },
        "MATH1141": {
            "is_accurate": True,
            "unlocked": True,
            "handbook_note": "",
            "warnings": [],
            "suppressed": False
        },
        "MATH1081": {
            "is_accurate": True,
            "unlocked": True,
            "handbook_note": "",
            "warnings": [],
            "suppressed": False
        },
        "COMP1521": {
            "is_accurate": True,
            "unlocked": True,
            "handbook_note": "",
            "warnings": [],
            "suppressed": False
        },
        "COMP2511": {
            "is_accurate": True,
            "unlocked": False,
            "handbook_note": "",
            "warnings": ['((COMP1531 AND (COMP2521 OR COMP1927)))'],
            "suppressed": False
        },
        "COMP4128": {
            "is_accurate": True,
            "unlocked": False,
            "handbook_note": "",
            "warnings": [
                '((COMP3821 OR (COMP3121 AND Requires 75 WAM in all courses.  Your WAM in all courses has not been recorded)))'
            ],
            "suppressed": False
        }
    }


def test_validateTermPlanner_out_of_order_progress():
    # if the courses here were shuffled, it would be correct. Show error still
    clear()
    requests.post('http://127.0.0.1:8000/user/saveLocalStorage', json=DATA["out_of_order"])
    x = requests.get(
        'http://127.0.0.1:8000/planner/validateTermPlanner')
    assert x.status_code == 200
    assert x.json()['courses_state'] == {
        "MATH1241": {
            "is_accurate": True,
            "unlocked": False,
            "handbook_note": "",
            "warnings": ['((Need 65 in MATH1131 for this course OR Need 65 in MATH1141 for this course OR Need 65 in DPST1013 for this course))'],
            "suppressed": False
        },
        "MATH1141": {
            "is_accurate": True,
            "unlocked": True,
            "handbook_note": "",
            "warnings": [],
            "suppressed": False
        }
    }


def test_validateTermPlanner_past_term_suppress_warnings():
    clear()
    requests.post('http://127.0.0.1:8000/user/saveLocalStorage', json=DATA["suppress_warning"])
    x = requests.get(
        'http://127.0.0.1:8000/planner/validateTermPlanner')
    assert x.status_code == 200
    assert x.json()['courses_state'] == {
        "COMP1511": {
            "is_accurate": True,
            "unlocked": True,
            "handbook_note": "",
            "warnings": [],
            "suppressed": True
        },
        "MATH1141": {
            "is_accurate": True,
            "unlocked": True,
            "handbook_note": "",
            "warnings": [],
            "suppressed": True
        },
        "MATH1081": {
            "is_accurate": True,
            "unlocked": True,
            "handbook_note": "",
            "warnings": [],
            "suppressed": True
        },
        "COMP1521": {
            "is_accurate": True,
            "unlocked": True,
            "handbook_note": "",
            "warnings": [],
            "suppressed": True
        },
        "COMP2511": {
            "is_accurate": True,
            "unlocked": False,
            "handbook_note": "",
            "warnings": ['((COMP1531 AND (COMP2521 OR COMP1927)))'],
            "suppressed": True
        },
        "COMP4128": {
            "is_accurate": True,
            "unlocked": False,
            "handbook_note": "",
            "warnings": ['((COMP3821 OR (COMP3121 AND Requires 75 WAM in all courses.  Your WAM in all courses has not been recorded)))'],
            "suppressed": True
        }
    }
