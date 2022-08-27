"""
Contains the Conditions classes
"""

from functools import reduce
import json
from abc import ABC, abstractmethod
from typing import List, Optional, Tuple, TypedDict
import warnings

from algorithms.objects.categories import Category, AnyCategory, ClassCategory, CompositeCategory
from algorithms.objects.user import User
from algorithms.objects.helper import Logic

# CACHED
CACHED_CONDITIONS_TOKENS_PATH = "./data/final_data/conditionsTokens.json"
with open(CACHED_CONDITIONS_TOKENS_PATH, "r", encoding="utf8") as f:
    CACHED_CONDITIONS_TOKENS = json.load(f)


CACHED_PROGRAM_MAPPINGS_FILE = "./algorithms/cache/programMappings.json"
with open(CACHED_PROGRAM_MAPPINGS_FILE, "r", encoding="utf8") as f:
    CACHED_PROGRAM_MAPPINGS = json.load(f)



class CompositeJsonData(TypedDict):
    id: str
    logic: str
    children: list[dict]


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
    def is_path_to(self, course: str) -> bool:
        """ checks if 'course' is able to meet any subtree's requirements"""
        pass

    def beneficial(self, user: User,  course: dict[str, Tuple[int, int | None]]) -> bool:
        """ checks if 'course' is able to meet any *more* subtrees' requirements """
        course_name = list(course.keys())[0]
        if self.validate(user)[0] or user.has_taken_course(course_name):
            return False
        # temp check if the course is useful
        user.add_courses(course)
        answer = self.validate(user)[0]
        user.pop_course(course_name)
        return answer

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

    def is_path_to(self, course: str) -> bool:
        return self.course == course

    def validate(self, user: User) -> tuple[bool, list[str]]:
        return (True, []) if user.has_taken_course(self.course) else (False, [self.course])

    def __str__(self) -> str:
        return json.dumps({
            'id': self.course
        })


class CoreqCoursesCondition(Condition):
    """ Condition that the student has completed the course/s in or before the current term """

    def __init__(self, logic: Logic = Logic.AND):
        # An example corequisite is [COMP1511 || COMP1521 || COMP1531]. The user
        # must have taken one of these courses either before or in the current term
        self.courses: list[str] = []
        self.logic: Logic = logic

    def add_course(self, course: str):
        """ add a course to 'courses' """
        self.courses.append(course)

    def set_logic(self, logic: Logic):
        """ allow logic to be swapped between AND and OR """

        self.logic = logic

    def validate(self, user: User) -> tuple[bool, list[str]]:
        """ Returns True if the user is taking these courses in the same term """
        
        match self.logic:
            case Logic.AND:
                met = all(
                    user.has_taken_course(course)
                    or user.is_taking_course(course)
                    for course in self.courses
                )
                warning = []
                for course in self.courses:
                    if not (user.has_taken_course(course)
                    or user.is_taking_course(course)) :
                        warning.append(course)
                return met, ['(Corequisites: ' + ' AND '.join(warning) + ')']
            case Logic.OR:
                met = any(
                    user.has_taken_course(course)
                    or user.is_taking_course(course)
                    for course in self.courses
                )
                warning = [f'{course}' for course in self.courses]
                return met, ['(Corequisites: ' + ' OR '.join(warning) + ')']
        
        print("Conditions Error: validation was not of type AND or OR")
        return True, []

    def is_path_to(self, course: str) -> bool:
        return course in self.courses

    def beneficial(self, user: User, course: dict[str, Tuple[int, int | None]]) -> bool:
        course_name = list(course.keys())[0]
        if self.validate(user)[0] or user.has_taken_course(course_name) or user.is_taking_course(course_name):
            return False
        return any(c in course.keys() for c in self.courses)

    def __str__(self) -> str:
        logic = "and" if self.logic == Logic.AND else "or"
        return json.dumps({
            'logic': logic,
            'children': [{'id': course} for course in self.courses],
        })

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
        self.category: Category = AnyCategory()

    def is_path_to(self, course: str) -> bool:
        return False

    def set_category(self, category_classobj: Category):
        """ sets a category for UOC that is counted """
        self.category = category_classobj

    def validate(self, user: User) -> tuple[bool, list[str]]:
        uoc_met = user.uoc(self.category) >= self.uoc
        return uoc_met, ([] if uoc_met else [f"{self.uoc} UOC required in {self.category}, you have {user.uoc(self.category)} UOC"])

    def __str__(self) -> str:
        return json.dumps({
            'UOC': self.uoc,
            'category': str(self.category)
        })


