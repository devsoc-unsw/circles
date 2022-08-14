"""
    Defines the `User` class which holds their data such as, courses taken,
    current course, current program, ... etc.
    The class contains methods that are used to determine whether the user
    is able to take a course.
"""

import copy
import json
from typing import Literal, Optional, Tuple
import re
from algorithms.cache.cache_config import CACHED_EQUIVALENTS_FILE
from algorithms.objects.categories import AnyCategory, Category

with open(CACHED_EQUIVALENTS_FILE, "r", encoding="utf8") as f:
    CACHED_EQUIVALENTS: dict[str, dict[str, Literal[1]]] = json.load(f)

class User:
    """ A user and their data which will be used to determine if they can take a course """

    def __init__(self, data = None):
        # Will load the data if any was given
        self.courses: dict[str, Tuple[int, int | None]] = {}
        self.cur_courses: list[str, Tuple[int, int]] = []  # Courses in the current term
        self.program: str = None
        self.specialisations: dict[str, int] = {}
        self.year: int = 0

        # Data was provided
        if data is not None:
            self.load_json(data)

    def add_courses(self, courses: dict[str, Tuple[int, int | None]]):
        """
        Given a dictionary of courses mapping course code to a (uoc, grade) tuple,
        adds the course to the user and updates the uoc/grade at the same time.
        this will update the data if the course has been taken already
        """
        self.courses.update(courses)

    def add_current_course(self, course: str):
        """
        Given a course the user is taking in their current term,
        adds it to their cur_courses
        """
        self.cur_courses.append(course)

    def add_current_courses(self, courses: list[str]):
        """
        Takes in a list of courses (represented as strings by course
        code) and, adds it to the list of current courses.
        """
        self.cur_courses.extend(courses)

    def empty_current_courses(self):
        """
        Empty all the current courses. Helps with moving
        on to the next term in the term planner api
        """
        self.cur_courses.clear()

    def add_program(self, program: str):
        """ Adds a program to this user """
        self.program = program

    def add_specialisation(self, specialisation: str):
        """ Adds a specialisation to this user """
        self.specialisations[specialisation] = 1

    def has_taken_specific_course(self, course):
        """ taken a course directly, no equivalents """
        return course in self.courses

    def has_taken_course(self, course: str):
        """ Determines if the user has taken this course """
        return course in self.courses or any(c in self.courses for c in (CACHED_EQUIVALENTS.get(course) or []))

    def is_taking_course(self, course: str):
        """ Determines if the user is taking this course this term """
        return course in self.cur_courses or any(c in self.cur_courses for c in (CACHED_EQUIVALENTS.get(course) or []))

    def in_program(self, program: str):
        """ Determines if the user is in this program code """
        return self.program == program

    def get_courses(self):
        """ get all course codes """
        return list(self.courses.keys())

    def in_specialisation(self, specialisation: str):
        """ Determines if the user is in the specialisation """
        # Escape specialisations and replace '?'s with wildcards
        wildcarded = re.escape(specialisation).replace(r'\?', r'[A-Z0-9]')
        pat = f"^{wildcarded}$"

        # Search for it in the users' specialisations
        return any(
            bool(re.match(pat, spec, flags=re.IGNORECASE))
            for spec in self.specialisations
        )

    def load_json(self, data):
        """ Given the user data, correctly loads it into this user class """

        if "program" in data.keys():
            self.program = copy.deepcopy(data["program"])
        if "specialisations" in data.keys():
            self.specialisations = copy.deepcopy(data["specialisations"])
        if "courses" in data.keys():
            self.courses = copy.deepcopy(data["courses"])
        if "year" in data.keys():
            self.year = copy.deepcopy(data["year"])

    def get_grade(self, course: str):
        """
        Given a course which the student has taken, returns their
        grade (or None for no grade)
        """
        return self.courses[course][1]

    def wam(self, category: Category = AnyCategory()) -> Optional[float]:
        """
        Calculates the user's WAM by taking the average of the sum of their
        marks, weighted by uoc per course.
        Will return `None` is the user has taken no uoc.
        """
        total_wam, total_uoc = 0, 0
        for course, (uoc, grade) in self.courses.items():
            if grade is not None and category.match_definition(course):
                total_uoc += uoc
                total_wam += uoc * grade

        return None if total_uoc == 0 else total_wam / total_uoc

    def uoc(self, category: Category = AnyCategory()):
        """ Given a user, returns the number of units they have taken for this uoc category """
        return sum(
            uoc
            for course, (uoc, _) in self.courses.items()
            if category.match_definition(course)
        )

    def pop_course(self, course: str) -> Tuple[int, int | None]:
        """
            removes a course from done courses and returns its uoc and mark
        """
        return self.courses.pop(course)
