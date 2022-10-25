import json
import requests
from server.config import DUMMY_TOKEN
from server.tests.user.utility import clear
PATH = "server/example_input/example_local_storage_data.json"

with open(PATH, encoding="utf8") as f:
    DATA = json.load(f)

def test_updateDegreeLength_extend():
    clear()
    requests.post(
        'http://127.0.0.1:8000/user/saveLocalStorage', json=DATA["simple_year"])
    requests.put(
        f'http://127.0.0.1:8000/user/updateDegreeLength?numYears=4')
    user_after = requests.get(f'http://127.0.0.1:8000/user/data/{DUMMY_TOKEN}').json()
    assert len(user_after['planner']['years']) == 4
    assert user_after['planner']['years'][0] == { "T0": [], "T1": [ "COMP1511", "MATH1141", "MATH1081"], "T2": [ "COMP1521", "COMP1531", "COMP2521"], "T3": []}
    assert user_after['planner']['years'][1] == {"T0": [], "T1": ["ENGG2600"], "T2": ["ENGG2600"], "T3": ["ENGG2600"]}
    assert user_after['planner']['years'][2] == {"T0": [], "T1": [], "T2": [], "T3": []}
    assert user_after['planner']['years'][3] == {"T0": [], "T1": [], "T2": [], "T3": []}

def test_updateDegreeLength_shorten():
    clear()
    requests.post(
        'http://127.0.0.1:8000/user/saveLocalStorage', json=DATA["simple_year"])
    requests.put(
        f'http://127.0.0.1:8000/user/updateDegreeLength?numYears=2')
    user_after = requests.get(f'http://127.0.0.1:8000/user/data/{DUMMY_TOKEN}').json()
    assert len(user_after['planner']['years']) == 2
    assert user_after['planner']['years'][0] == { "T0": [], "T1": [ "COMP1511", "MATH1141", "MATH1081"], "T2": [ "COMP1521", "COMP1531", "COMP2521"], "T3": []}
    assert user_after['planner']['years'][1] == {"T0": [], "T1": ["ENGG2600"], "T2": ["ENGG2600"], "T3": ["ENGG2600"]}
