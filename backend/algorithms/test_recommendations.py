'''Testing the user class to ensure that the user data is accurately imported and updated'''

from .conditions import User
from .recommendations import *
from math import isclose
import pytest
import json

PATH = "./algorithms/exampleUsers.json"


with open(PATH) as f:
    USERS = json.load(f)
f.close()


def test_user1():
    user = User(USERS["user1"])
    data = get_unlocked_courses(user)
    print(len(data))
    pass

#test_user1()
    
