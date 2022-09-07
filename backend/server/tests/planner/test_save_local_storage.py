import json
import requests
from server.database import usersDB
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
    data = usersDB['tokens'].find_one({'token': ''})
    assert data is not None
    data = usersDB['users'].find_one({'_id': data['objectId']})
    print(data)
    assert data['degree']['programCode'] == "COMP2521"


