"""
Contains the Conditions classes
"""

import json
from abc import ABC, abstractmethod

from algorithms.objects.categories import Category, AnyCategory, CompositeCategory
from algorithms.objects.user import User
from algorithms.objects.helper import Logic

# CACHED
CACHED_CONDITIONS_TOKENS_PATH = "./data/final_data/conditionsTokens.json"
with open(CACHED_CONDITIONS_TOKENS_PATH, "r", encoding="utf8") as f:
    CACHED_CONDITIONS_TOKENS = json.load(f)


CACHED_PROGRAM_MAPPINGS_FILE = "./algorithms/cache/programMappings.json"
with open(CACHED_PROGRAM_MAPPINGS_FILE, "r", encoding="utf8") as f:
    CACHED_PROGRAM_MAPPINGS = json.load(f)


class Condition(ABC):
    """
    Superclass for condition subclasses to inherit. Instances of
    `Condition` classes are representations of specific types of
    requirements / conditions from the handbook
    """
    @abstractmethod
    def validate(self, user: User) -> tuple[bool, list[str]]:
        """
        Returns a tuple first containing whether or not the course is
        unlocked, and second any warnings about the course's unlocked state
        - eg that the course needs some wam that the student has not
        entered.
        """
        pass

    @abstractmethod
    def __str__(self) -> str:
        return super().__str__()

    def __repr__(self) -> str:
        return self.__str__()


class CourseCondition(Condition):
    """
    Condition that the student has completed this course before
    the current term
    """

    def __init__(self, course: str):
        self.course = course

    def validate(self, user: User) -> tuple[bool, list[str]]:
        return user.has_taken_course(self.course), []

    def __str__(self) -> str:
        return f"CourseCondition({self.course})"


class CoreqCoursesCondition(Condition):
    """ Condition that the student has completed the course/s in or before the current term """

    def __init__(self, logic: Logic = Logic.AND):
        # An example corequisite is [COMP1511 || COMP1521 || COMP1531]. The user
        # must have taken one of these courses either before or in the current term
        self.courses: list[str] = []
        self.logic: Logic = logic

    def add_course(self, course: str):
        self.courses.append(course)

    def set_logic(self, logic: Logic):
        self.logic = logic

    def validate(self, user: User) -> tuple[bool, list[str]]:
        """ Returns True if the user is taking these courses in the same term """
        match self.logic:
            case Logic.AND:
                return all(
                    user.has_taken_course(course)
                    or user.is_taking_course(course)
                    for course in self.courses
                ), []
            case Logic.OR:
                return any(
                    user.has_taken_course(course)
                    or user.is_taking_course(course)
                    for course in self.courses
                ), []

        print("Conditions Error: validation was not of type AND or OR")
        return True, []

    def __str__(self) -> str:
        return "CoreqCoursesCondition(courses={}, logic={})".format(
            self.courses, self.logic
        )


class UOCCondition(Condition):
    """ UOC conditions such as '24UOC in COMP' """

    def __init__(self, uoc: int):
        self.uoc = uoc

        # The conditional uoc category attached to this object.
        # If there is a cateogry, UOC must be from within this category. E.g.
        # COMPA1 - courses within COMPA1
        # SENG - course codes starting with SENG
        # L4 - level 4 courses
        # L2 MATH - level 2 courses starting with MATH
        # CORE - core courses
        # And more...
        self.category = AnyCategory()

    def set_category(self, category_classobj: Category):
        self.category = category_classobj

    def validate(self, user: User) -> tuple[bool, list[str]]:
        return user.uoc(self.category) >= self.uoc, []

    def __str__(self) -> str:
        return f"{self.uoc}UOC in {self.category}"


class WAMCondition(Condition):
    """ Handles WAM conditions such as 65WAM and 80WAM in """

    def __init__(self, wam: int):
        self.wam = wam

        # The conditional wam category attached to this object.
        # If a category is attached, then the WAM must be from within this category. E.g.
        # 80WAM in COMP
        self.category = AnyCategory()

    def set_category(self, category_classobj: Category):
        """ Set own category to the one given """
        self.category = category_classobj

    def validate(self, user: User) -> tuple[bool, list[str]]:
        """
        Determines if the user has met the WAM condition for this category.

        Will always return True and a warning since WAM can fluctuate
        """
        warning = self.get_warning(user.wam(self.category))
        return True, [warning] if warning else []

    def get_warning(self, applicable_wam: int) -> str:
        """ Returns an appropriate warning message or None if not needed """
        if applicable_wam is None:
            return f"Requires {self.wam} WAM in {self.category}. Your WAM in {self.category} has not been recorded"
        if applicable_wam >= self.wam:
            return None
        return f"Requires {self.wam} WAM in {self.category}. Your WAM in {self.category} is currently {applicable_wam:.3f}"

    def __str__(self) -> str:
        return f"{self.wam}WAM in {self.category}"


