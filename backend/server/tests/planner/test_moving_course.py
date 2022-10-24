import json
import requests
from server.config import DUMMY_TOKEN
from server.tests.user.utility import clear

PATH = "server/example_input/example_local_storage_data.json"

with open(PATH, encoding="utf8") as f:
    DATA = json.load(f)


def test_unplanned_to_planned():
    clear()
    requests.post('http://127.0.0.1:8000/user/saveLocalStorage', json=DATA["empty_year"]) # set to empty planner

    data = {
        'courseCode': 'COMP1511'
    }
    x = requests.post('http://127.0.0.1:8000/planner/addToUnplanned', json=data)
    assert x.status_code == 200