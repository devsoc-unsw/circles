""" Testing unselect course for User class """

from algorithms.objects.user import User
import json

with open("algorithms/exampleUsers.json") as f:
    USERS = json.load(f)


def test_user1():
    user = User(USERS["user1"])
    # Consequence of Deleting a course
    data = user.unselect_course("COMP1511")
    assert not user.has_taken_course("COMP1511")
    assert not user.has_taken_course("COMP1521")
    assert data == ["COMP1511", "COMP1521"]
    # Delete a non-existing course
    user.unselect_course("COMP1511")


def test_user4():
    user = User(USERS["user4"])
    # Consequence of Deleting a course
    data = user.unselect_course("COMP1511")
    assert not user.has_taken_course("COMP1511")
    assert not user.has_taken_course("COMP1521")
    assert not user.has_taken_course("COMP1531")
    assert data == ["COMP1511", "COMP1521", "COMP1531"]
