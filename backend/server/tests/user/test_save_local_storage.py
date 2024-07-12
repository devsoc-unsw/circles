import json

import requests
from server.config import DUMMY_TOKEN
from server.tests.user.utility import clear, get_token_headers

PATH = "server/example_input/example_local_storage_data.json"

with open(PATH, encoding="utf8") as f:
    DATA = json.load(f)


def test_saveLocalStorage_empty():
    clear()
    headers = get_token_headers()
    x = requests.post(
        'http://127.0.0.1:8000/user/saveLocalStorage', json=DATA["empty_year"], headers=headers)
    assert x.status_code == 200


def test_saveLocalStorage_simple():
    clear()
    headers = get_token_headers()
    x = requests.post(
        'http://127.0.0.1:8000/user/saveLocalStorage', json=DATA["simple_year"], headers=headers)
    assert x.status_code == 200

    data = requests.get(f'http://127.0.0.1:8000/user/data/all', headers=headers)
    assert data.status_code == 200
    data = data.json()
    assert "COMP6447" in data['planner']['unplanned']
