import json
import requests
from server.config import DUMMY_TOKEN
from server.tests.user.utility import clear
PATH = "server/example_input/example_local_storage_data.json"

with open(PATH, encoding="utf8") as f:
    DATA = json.load(f)

def test_updateCourseMark():
    clear()
    requests.post(
        'http://127.0.0.1:8000/user/saveLocalStorage', json=DATA["simple_year"])
    requests.put(
        'http://127.0.0.1:8000/user/updateCourseMark', json={
            'course': 'COMP1511',
            'mark': 75
        })
    user = requests.get(f'http://127.0.0.1:8000/user/data/{DUMMY_TOKEN}').json()
    assert user['courses']['COMP1511']['mark'] == 75
