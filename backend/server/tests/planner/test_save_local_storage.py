import json
import requests


PATH = "server/example_input/example_local_storage_data.json"

with open(PATH, encoding="utf8") as f:
    DATA = json.load(f)


def test_saveLocalStorage_empty():
    x = requests.post(
        'http://127.0.0.1:8000/planner/saveLocalStorage', json=DATA["empty_year"])
    assert x.status_code == 200


def test_saveLocalStorage_simple():
    x = requests.post(
        'http://127.0.0.1:8000/planner/saveLocalStorage', json=DATA["simple_year"])
    assert x.status_code == 200
