import requests

from server.tests.user.utility import clear, get_token, get_token_headers


def test_autoplanning_generic():
    clear()
    token = get_token()
    headers = get_token_headers(token)
    requests.put('http://127.0.0.1:8000/user/import', json={
        "degree": {
            "programCode": "3778",
            "specs": [
                "COMPA1"
            ]
        },
        "courses": {
            "COMP1511": {
                "mark": None,
                "ignoreFromProgression": False
            },
            "COMP1521": {
                "mark": None,
                "ignoreFromProgression": False
            }
        },
        "planner": {
            "years": [ 
                {
                    "T0": [],
                    "T1": [],
                    "T2": [],
                    "T3": []
                },
                {
                    "T0": [],
                    "T1": [],
                    "T2": [],
                    "T3": []
                },
                {
                    "T0": [],
                    "T1": [],
                    "T2": [],
                    "T3": []
                },
                {
                    "T0": [],
                    "T1": [],
                    "T2": [],
                    "T3": []
                }
            ],
            "unplanned": ["COMP1511", "COMP1521"],
            "startYear": 2020,
            "isSummerEnabled": False,
            "lockedTerms": {}
        },
        "settings": {
            "showMarks": True,
            "hiddenYears": []
        }
    }, headers=headers)

    x = requests.post(
        'http://127.0.0.1:8000/planner/autoplan', json={
            'endTime': [2023, 3],
        },
        headers=headers
    )
    assert x.status_code == 200
    body = x.json()
    assert 'plan' in body


def _find_course_term_index(planner_years: list[dict[str, list[str]]], course_code: str) -> int:
    for year_index, year in enumerate(planner_years):
        for term_index in range(4):
            if course_code in year[f'T{term_index}']:
                return year_index * 4 + term_index
    raise AssertionError(f"{course_code} was not found in planner years")


def test_autoplanning_jason_screenshot_ordering():
    clear()
    token = get_token()
    headers = get_token_headers(token)

    import_res = requests.put('http://127.0.0.1:8000/user/import', json={
        "degree": {
            "programCode": "3778",
            "specs": [
                "COMPA1"
            ]
        },
        "courses": {
            "MATH1081": {"mark": None, "ignoreFromProgression": False},
            "COMP1511": {"mark": None, "ignoreFromProgression": False},
            "COMP1521": {"mark": None, "ignoreFromProgression": False},
            "COMP2521": {"mark": None, "ignoreFromProgression": False},
            "COMP2041": {"mark": None, "ignoreFromProgression": False},
            "COMP3121": {"mark": None, "ignoreFromProgression": False},
            "COMP4128": {"mark": None, "ignoreFromProgression": False},
            "MATH2901": {"mark": None, "ignoreFromProgression": False},
            "MATH3856": {"mark": None, "ignoreFromProgression": False},
            "SCIF0000": {"mark": None, "ignoreFromProgression": False}
        },
        "planner": {
            "years": [
                {
                    "T0": [],
                    "T1": ["MATH1081", "COMP1511"],
                    "T2": ["COMP2521", "COMP1521"],
                    "T3": []
                },
                {
                    "T0": [],
                    "T1": [],
                    "T2": [],
                    "T3": []
                },
                {
                    "T0": [],
                    "T1": [],
                    "T2": [],
                    "T3": []
                },
                {
                    "T0": [],
                    "T1": [],
                    "T2": [],
                    "T3": []
                }
            ],
            "unplanned": [
                "COMP2041",
                "COMP3121",
                "COMP4128",
                "MATH2901",
                "MATH3856",
                "SCIF0000"
            ],
            "startYear": 2023,
            "isSummerEnabled": False,
            "lockedTerms": {}
        },
        "settings": {
            "showMarks": True,
            "hiddenYears": []
        }
    }, headers=headers)
    assert import_res.status_code == 200

    autoplan_res = requests.post(
        'http://127.0.0.1:8000/planner/autoplan',
        json={'endTime': [2026, 3]},
        headers=headers,
    )
    assert autoplan_res.status_code == 200

    user_res = requests.get('http://127.0.0.1:8000/user/data/all', headers=headers)
    assert user_res.status_code == 200

    planner_years = user_res.json()['planner']['years']
    comp3121_term = _find_course_term_index(planner_years, 'COMP3121')
    comp4128_term = _find_course_term_index(planner_years, 'COMP4128')

    assert comp3121_term < comp4128_term
