import json
import pytest
from algorithms.objects.categories import Category, CourseCategory
from algorithms.objects.user import User

PATH = "./algorithms/tests/exampleUsers.json"

with open(PATH, encoding="utf8") as f:
    USERS = json.load(f)


def test_category_instantiation_causes_error():
    """error because you need to override the match_definition method"""
    with pytest.raises(Exception):
        Category()


def test_course_category_produces_correct_wam():
    user = User(USERS["user4"])
    comp = CourseCategory("COMP")
    assert user.wam(CourseCategory("FOOD")) is None
    assert user.wam(comp) == 66

    user.add_courses({"COMP1069": (2, 69)})
    assert user.wam(comp) == 66.3


def test_course_category_produces_correct_uoc():
    user = User(USERS["user4"])
    comp = CourseCategory("COMP")
    assert user.uoc(CourseCategory("FOOD")) == 0
    assert user.uoc(comp) == 18
    user.add_courses({"COMP1069": (2, 69)})
    assert user.uoc(comp) == 20
