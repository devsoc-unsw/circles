import json 
import requests 

from server.routers.model import CONDITIONS

PATH="algorithms/exampleUsers.json"

with open(PATH) as f:
    USERS = json.load(f)

def test_error():
    x = requests.get('http://127.0.0.1:8000/courses/getCourse/COMP1234')
    assert x.status_code == 400

def test_get_a_course():
    x = requests.get('http://127.0.0.1:8000/courses/getCourse/COMP1521')

    assert x.status_code == 200
    assert x.json()['code'] == "COMP1521"
    assert x.json()['path_from'].get("COMP1511") != None
    assert x.json()['path_to'].get("COMP3231") != None

def test_get_course_all_courses():
    for course in CONDITIONS.keys():
        x = requests.get(f'http://127.0.0.1:8000/courses/getCourse/{course}')
        assert x.status_code == 200 
