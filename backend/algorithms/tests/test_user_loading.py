"""Testing the user class to ensure that the user data is accurately imported and updated"""

from algorithms.objects.user import User
from math import isclose
import json

PATH = "./algorithms/exampleUsers.json"


with open(PATH, encoding="utf8") as f:
    USERS = json.load(f)
f.close()


def test_user1():
    user = User(USERS["user1"])

    assert user.in_program("3778")
    assert user.in_specialisation("COMPA1")
    assert user.in_specialisation("ACCTA2")
    assert user.has_taken_course("COMP1511")
    assert user.has_taken_course("COMP1521")
    assert isclose(user.wam(), 70.5)
    assert user.uoc() == 12
    assert user.year == 3


def test_user2():
    user = User(USERS["user2"])

    assert user.in_program("3778")
    assert user.in_specialisation("COMPA1")
    assert user.has_taken_course("COMP1511")
    assert user.has_taken_course("MATH1131")
    assert user.has_taken_course("MATH1081")
    assert user.wam() == None
    assert user.uoc() == 18
    assert user.year == 1


def test_user3():
    user = User(USERS["user3"])

    assert user.in_program("3778")
    assert user.in_specialisation("COMPA1")
    assert user.wam() == None
    assert user.uoc() == 0
    assert user.year == 1
