import json
import requests
import random

from server.routers.model import CONDITIONS

PATH="./algorithms/tests/exampleUsers.json"

with open(PATH, encoding="utf8") as f:
    USERS = json.load(f)

def test_error():
    x = requests.get('http://127.0.0.1:8000/courses/getCourse/COMP1234')
    assert x.status_code == 400

def test_get_a_course():
    x = requests.get('http://127.0.0.1:8000/courses/getCourse/COMP1521')

    assert x.status_code == 200
    assert x.json()['code'] == "COMP1521"
    assert not x.json()['is_multiterm']


def test_get_archived_course():
    x = requests.get('http://127.0.0.1:8000/courses/getCourse/ENGG1000')
    assert x.status_code == 200
    assert x.json()['code'] == "ENGG1000"
    assert x.json()['is_legacy'] == True


def test_get_course_all_courses():
    failed_courses = [
        course for course in CONDITIONS.keys()
        if (
            random.random() < 0.5 and # Comment out this line to test all courses
            requests.get(f'http://127.0.0.1:8000/courses/getCourse/{course}').status_code != 200
        )
    ]
    assert failed_courses == [], f"Total of {len(failed_courses)} courses failed.\n{failed_courses}"
