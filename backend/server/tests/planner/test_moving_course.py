import json
import requests
from server.config import DUMMY_TOKEN
from server.tests.user.utility import clear

PATH = "server/example_input/example_local_storage_data.json"

with open(PATH, encoding="utf8") as f:
    DATA = json.load(f)


def test_add_to_unplanned():
    clear()
    requests.post('http://127.0.0.1:8000/user/saveLocalStorage', json=DATA["empty_year"]) # set to empty planner

    data = {
        'courseCode': 'COMP1511'
    }
    x = requests.post('http://127.0.0.1:8000/planner/addToUnplanned', json=data)
    assert x.status_code == 200

    user = requests.get(f'http://127.0.0.1:8000/user/data/{DUMMY_TOKEN}')
    data = user.json()
    assert "COMP1511" in data['planner']['unplanned']

def test_unplanned_to_term():
    clear()
    requests.post('http://127.0.0.1:8000/user/saveLocalStorage', json=DATA["simple_year"])

    data = {
        'destRow': 0,
        'destTerm': 'T3',
        'destIndex': 1,
        'courseCode': 'COMP6447'
    }
    x = requests.post('http://127.0.0.1:8000/planner/unPlannedToTerm', json=data)
    assert x.status_code == 200

    data = requests.get(f'http://127.0.0.1:8000/user/data/{DUMMY_TOKEN}').json()
    assert "COMP6447" not in data['planner']['unplanned']
    assert data['planner']['years'][0]['T3'][0]  == "COMP6447"

def test_unplanned_to_term_multiterm():
    clear()
    requests.post('http://127.0.0.1:8000/user/saveLocalStorage', json=DATA["empty_year"])
    data = {'courseCode': 'ENGG2600'}
    requests.post('http://127.0.0.1:8000/planner/addToUnplanned', json=data)

    data = {
        'destRow': 0,
        'destTerm': 'T3',
        'destIndex': 0,
        'courseCode': 'ENGG2600'
    }
    x = requests.post('http://127.0.0.1:8000/planner/unPlannedToTerm', json=data)
    assert x.status_code == 200

    data = requests.get(f'http://127.0.0.1:8000/user/data/{DUMMY_TOKEN}').json()
    assert "ENGG2600" not in data['planner']['unplanned']
    assert "ENGG2600" in data['planner']['years'][0]['T3']
    assert "ENGG2600" in data['planner']['years'][1]['T1']
    assert "ENGG2600" in data['planner']['years'][1]['T2']

def test_invalid_unplanned_to_term_multiterm():
    clear()
    requests.post('http://127.0.0.1:8000/user/saveLocalStorage', json=DATA["empty_year"])
    data = {'courseCode': 'ENGG2600'}
    requests.post('http://127.0.0.1:8000/planner/addToUnplanned', json=data)

    data = {
        'destRow': 2,
        'destTerm': 'T3',
        'destIndex': 0,
        'courseCode': 'ENGG2600'
    }
    x = requests.post('http://127.0.0.1:8000/planner/unPlannedToTerm', json=data)
    assert x.status_code == 400

def test_planned_to_term():
    clear()
    requests.post('http://127.0.0.1:8000/user/saveLocalStorage', json=DATA["simple_year"])
    data = requests.get(f'http://127.0.0.1:8000/user/data/{DUMMY_TOKEN}').json()
    assert "COMP2521" in data['planner']['years'][0]['T2']

    data = {
        'srcRow': 0,
        'srcTerm': 'T2',
        'destRow': 1,
        'destTerm': 'T3',
        'destIndex': 0,
        'courseCode': 'COMP2521'
    }
    x = requests.post('http://127.0.0.1:8000/planner/plannedToTerm', json=data)
    assert x.status_code == 200

    data = requests.get(f'http://127.0.0.1:8000/user/data/{DUMMY_TOKEN}').json()
    assert "COMP2521" not in data['planner']['years'][0]['T2']
    assert "COMP2521" in data['planner']['years'][1]['T3']

def test_planned_to_term_multiterm():
    clear()
    requests.post('http://127.0.0.1:8000/user/saveLocalStorage', json=DATA["simple_year"])
    data = requests.get(f'http://127.0.0.1:8000/user/data/{DUMMY_TOKEN}').json()
    assert "ENGG2600" in data['planner']['years'][1]['T3']
    assert "ENGG2600" not in data['planner']['years'][0]['T3']

    data = {
        'srcRow': 1,
        'srcTerm': 'T2',
        'destRow': 0,
        'destTerm': 'T3',
        'destIndex': 0,
        'courseCode': 'ENGG2600'
    }
    x = requests.post('http://127.0.0.1:8000/planner/plannedToTerm', json=data)
    assert x.status_code == 200

    data = requests.get(f'http://127.0.0.1:8000/user/data/{DUMMY_TOKEN}').json()
    assert "ENGG2600" not in data['planner']['years'][1]['T3']
    assert "ENGG2600" not in data['planner']['years'][1]['T2']
    assert "ENGG2600" in data['planner']['years'][0]['T2']
    assert "ENGG2600" in data['planner']['years'][0]['T3']
    assert "ENGG2600" in data['planner']['years'][1]['T1']

