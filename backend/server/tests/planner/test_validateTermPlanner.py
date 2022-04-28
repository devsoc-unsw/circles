import json

import requests


PATH = "server/example_input/example_planner_data.json"

with open(PATH) as f:
    PLANS = json.load(f)


def test_validateTermPlanner_empty_planner():
    x = requests.post('http://127.0.0.1:8000/planner/validateTermPlanner', json=PLANS["empty_year"])
    assert x.status_code == 200
    assert x.json()['courses_state'] == {}


def test_validateTermPlanner_valid_progress():
    x = requests.post('http://127.0.0.1:8000/planner/validateTermPlanner', json=PLANS["simple_year"])
    assert x.status_code == 200
    assert x.json()['courses_state'] == {
        "COMP1511": {"is_accurate" : True, "handbook_note": "", "unlocked": True, "warnings": []},
        "MATH1141": {"is_accurate" : True, "handbook_note": "", "unlocked": True, "warnings": []},
        "MATH1081": {"is_accurate" : True, "handbook_note": "", "unlocked": True, "warnings": []},
        "COMP1521": {"is_accurate" : True, "handbook_note": "", "unlocked": True, "warnings": []},
        "COMP1531": {"is_accurate" : True, "handbook_note": "", "unlocked": True, "warnings": []},
        "COMP2521": {"is_accurate" : True, "handbook_note": "", "unlocked": True, "warnings": []},
    }

def test_validateTermPlanner_invalid_progress():
    # also tests if there is no uoc given
    x = requests.post('http://127.0.0.1:8000/planner/validateTermPlanner', json=PLANS["no_uoc"])
    assert x.status_code == 200
    assert x.json()['courses_state'] ==  {
        "COMP1511": {
            "is_accurate": True,
            "unlocked": True,
            "handbook_note": "",
            "warnings": []
        },
        "MATH1141": {
            "is_accurate": True,
            "unlocked": True,
            "handbook_note": "",
            "warnings": []
        },
        "MATH1081": {
            "is_accurate": True,
            "unlocked": True,
            "handbook_note": "",
            "warnings": []
        },
        "COMP1521": {
            "is_accurate": True,
            "unlocked": True,
            "handbook_note": "",
            "warnings": []
        },
        "COMP2511": {
            "is_accurate": True,
            "unlocked": False,
            "handbook_note": "",
            "warnings": []
        },
        "COMP4128": {
            "is_accurate": True,
            "unlocked": False,
            "handbook_note": "",
            "warnings": [
                "Requires 75 WAM in all courses. Your WAM in all courses has not been recorded"
            ]
        }
    }

def test_validateTermPlanner_out_of_order_progress():
    # if the courses here were shuffled, it would be correct. Show error still
    x = requests.post('http://127.0.0.1:8000/planner/validateTermPlanner', json=PLANS["out_of_order"])
    assert x.status_code == 200
    assert x.json()['courses_state'] ==  {
        "MATH1241": {
            "is_accurate": True,
            "unlocked": False,
            "handbook_note": "",
            "warnings": []
        },
        "MATH1141": {
            "is_accurate": True,
            "unlocked": True,
            "handbook_note": "",
            "warnings": []
        }
    }

def test_validateTermPlanner_past_term_suppress_warnings():
    x = requests.post('http://127.0.0.1:8000/planner/validateTermPlanner', json=PLANS["suppress_warning"])
    assert x.status_code == 200
    assert x.json()['courses_state'] ==  {
        "COMP1511": {
            "is_accurate": True,
            "unlocked": True,
            "handbook_note": "",
            "warnings": []
        },
        "MATH1141": {
            "is_accurate": True,
            "unlocked": True,
            "handbook_note": "",
            "warnings": []
        },
        "MATH1081": {
            "is_accurate": True,
            "unlocked": True,
            "handbook_note": "",
            "warnings": []
        },
        "COMP1521": {
            "is_accurate": True,
            "unlocked": True,
            "handbook_note": "",
            "warnings": []
        },
        "COMP2511": {
            "is_accurate": True,
            "unlocked": True,
            "handbook_note": "",
            "warnings": []
        },
        "COMP4128": {
            "is_accurate": True,
            "unlocked": True,
            "handbook_note": "",
            "warnings": []
        }
    }
