"""
General purpose utility functions for the server, that do not fit
specifically in any one function
"""

from contextlib import suppress
from typing import Callable, Optional, TypeVar

from fastapi import HTTPException

from algorithms.objects.course import Course
from data.config import ARCHIVED_YEARS
from data.utility import data_helpers
from server.routers.model import CONDITIONS, ProgramTime
from server.db.mongo.conn import archivesDB, coursesCOL

## TODO-OLLI
# - move all utility functions into here
# - maybe split into a folder if it gets too large
# - move all cached constants into a new folder or remove them all together
# - fix pylint for circular imports


COURSES = data_helpers.read_data("data/final_data/coursesProcessed.json")

R = TypeVar('R')  # TODO: might be able to inline this https://typing.readthedocs.io/en/latest/spec/generics.html#variance-inference
def map_suppressed_errors(func: Callable[..., R], errors_log: list[tuple], *args, **kwargs) -> Optional[R]:
    """
    Map a function to a list of arguments, and return the result of the function
    if no error is raised. If an error is raised, log the error and return None.
    """
    try:
        return func(*args, **kwargs)
    except Exception as e:
        errors_log.append((*args, str(e)))
    return None


def get_core_courses(program: str, specialisations: list[str]):
    from server.routers.programs import get_structure

    req = get_structure(program, "+".join(specialisations))
    return sum((
                sum((
                    list(value["courses"].keys())
                    for sub_group, value in spec["content"].items()
                    if 'core' in sub_group.lower()
                ), [])
                for spec_name, spec in req["structure"].items()
                if "Major" in spec_name or "Honours" in spec_name)
         , [])


def get_course_object(code: str, prog_time: ProgramTime, locked_offering: Optional[tuple[int, int]] = None, mark: Optional[int] = 100) -> Course:
    ''' 
    This return the Course object for the given course code.
    Note the difference between this and the get_course_details function
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
    except KeyError as err:
        raise KeyError(f"Course {code} not found (course is most likely discontinued)") from err

def get_course_details(code: str) -> dict:  # TODO: type this output
    '''
    Get info about a course given its courseCode
    - start with the current database
    - if not found, check the archives

    Raises if not found
    '''
    # TODO: make take in a year, and be explicit about getting archived or not

    result = coursesCOL.find_one({"code": code})
    if not result:
        for year in sorted(ARCHIVED_YEARS, reverse=True):
            result = archivesDB[str(year)].find_one({"code": code})
            if result is not None:
                result["is_legacy"] = True  # TODO: is_legacy might not actually mean what it is used for here
                break
    else:
        result["is_legacy"] = False

    # if not result:
    #     return None
    if not result:
        raise HTTPException(
            status_code=400, detail=f"Course code {code} was not found"
        )

    result.setdefault("school", None)
    result.setdefault("raw_requirements", "")

    with suppress(KeyError):
        del result["exclusions"]["leftover_plaintext"]
    del result["_id"]

    return result
