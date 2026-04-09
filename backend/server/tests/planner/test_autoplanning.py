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
