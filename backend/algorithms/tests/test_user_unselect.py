'''Testing unselect course for User class'''

from algorithms.objects.conditions import *
from algorithms.objects.user import User
from math import isclose
import json

PATH = "./algorithms/exampleUsers.json"


with open(PATH) as f:
    USERS = json.load(f)
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


