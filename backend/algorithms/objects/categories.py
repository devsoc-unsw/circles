'''Supporting classes for Requirements which have some condition attached to a
specific cateogry'''

from abc import ABC, abstractmethod
import re
import json
# Preload the mappings to school and faculty
CACHED_MAPPINGS = {}

with open("./algorithms/cache/courseMappings.json") as f:
    CACHED_MAPPINGS = json.load(f)
    f.close()

class Category(ABC):
    '''The base Category class from which more detailed Category classes stem from'''
    @abstractmethod
    def match_definition(self, course):
        pass

    def uoc(self, user):
        '''Given a user, returns the number of units they have taken for this uoc category'''
        return sum(uoc for course, (uoc, _) in user.courses.items() if self.match_definition(course))

    def wam(self, user):
        '''The wam of courses matching the code or None if no wams were entered
        or no courses matched'''
        total_wam, total_uoc = 0, 0

        for course, (uoc, grade) in user.courses.items():
            if grade != None and self.match_definition(course):
                total_uoc += uoc
                total_wam += uoc * grade

        return None if total_uoc == 0 else total_wam / total_uoc


class CourseCategory(Category):
    '''A 4 letter course category, e.g. COMP, SENG, MATH, ENGG'''

    def __init__(self, code: str):
        self.code = code

    def match_definition(self, course):
        return bool(re.match(rf'^{self.code}\d{{4}}$', course))

class LevelCategory(Category):
    '''A simple level category. e.g. L2'''

    def __init__(self, level: int):
        # A number representing the level
        self.level = level

    def match_definition(self, course: str):
        return bool(course[4] == str(self.level))

class LevelCourseCategory(Category):
    '''A level category for a certain type of course (e.g. L2 MATH)'''

    def __init__(self, level, code):
        self.level = level
        self.code = code

    def match_definition(self, course) -> bool:
        return bool(re.match(rf'{self.code}\d{{4}}', course) and course[4] == str(self.level))

class SchoolCategory(Category):
    '''Category for courses belonging to a school (e.g. S Mech)'''
    def __init__(self, school):
        self.school = school # The code for the school (S Mech)

    def match_definition(self, course):
        return course in CACHED_MAPPINGS[self.school]

class FacultyCategory(Category):
    '''Category for courses belonging to a faculty (e.g. F Business)'''
    def __init__(self, faculty):
        self.faculty = faculty # The code for the faculty (F Business)

    def match_definition(self, course):
        return course in CACHED_MAPPINGS[self.faculty]
