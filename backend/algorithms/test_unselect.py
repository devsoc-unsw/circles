'''Testing unselect course for User class'''

from .conditions import User
from math import isclose
import pytest
import json

PATH = "./algorithms/exampleUsers.json"


with open(PATH) as f:
    USERS = json.load(f)
f.close()


def test_user1():
    user = User(USERS["user1"])
    user.unselect_course("COMP1511", [])
    assert user.has_taken_course("COMP1511") == False