class GradeCondition(Condition):
    """ Handles Grade conditions such as 65GRADE and 80GRADE in [A-Z]{4}[0-9]{4} """

    def __init__(self, grade: int):
        self.grade = grade
        self.category = CompositeCategory()

    def set_category(self, category_classobj: Category):
        """ Set own category to the one given """
        self.category = category_classobj

    def validate(self, user: User) -> tuple[bool, list[str]]:
        def _validate_course(course: Category):
            # Grade condition can only be used with ClassCategory
            if type(course) is CompositeCategory:
                validations = [_validate_course(course) for course in self.category.categories]
                unlocked, warnings = list(zip(*validations))
                satisfied = all(unlocked) if course.logic == Logic.AND else any(unlocked)
                return satisfied, warnings

            course = course.class_name
            if course not in user.courses:
                return False, []

            user_grade = user.get_grade(course)
            if user_grade is None:
                return True, [self.get_warning()]
            if user_grade < self.grade:
                return False, []
            return True, []

        if type(self.category) is CompositeCategory:
            validations = [_validate_course(course) for course in self.category.categories]
            logic = self.category.logic
        else:
            validations = [_validate_course(self.category)]
            logic = Logic.AND
        # unzips a zipped list - https://www.geeksforgeeks.org/python-unzip-a-list-of-tuples/
        unlocked, warnings = list(zip(*validations))
        satisfied = all(unlocked) if logic == Logic.AND else any(unlocked)

        return satisfied, sum(warnings, [])  # warnings are flattened


    def get_warning(self) -> str:
        """ Return warning string for grade condition error """
        return f"Requires {self.grade} mark in {self.category}. Your mark has not been recorded"

    def __str__(self) -> str:
        return f"{self.grade}GRADE in {self.category}"


class ProgramCondition(Condition):
    """ Handles Program conditions such as 3707 """

    def __init__(self, program: str):
        self.program = program

    def validate(self, user: User) -> tuple[bool, list[str]]:
        return user.in_program(self.program), []

    def __str__(self) -> str:
        return f"Program {self.program}"


class ProgramTypeCondition(Condition):
    """
    Handles program type conditions, which specify that your program has to
    be some collection of programs.
    for example - be enrolled in Actuarial studies implies that your
    program must be any one of a few programs (actl + double degree codes).
    """

    def __init__(self, programType: str):
        self.programType = programType

    def validate(self, user: User) -> tuple[bool, list[str]]:
        return user.program in CACHED_PROGRAM_MAPPINGS[self.programType], []

    def __str__(self) -> str:
        return f"ProgramTypeCondition: {self.programType}"


class SpecialisationCondition(Condition):
    """ Handles Specialisation conditions such as COMPA1 """

    def __init__(self, specialisation: str):
        self.specialisation = specialisation

    def validate(self, user: User) -> tuple[bool, list[str]]:
        return user.in_specialisation(self.specialisation), []

    def __str__(self) -> str:
        return f"SpecialisationCondition: {self.specialisation}"


class CourseExclusionCondition(Condition):
    """ Handles when you cant take a certain course. Eg Exclusion: MATH1131 for MATH1141"""

    def __init__(self, exclusion: str):
        self.exclusion = exclusion

    def validate(self, user: User) -> tuple[bool, list[str]]:
        return not user.has_taken_course(self.exclusion), []

    def __str__(self) -> str:
        return f"Exclusion: {self.exclusion}"


class ProgramExclusionCondition(Condition):
    """
    Handles when you can't be in a program to take a course, such as
    taking a genEd course in your own faculty
    """

    def __init__(self, exclusion: str):
        self.exclusion = exclusion

    def validate(self, user: User) -> tuple[bool, list[str]]:
        return not user.in_program(self.exclusion), []

    def __str__(self) -> str:
        return f"ProgramExclusionCondition: {self.exclusion}"


class CompositeCondition(Condition):
    """ Handles AND/OR clauses comprised of condition objects. """

    def __init__(self, logic: Logic = Logic.AND):
        self.conditions: list[Condition] = []
        self.logic = logic

    def add_condition(self, condition: Condition):
        """ Adds a condition object """
        self.conditions.append(condition)

    def set_logic(self, logic: Logic):
        """ AND or OR """
        self.logic = logic

    def validate(self, user: User) -> tuple[bool, list[str]]:
        """
        Validate user conditions and return the validated conditions and
        warnings
        """
        if not self.conditions:
            return True, []

        validations = [cond.validate(user) for cond in self.conditions]
        # unzips a zipped list - https://www.geeksforgeeks.org/python-unzip-a-list-of-tuples/
        unlocked, warnings = list(zip(*validations))
        satisfied = all(unlocked) if self.logic == Logic.AND else any(unlocked)

        return satisfied, sum(warnings, [])  # warnings are flattened

    def __str__(self) -> str:
        logic_op = "&&" if self.logic == Logic.AND else "||"
        return f"({f' {logic_op} '.join(str(cond) for cond in self.conditions)})"
