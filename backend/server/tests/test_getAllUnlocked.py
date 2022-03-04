import json
import requests

from server.routers.model import CONDITIONS

PATH = "algorithms/exampleUsers.json"

with open(PATH) as f:
    USERS = json.load(f)

def test_size():
  # test the response is not 500 and contains a value for every course
  x = requests.post('http://127.0.0.1:8000/courses/getAllUnlocked', json=USERS["user3"])
  assert x.status_code != 500
  assert set(CONDITIONS.keys()) == set(x.json()["courses_state"].keys())

def test_fix_wam_only_unlock_given_course():
  x = requests.post('http://127.0.0.1:8000/courses/getAllUnlocked', json=USERS["user5"])
  assert x.status_code != 500
  assert x.json()["courses_state"]["COMP1521"]["unlocked"] == True
  assert x.json()["courses_state"]["COMP1521"]["is_accurate"] == True
  assert "final term" in x.json()["courses_state"]["COMP9302"]["handbook_note"]

def test_unlock_dependant_course():
  x = requests.post('http://127.0.0.1:8000/courses/getAllUnlocked', json=USERS["user2"])
  assert x.status_code != 500
  assert x.json()["courses_state"]["MATH1231"]["unlocked"] == True
  assert x.json()["courses_state"]["MATH1231"]["is_accurate"] == True
  assert "more information" in x.json()["courses_state"]["TABL3033"]["handbook_note"]
