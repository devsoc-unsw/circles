"""
General purpose utility functions for the server, that do not fit
specifically in any one function
"""


from typing import Any, Callable, List
from algorithms.objects.course import Course
from data.utility import data_helpers
from server.routers.model import CONDITIONS

COURSES = data_helpers.read_data("data/final_data/coursesProcessed.json")

def map_suppressed_errors(func: Callable, errors_log: List[Any], *args, **kwargs) -> Any:
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


def get_course(code: str) -> Course:
    """ TODO: get proper Course """
    return Course(
        code,
        CONDITIONS[code],
        100,
        COURSES[code]["UOC"],
        {2020: [1, 2, 3], 2021: [1, 2, 3], 2022: [1, 2, 3]},
    )
