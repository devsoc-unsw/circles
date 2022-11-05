import json
import requests
from server.config import DUMMY_TOKEN
from server.tests.user.utility import clear
PATH = "server/example_input/example_local_storage_data.json"

with open(PATH, encoding="utf8") as f:
    DATA = json.load(f)

def test_updateCourseMark_back_time_2019():
    clear()
    requests.post(
        'http://127.0.0.1:8000/user/saveLocalStorage', json=DATA["simple_year"])
    user_before = requests.get(f'http://127.0.0.1:8000/user/data/{DUMMY_TOKEN}').json()
    requests.put(
        f'http://127.0.0.1:8000/user/updateStartYear?startYear=2019')
    user_after = requests.get(f'http://127.0.0.1:8000/user/data/{DUMMY_TOKEN}').json()
    assert len(user_before['planner']['years']) == len(user_after['planner']['years'])
    assert user_after['planner']['years'][0] == {"T0": [], "T1": [], "T2": [], "T3": []}
    assert user_after['planner']['years'][1] == { "T0": [], "T1": [ "COMP1511", "MATH1141", "MATH1081"], "T2": [ "COMP1521", "COMP1531", "COMP2521"], "T3": []}
    assert user_after['planner']['years'][2] == {"T0": [], "T1": ["ENGG2600"], "T2": ["ENGG2600"], "T3": ["ENGG2600"]}
    

def test_updateCourseMark_back_time_2018():
    clear()
    requests.post(
        'http://127.0.0.1:8000/user/saveLocalStorage', json=DATA["simple_year"])
    user_before = requests.get(f'http://127.0.0.1:8000/user/data/{DUMMY_TOKEN}').json()
    requests.put(
        f'http://127.0.0.1:8000/user/updateStartYear?startYear=2018')
    user_after = requests.get(f'http://127.0.0.1:8000/user/data/{DUMMY_TOKEN}').json()
    assert len(user_before['planner']['years']) == len(user_after['planner']['years'])
    assert user_after['planner']['years'][0] == {"T0": [], "T1": [], "T2": [], "T3": []}
    assert user_after['planner']['years'][1] == {"T0": [], "T1": [], "T2": [], "T3": []}
    assert user_after['planner']['years'][2] == { "T0": [], "T1": [ "COMP1511", "MATH1141", "MATH1081"], "T2": [ "COMP1521", "COMP1531", "COMP2521"], "T3": []}

def test_updateCourseMark_forward_time_2021():
    clear()
    requests.post(
        'http://127.0.0.1:8000/user/saveLocalStorage', json=DATA["simple_year"])
    user_before = requests.get(f'http://127.0.0.1:8000/user/data/{DUMMY_TOKEN}').json()
    requests.put(
        f'http://127.0.0.1:8000/user/updateStartYear?startYear=2021')
    user_after = requests.get(f'http://127.0.0.1:8000/user/data/{DUMMY_TOKEN}').json()
    assert len(user_before['planner']['years']) == len(user_after['planner']['years'])
    assert user_after['planner']['years'][0] == {"T0": [], "T1": ["ENGG2600"], "T2": ["ENGG2600"], "T3": ["ENGG2600"]}
    assert user_after['planner']['years'][1] == {"T0": [], "T1": [], "T2": [], "T3": []}
    assert user_after['planner']['years'][2] == {"T0": [], "T1": [], "T2": [], "T3": []}