def test_invalid_planned_to_term():
    clear()
    requests.post('http://127.0.0.1:8000/user/saveLocalStorage', json=DATA["simple_year"])

    data = {
        'srcRow': 1,
        'srcTerm': 'T3',
        'destRow': 0,
        'destTerm': 'T2',
        'destIndex': 0,
        'courseCode': 'ENGG2600'
    }
    x = requests.post('http://127.0.0.1:8000/planner/plannedToTerm', json=data)
    assert x.status_code == 400

def test_remove_unplanned_course():
    clear()
    requests.post('http://127.0.0.1:8000/user/saveLocalStorage', json=DATA["simple_year"])
    data = requests.get(f'http://127.0.0.1:8000/user/data/{DUMMY_TOKEN}').json()
    assert "COMP6447" in data['planner']['unplanned']

    data = {'courseCode': 'COMP6447'}
    x = requests.post('http://127.0.0.1:8000/planner/removeCourse', json=data)
    assert x.status_code == 200

    data = requests.get(f'http://127.0.0.1:8000/user/data/{DUMMY_TOKEN}').json()
    assert "COMP6447" not in data['planner']['unplanned']

def test_remove_planned_course():
    clear()
    requests.post('http://127.0.0.1:8000/user/saveLocalStorage', json=DATA["simple_year"])
    data = requests.get(f'http://127.0.0.1:8000/user/data/{DUMMY_TOKEN}').json()
    assert "MATH1081" in data['planner']['years'][0]['T1']

    data = {'courseCode': 'MATH1081'}
    x = requests.post('http://127.0.0.1:8000/planner/removeCourse', json=data)
    assert x.status_code == 200

    data = requests.get(f'http://127.0.0.1:8000/user/data/{DUMMY_TOKEN}').json()
    assert "MATH1081" not in data['planner']['years'][0]['T1']


def test_remove_all_courses():
    clear()
    requests.post('http://127.0.0.1:8000/user/saveLocalStorage', json=DATA["simple_year"])
    data = requests.get(f'http://127.0.0.1:8000/user/data/{DUMMY_TOKEN}').json()
    assert "COMP6447" in data['planner']['unplanned']
    assert "MATH1081" in data['planner']['years'][0]['T1']
    assert "ENGG2600" in data['planner']['years'][1]['T2']

    x = requests.post('http://127.0.0.1:8000/planner/removeAll')
    assert x.status_code == 200

    data = requests.get(f'http://127.0.0.1:8000/user/data/{DUMMY_TOKEN}').json()
    assert "COMP6447" not in data['planner']['unplanned']
    assert "MATH1081" not in data['planner']['years'][0]['T1']
    assert "ENGG2600" not in data['planner']['years'][1]['T2']

def test_unschedule_course():
    clear()
    requests.post('http://127.0.0.1:8000/user/saveLocalStorage', json=DATA["simple_year"])
    data = requests.get(f'http://127.0.0.1:8000/user/data/{DUMMY_TOKEN}').json()
    assert "COMP1531" in data['planner']['years'][0]['T2']
    assert "COMP1531" not in data['planner']['unplanned']

    data = {'courseCode': 'COMP1531'}
    x = requests.post('http://127.0.0.1:8000/planner/unscheduleCourse', json=data)
    assert x.status_code == 200

    data = requests.get(f'http://127.0.0.1:8000/user/data/{DUMMY_TOKEN}').json()
    assert "COMP1531" not in data['planner']['years'][0]['T2']
    assert "COMP1531" in data['planner']['unplanned']


def test_unschedule_all():
    clear()
    requests.post('http://127.0.0.1:8000/user/saveLocalStorage', json=DATA["simple_year"])
    data = requests.get(f'http://127.0.0.1:8000/user/data/{DUMMY_TOKEN}').json()
    assert "COMP1531" in data['planner']['years'][0]['T2']
    assert "COMP1531" not in data['planner']['unplanned']
    assert "ENGG2600" in data['planner']['years'][1]['T2']
    assert "ENGG2600" not in data['planner']['unplanned']
    assert "MATH1141" in data['planner']['years'][0]['T1']
    assert "MATH1141" not in data['planner']['unplanned']

    x = requests.post('http://127.0.0.1:8000/planner/unscheduleAll', json=data)
    assert x.status_code == 200

    data = requests.get(f'http://127.0.0.1:8000/user/data/{DUMMY_TOKEN}').json()
    assert "COMP1531" not in data['planner']['years'][0]['T2']
    assert "COMP1531" in data['planner']['unplanned']
    assert "ENGG2600" not in data['planner']['years'][1]['T2']
    assert "ENGG2600" in data['planner']['unplanned']
    assert "MATH1141" not in data['planner']['years'][0]['T1']
    assert "MATH1141" in data['planner']['unplanned']