class WAMCondition(Condition):
    """ Handles WAM conditions such as 65WAM and 80WAM in """

    def __init__(self, wam: int):
        self.wam = wam

        # The conditional wam category attached to this object.
        # If a category is attached, then the WAM must be from within this category. E.g.
        # 80WAM in COMP
        self.category: Category = AnyCategory()

    def set_category(self, category_classobj: Category):
        """ Set own category to the one given """
        self.category = category_classobj

    def is_path_to(self, course: str) -> bool:
        return False

    def validate(self, user: User) -> tuple[bool, list[str]]:
        """
        Determines if the user has met the WAM condition for this category.

        Will always return False and a warning since WAM can fluctuate
        """
        warning = self.get_warning(user.wam(self.category))
        return True, [warning]

    def get_warning(self, applicable_wam: Optional[float]) -> str:
        """ Returns an appropriate warning message or None if not needed """
        wam_warning = f"Requires {self.wam} WAM in {self.category}. "
        if applicable_wam is None:
            return wam_warning + f"Your WAM in {self.category} has not been recorded"
        if applicable_wam >= self.wam:
            return wam_warning
        return wam_warning + f"Your WAM in {self.category} is currently {applicable_wam:.3f}"

    def __str__(self) -> str:
        return json.dumps({
            'wam': self.wam,
            'category': str(self.category)
        })


class GradeCondition(Condition):
    """ Handles Grade conditions such as 65GRADE and 80GRADE in [A-Z]{4}[0-9]{4} """

    def __init__(self, grade: int):
        self.grade = grade
        self.category: Category = CompositeCategory()

    def set_category(self, category_classobj: Category):
        """ Set own category to the one given """
        self.category = category_classobj

    def is_path_to(self, course: str) -> bool:
        return self.category.match_definition(course)

    def validate(self, user: User) -> tuple[bool, list[str]]:
        def _validate_course(category: Category):
            # Grade condition can only be used with ClassCategory
            if isinstance(category, CompositeCategory):
                validations = [_validate_course(c) for c in category.categories]
                unlocked, warnings = list(zip(*validations))
                satisfied = all(unlocked) if category.logic == Logic.AND else any(unlocked)
                return satisfied, warnings

            elif isinstance(category, ClassCategory):
                course = category.class_name
                if course not in user.courses:
                    return False, [f"Need {self.grade} in {course} for this course"]

                user_grade = user.get_grade(course)
                if user_grade is None:
                    return False, [self.get_warning()]
                if user_grade < self.grade:
                    return False, [f"Your grade {user_grade} in course {course} does not meet the grade requirements (minimum {self.grade}) for this course"]
                return True, []
            else:
                return True, ["We have failed to parse this correctly"]

        if isinstance(self.category, CompositeCategory):
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
        return json.dumps({
            'grade': self.grade,
            'category': str(self.category)
        })


class ProgramCondition(Condition):
    """ Handles Program conditions such as 3707 """

    def __init__(self, program: str):
        self.program = program

    def is_path_to(self, course: str) -> bool:
        return False

    def validate(self, user: User) -> tuple[bool, list[str]]:
        return user.in_program(self.program), []

    def __str__(self) -> str:
        return json.dumps({
            'program': self.program,
        })


