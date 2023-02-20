# pylint: disable=missing-function-docstring
# pylint: disable=missing-module-docstring
import requests

def test_autoplanning_generic():
    x = requests.post(
        'http://127.0.0.1:8000/planner/autoplanning', json={
            'courseCodes': [
                'COMP1511', 'COMP2521', 'COMP1531', 'COMP1521', 'MATH1141', 'MATH1241', 'MATH1081', 'COMP2041', 'ENGG2600', 'ENGG2600', 'ENGG2600', 'COMP2511', 'MATH3411', 'COMP3411', 'COMP6841', 'COMP3231', 'COMP3141', 'COMP3121', 'COMP3131', 'COMP4141', 'COMP3901', 'ARTS1360'
            ],
            'plannerData': {
                "program": "3778",
                "specialisations": ["COMPA1"],
                "plan": [
                    [
                        {},
                        {},
                        {},
                        {},
                    ],
                    [
                        {},
                        {},
                        {},
                        {},
                    ],
                    [
                        {},
                        {},
                        {},
                        {},
                    ],
                    [
                        {},
                        {},
                        {},
                        {},
                    ],
                ],
                "mostRecentPastTerm": {
                    "Y": 1,
                    "T": 0,
                },
            },
            'programTime': {
                'startTime': [2020, 1],
                'endTime': [2023, 3],
                'uocMax': [
                    12, 20, 20, 20, 12, 20, 20, 20, 10, 20, 20, 20, 10, 20, 20, 20
                ]
            }
        })
    assert x.status_code == 200
    # TODO: please write actual tests