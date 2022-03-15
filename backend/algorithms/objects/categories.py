"""
Supporting classes for Requirements which have some condition attached
to a specific category
"""

from abc import ABC, abstractmethod
import re
import json

# Preload the mappings to school and faculty
CACHED_MAPPINGS = {}

with open("./algorithms/cache/courseMappings.json", "r", encoding="utf8") as f:
    CACHED_MAPPINGS = json.load(f)

class Category(ABC):
    """
    The base Category class from which more detailed Category classes
    stem from
    """

    @abstractmethod
    def match_definition(self, course):
        pass

    @abstractmethod
    def __str__(self) -> str:
        return super().__str__()


class AnyCategory(Category):
    """Wildcard category `*` that matches to anything"""
    def match_definition(self, course):
        return True

    def __str__(self) -> str:
        return "any course"


class CourseCategory(Category):
    """A 4 letter course category, e.g. COMP, SENG, MATH, ENGG"""

    def __init__(self, code: str):
        self.code = code

    def match_definition(self, course):
        return bool(re.match(rf"^{self.code}\d{{4}}$", course))

    def __str__(self) -> str:
        return f"{self.code} courses"


class LevelCategory(Category):
    """A simple level category. e.g. L2"""

    def __init__(self, level: int):
        # A number representing the level
        self.level = level

    def match_definition(self, course: str):
        return bool(course[4] == str(self.level))

    def __str__(self) -> str:
        return f"level {self.level} courses"


class LevelCourseCategory(Category):
    """A level category for a certain type of course (e.g. L2 MATH)"""

    def __init__(self, level, code):
        self.level = level
        self.code = code

    def match_definition(self, course) -> bool:
        return bool(
            re.match(rf"{self.code}\d{{4}}", course) and course[4] == str(self.level)
        )

    def __str__(self) -> str:
        return f"Level {self.level} {self.code} courses"


class SchoolCategory(Category):
    """Category for courses belonging to a school (e.g. S Mech)"""

    def __init__(self, school):
        self.school = school  # The code for the school (S Mech)

    def match_definition(self, course):
        return course in CACHED_MAPPINGS[self.school]

    def __str__(self) -> str:
        return self.school


class FacultyCategory(Category):
    """Category for courses belonging to a faculty (e.g. F Business)"""

    def __init__(self, faculty):
        self.faculty = faculty  # The code for the faculty (F Business)

    def match_definition(self, course):
        return course in CACHED_MAPPINGS[self.faculty]

    def __str__(self) -> str:
        return self.faculty
