import json
import requests
from server.config import DUMMY_TOKEN
from server.tests.user.utility import clear
PATH = "server/example_input/example_local_storage_data.json"

with open(PATH, encoding="utf8") as f:
    DATA = json.load(f)

def test_toggleWarning():
    clear()
    x = requests.post(
        'http://127.0.0.1:8000/user/saveLocalStorage', json=DATA["out_of_order"])
    assert x.status_code == 200
    requests.put('http://127.0.0.1:8000/user/toggleWarnings', json=['MATH1241'])
    data = requests.get(f'http://127.0.0.1:8000/user/data/{DUMMY_TOKEN}')
    assert data.json()['courses']['MATH1241']['suppressed']
    requests.put('http://127.0.0.1:8000/user/toggleWarnings', json=['MATH1241'])
    data = requests.get(f'http://127.0.0.1:8000/user/data/{DUMMY_TOKEN}')
    assert not data.json()['courses']['MATH1241']['suppressed']

def test_toggleWarningMultiple():
    clear()
    x = requests.post(
        'http://127.0.0.1:8000/user/saveLocalStorage', json=DATA["out_of_order"])
    assert x.status_code == 200
    requests.put('http://127.0.0.1:8000/user/toggleWarnings', json=['MATH1241', 'MATH1141'])
    data = requests.get(f'http://127.0.0.1:8000/user/data/{DUMMY_TOKEN}')
    assert data.json()['courses']['MATH1241']['suppressed']
    assert data.json()['courses']['MATH1141']['suppressed']


    # TODO: make validateTermPlanner actually work with suppression
    # plan = [list({course: [6, None] for course in term} for term in year.values()) for year in data.json()['planner']['years']]
    # x = requests.post(
    #     'http://127.0.0.1:8000/planner/validateTermPlanner', json={
    #         'programCode': data.json()['degree']['programCode'],
    #         'specialisations': data.json()['degree']['specs'],
    #         'mostRecentPastTerm': { 'Y': 0, 'T': 0 },
    #         'plan': plan
    #     })
    # assert any(not c['unlocked'] for c in x.json()['courses_state'].values())
    # requests.put('http://127.0.0.1:8000/user/toggleWarnings', json={'courses': ['MATH1241']})
    # data = requests.get(f'http://127.0.0.1:8000/user/data/{DUMMY_TOKEN}')
    # # convert 'years' into plannerData
    # plan = [list({course: [6, None] for course in term} for term in year.values()) for year in data.json()['planner']['years']]
    # x = requests.post(
    #     'http://127.0.0.1:8000/planner/validateTermPlanner', json={
    #         'programCode': data.json()['degree']['programCode'],
    #         'specialisations': data.json()['degree']['specs'],
    #         'mostRecentPastTerm': { 'Y': 1, 'T': 0 },
    #         'plan': plan
    #     })
    # assert all(c['unlocked'] for c in x.json()['courses_state'].values())
