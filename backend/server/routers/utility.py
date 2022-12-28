"""
General purpose utility functions for the server, that do not fit
specifically in any one function
"""


from typing import Callable
from algorithms.objects.course import Course
from data.utility import data_helpers
from server.routers.model import CONDITIONS, ProgramTime, PlannerData
from typing import TypeVar
from algorithms.objects.user import User

COURSES = data_helpers.read_data("data/final_data/coursesProcessed.json")

B = TypeVar('B')
def map_suppressed_errors(func: Callable[..., B], errors_log: list[tuple], *args, **kwargs) -> B | None:
    """
    Map a function to a list of arguments, and return the result of the function
    if no error is raised. If an error is raised, log the error and return None.
    """
    try:
        return func(*args, **kwargs)
    except Exception as e:
        errors_log.append((*args, e))
    return None

def get_core_courses(program: str, specialisations: list[str]):
    from server.routers.programs import get_structure

    req = get_structure(program, "+".join(specialisations))
    return sum(
            (
                sum((
                    list(value["courses"].keys())
                    for sub_group, value in spec["content"].items()
                    if 'core' in sub_group.lower()
                ), [])
            for spec_name, spec in req["structure"].items()
            if "Major" in spec_name or "Honours" in spec_name)
         , [])


def get_course_object(code: str, prog_time: ProgramTime, locked_offering: tuple[int, int] | None = None, mark: int | None = 100) -> Course:
    ''' 
    This return the Course object for the given course code.
    Note the difference between this and the get_course function in courses.py
    '''
    if mark is None:
        mark = 100
    from server.routers.courses import terms_offered
    years = "+".join(str(year) for year in range(prog_time.startTime[0], prog_time.endTime[0] + 1))
    terms_result = terms_offered(code, years)["terms"]
    terms_possible = {}
    for year, terms in terms_result.items():
        terms_possible[int(year)] = [int(term[1]) for term in terms]

    try:
        return Course(
            code,
            CONDITIONS[code],
            mark,
            COURSES[code]["UOC"],
            terms_possible,
            locked_offering
        )
    except KeyError:
        raise Exception(f"Course {code} not found (most likely course is discontinuation)")

def extract_user_from_planner_data(plannerData: PlannerData) -> User:
    """
    Extracts a user object from the plannerData
    """
    user = User()
    user.program = plannerData.program
    user.specialisations = plannerData.specialisations
    for _, year in enumerate(list(plannerData.plan)):
        for term in year:
            cleaned_term = {}
            for course_name, course_value in term.items():
                cleaned_term[course_name] = (course_value[0], course_value[1]) if course_value else (COURSES[course_name]["UOC"], None)
            user.add_courses(cleaned_term)
    return user
