import json
import requests
from server.config import DUMMY_TOKEN
from server.tests.user.utility import clear
PATH = "server/example_input/example_local_storage_data.json"

with open(PATH, encoding="utf8") as f:
    DATA = json.load(f)

def test_toggleSummerTerm():
    clear()
    x = requests.post(
        'http://127.0.0.1:8000/user/saveLocalStorage', json=DATA["empty_year"])
    assert x.status_code == 200
    data = requests.get(f'http://127.0.0.1:8000/user/data/{DUMMY_TOKEN}')
    assert data.json()["planner"]["isSummerEnabled"]
    requests.post('http://127.0.0.1:8000/user/toggleSummerTerm')
    data = requests.get(f'http://127.0.0.1:8000/user/data/{DUMMY_TOKEN}')
    assert not data.json()["planner"]["isSummerEnabled"]
