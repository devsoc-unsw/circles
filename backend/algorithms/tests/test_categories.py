from operator import le
import pytest
from algorithms.objects.categories import *
from algorithms.objects.user import User

# need to test if the UOC and WAM mathods are correct for 1 case only

# rest need tests for their match_definition

PATH = "./algorithms/exampleUsers.json"

with open(PATH) as f:
    USERS = json.load(f)
f.close()

def test_category_instantiation_causes_error():
    '''error because you need to override the match_definition method'''
    with pytest.raises(Exception):
        Category()

def test_course_category_produces_correct_wam():
    user = User(USERS["user4"])
    comp = CourseCategory("COMP")
    assert CourseCategory("FOOD").wam(user) is None
    assert comp.wam(user) == 66
    
    user.add_courses( {"COMP1069": (2, 69)} )
    assert comp.wam(user) == 66.3

def test_course_category_produces_correct_uoc():
    user = User(USERS["user4"])
    print(user.courses)
    comp = CourseCategory("COMP")
    assert CourseCategory("FOOD").uoc(user) == 0
    assert comp.uoc(user) == 18
    user.add_courses( {"COMP1069": (2, 69)} )
    assert comp.uoc(user) == 20

def test_course_category_match_definition():
    courseCategory = CourseCategory("PAIN")
    assert not courseCategory.match_definition("PAIN")
    assert courseCategory.match_definition("PAIN1234")
    assert not courseCategory.match_definition("PAIN123")
    assert not courseCategory.match_definition("PAIN12345")

def test_level_category_match_definition():
    level1 = LevelCategory(1)
    assert level1.match_definition("COMP1000")
    assert level1.match_definition("ENGG1100")
    assert not level1.match_definition("ENGG3100")

def test_level_course_category_match_definition():
    level1comp = LevelCourseCategory(1, "COMP")
    assert level1comp.match_definition("COMP1000")
    assert not level1comp.match_definition("COMP3000")
    assert not level1comp.match_definition("ENGG1100")
    assert not level1comp.match_definition("ENGG3100")