class ProgramTypeCondition(Condition):
    """
    Handles program type conditions, which specify that your program has to
    be some collection of programs.
    for example - be enrolled in Actuarial studies implies that your
    program must be any one of a few programs (actl + double degree codes).
    """

    def __init__(self, programType: str):
        self.programType = programType

    def is_path_to(self, course: str) -> bool:
        return False

    def validate(self, user: User) -> tuple[bool, list[str]]:
        return user.program in CACHED_PROGRAM_MAPPINGS[self.programType], []

    def __str__(self) -> str:
        return json.dumps({
            'programType': self.programType,
        })


class SpecialisationCondition(Condition):
    """ Handles Specialisation conditions such as COMPA1 """

    def __init__(self, specialisation: str):
        self.specialisation = specialisation

    def validate(self, user: User) -> tuple[bool, list[str]]:
        return user.in_specialisation(self.specialisation), []

    def is_path_to(self, course: str) -> bool:
        return False

    def __str__(self) -> str:
        return json.dumps({
            'specialisation': self.specialisation,
        })


class CourseExclusionCondition(Condition):
    """ Handles when you cant take a certain course. Eg Exclusion: MATH1131 for MATH1141"""

    def __init__(self, exclusion: str):
        self.exclusion = exclusion

    def validate(self, user: User) -> tuple[bool, list[str]]:

        is_valid = not user.has_taken_specific_course(self.exclusion)
        return is_valid, ([] if is_valid else [f"Exclusion: {self.exclusion}"])

    def is_path_to(self, course: str) -> bool:
        return False
        
    def __str__(self) -> str:
        return json.dumps({
            'exclusion': self.exclusion,
        })


class ProgramExclusionCondition(Condition):
    """
    Handles when you can't be in a program to take a course, such as
    taking a genEd course in your own faculty
    """

    def __init__(self, exclusion: str):
        self.exclusion = exclusion

    def validate(self, user: User) -> tuple[bool, list[str]]:
        excluded = not user.in_program(self.exclusion)
        return (excluded, []) if excluded else (excluded, ["This course cannot be taken in your program"])

    def is_path_to(self, course: str) -> bool:
        return False

    def __str__(self) -> str:
        return json.dumps({
            'programExclusion': self.exclusion,
        })


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
        wam_warning = []
        unlocked, all_warnings = list(zip(*validations))
        for unlocked_cond, warning in validations:
            if unlocked_cond and len(warning) > 0:
                wam_warning.append(warning)

        if self.logic == Logic.AND:
            satisfied = all(unlocked) 
            return satisfied, (flatten_list_list(wam_warning) if satisfied else ['(' + ' AND '.join(sum(all_warnings,[])) + ')'])  # warnings are flattened
        else:
            satisfied = any(unlocked)     
            return satisfied, (flatten_list_list(wam_warning) if satisfied else ['(' + ' OR '.join(sum(all_warnings,[])) + ')'])

    def is_path_to(self, course: str) -> bool:
        return any(condition.is_path_to(course) for condition in self.conditions)

    def beneficial(self, user: User, course: dict[str, Tuple[int, int | None]]) -> bool:
        course_name = list(course.keys())[0]
        if self.validate(user)[0] or user.has_taken_course(course_name):
            return False
        return any(condition.beneficial(user, course) for condition in self.conditions)

    def __str__(self, id='start') -> str:
        data: CompositeJsonData = {
            'logic': "and" if self.logic == Logic.AND else "or",
            'id': id,
            'children': []
        }

        for index, cond in enumerate(self.conditions):
            if id == 'start':
                child_index = 'root'
            elif id == 'root':
                child_index = f'subtree.{index}'
            else:
                child_index = f'{id}.{index}'
            if isinstance(cond, CompositeCondition):
                data['children'].append(json.loads(cond.__str__(child_index)))
            else:
                data['children'].append(json.loads(str(cond)))
        return json.dumps(data)

def flatten_list_list(nested_list: List[List[str]]) -> List[str]:
    """ Takes a List[List[str]] object and flattens it down into a single list """
    return reduce(lambda x, y: x + y, nested_list)
    

