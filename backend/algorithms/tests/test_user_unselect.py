"""Testing unselect course for User class"""

from algorithms.objects.user import User
import json
import requests

with open("algorithms/exampleUsers.json") as f:
    USERS = json.load(f)
f.close()

with open("algorithms/exampleUnselectCourse.json") as f:
    USER = json.load(f)
f.close()

def test_user1():
    user = User(USERS["user1"])
    # Consequence of Deleting a course
    data = user.unselect_course("COMP1511", [])
    assert user.has_taken_course("COMP1511") == False
    assert user.has_taken_course("COMP1521") == False
    assert data == ["COMP1511", 'COMP1521']
    # Delete a non-existing course
    user.unselect_course("COMP1511", [])

def test_user4():
    user = User(USERS["user4"])
    # Consequence of Deleting a course
    data = user.unselect_course("COMP1511", [])
    assert user.has_taken_course("COMP1511") == False
    assert user.has_taken_course("COMP1521") == False
    assert user.has_taken_course("COMP1531") == False
    assert data == ["COMP1511", 'COMP1521', 'COMP1531']

def test_no_dependencies():
    x = requests.post('http://127.0.0.1:8000/courses/unselectCourse?unselectedCourse=COMP1531', json=USER)
    assert x.status_code == 200
    assert x.json()["affected_courses"] == ["COMP1531"]

def test_locked_not_affected():
    # COMP9242 should be locked, and therefore not affected by 3231
    x = requests.post('http://127.0.0.1:8000/courses/unselectCourse?unselectedCourse=COMP3231', json=USER)
    assert x.status_code == 200
    assert x.json()["affected_courses"] == ["COMP3231"]

def test_one_dependency():
    x = requests.post('http://127.0.0.1:8000/courses/unselectCourse?unselectedCourse=COMP2521', json=USER)
    assert x.status_code == 200
    assert x.json()["affected_courses"] == ["COMP2521", "COMP3231"]

def test_multiple_dependencies():
    x = requests.post('http://127.0.0.1:8000/courses/unselectCourse?unselectedCourse=COMP1511', json=USER)
    assert x.status_code == 200
    assert x.json()["affected_courses"] == ["COMP1511", "COMP1521", "COMP1531", "COMP2521", "COMP3231"]
