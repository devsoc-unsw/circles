import pymongo
import re
from fuzzywuzzy import fuzz
from typing import Optional

from algorithms.objects.user import User
from data.config import ARCHIVED_YEARS
from data.utility.data_helpers import read_data
from fastapi import APIRouter, HTTPException
from server.database import archivesDB, coursesCOL
from server.routers.model import (CACHED_HANDBOOK_NOTE, CONDITIONS, AffectedCourses,
                                  CourseDetails, CoursesState,
                                  CoursesUnlockedWhenTaken, ProgramCourses, Structure,
                                  UserData, message)

"""
APIs for the /courses/ route.
"""

router = APIRouter(
    prefix="/courses",
    tags=["courses"],
)

# TODO: would prefer to initialise ALL_COURSES here but that fails on CI for some reason
ALL_COURSES = None
CODE_MAPPING = read_data("data/utility/programCodeMappings.json")["title_to_code"]

def fetch_all_courses():
    courses = {}
    for course in coursesCOL.find():
        courses[course["code"]] = course["title"]

    for year in sorted(ARCHIVED_YEARS, reverse=True):
        for course in archivesDB[str(year)].find():
            if course["code"] not in courses:
                courses[course["code"]] = course["title"]

    return courses


def fixUserData(userData: dict):
    """ Updates and returns the userData with the UOC of a course """
    coursesWithoutUoc = [
        course
        for course in userData["courses"]
        if not isinstance(userData["courses"][course], list)
    ]
    filledInCourses = {
        course: [getCourse(course)["UOC"], userData["courses"][course]]
        for course in coursesWithoutUoc
    }
    userData["courses"].update(filledInCourses)
    return userData


@router.get("/")
def apiIndex():
    """ Returns the index of the courses API """
    return "Index of courses"


@router.get(
    "/getCourse/{courseCode}",
    response_model=CourseDetails,
    responses={
        400: {
            "model": message,
            "description": "The given course code could not be found in the database",
        },
        200: {
            "description": "Returns all course details to given code",
            "content": {
                "application/json": {
                    "example": {
                        "title": "Programming Fundamentals",
                        "code": "COMP1511",
                        "UOC": 6,
                        "level": 1,
                        "description": """An introduction to problem-solving via programming, which aims to have students develop
                                    proficiency in using a high level programming language. Topics: algorithms, program structures
                                    (statements, sequence, selection, iteration, functions), data types (numeric, character), data structures
                                    (arrays, tuples, pointers, lists), storage structures (memory, addresses), introduction to analysis of
                                    algorithms, testing, code quality, teamwork, and reflective practice. The course includes extensive practical
                                    work in labs and programming projects.</p>\n<p>Additional Information</p>\n<p>This course should be taken by
                                    all CSE majors, and any other students who have an interest in computing or who wish to be extended.
                                    It does not require any prior computing knowledge or experience.</p>\n
                                    <p>COMP1511 leads on to COMP1521, COMP1531, COMP2511 and COMP2521, which form the core of the study of
                                    computing at UNSW and which are pre-requisites for the full range of further computing courses.</p>\n<p>Due to
                                    overlapping material, students who complete COMP1511 may not also enrol in COMP1911 or COMP1921. </p>""",
                        "study_level": "Undergraduate",
                        "school": "School of Computer Science and Engineering",
                        "faculty": "Faculty of Engineering",
                        "campus": "Sydney",
                        "equivalents": {"DPST1091": 1, "COMP1917": 1},
                        "exclusions": {"DPST1091": 1},
                        "path_to": {
                            "COMP1521": 1,
                            "COMP1531": 1,
                            "COMP2041": 1,
                            "COMP2111": 1,
                            "COMP2121": 1,
                            "COMP2521": 1,
                            "COMP9334": 1,
                            "ELEC2117": 1,
                            "SENG2991": 1,
                        },
                        "terms": ["T1", "T2", "T3"],
                        "raw_requirements": "",
                        "gen_ed": 1,
                        "path_from": {},
                    }
                }
            },
        },
    },
)
def getCourse(courseCode: str):
    """
    Get info about a course given its courseCode
    - start with the current database
    - if not found, check the archives
    """
    result = coursesCOL.find_one({"code": courseCode})

    if not result:
        for year in sorted(ARCHIVED_YEARS, reverse=True):
            result = archivesDB[str(year)].find_one({"code": courseCode})
            if result is not None:
                result.setdefault("raw_requirements", "")
                result["is_legacy"] = True
                break
    else:
        result["is_legacy"] = False

    if not result:
        raise HTTPException(
            status_code=400, detail=f"Course code {courseCode} was not found"
        )
    result.setdefault("school", None)
    result['is_accurate'] = CONDITIONS.get(courseCode) is not None
    result['handbook_note'] = CACHED_HANDBOOK_NOTE.get(courseCode, "")
    del result["_id"]

    return result


@router.post(
    "/searchCourse/{search_string}",
    responses={
        200: {
            "description": "Returns a list of the most relevant courses to a search term",
            "content": {
                "application/json": {
                    "example": {
                            "ACCT1511": "Accounting and Financial Management 1B",
                            "ACCT2542": "Corporate Financial Reporting and Analysis",
                            "ACCT3202": "Industry Placement 2",
                            "ACCT3303": "Industry Placement 3",
                            "ACCT3610": "Business Analysis and Valuation",
                            "ACCT4797": "Thesis (Accounting) B",
                            "ACCT4809": "Current Developments in Auditing Research",
                            "ACCT4852": "Current Developments in Accounting Research - Managerial",
                            "ACCT4897": "Seminar in Research Methodology",
                            "ACTL1101": "Introduction to Actuarial Studies",
                            "ACTL2101": "Industry Placement 1",
                            "ACTL2102": "Foundations of Actuarial Models",
                            "ACTL3142": "Actuarial Data and Analysis",
                    }
                }
            }
        }
    },
)
def search(userData: UserData, search_string: str):
    """
    Search for courses with regex
    e.g. search(COMP1) would return
        { “COMP1511” :  “Programming Fundamentals”,
          “COMP1521” : “Computer Systems Fundamentals”,
          “COMP1531”: “SoftEng Fundamentals,
            ……. }
    """
    global ALL_COURSES
    from server.routers.programs import getStructure

    if ALL_COURSES is None:
        ALL_COURSES = fetch_all_courses()

    # TODO: can you have a minor without a major selected?
    #       will wreak havoc on the argument order with *specialisations
    #       currently this is enforced during setup but will need to
    #       make sure that this is true for all degrees not just comp sci
    specialisations = list(userData.specialisations.keys())
    structure = getStructure(userData.program, *specialisations)['structure']

    top_results = sorted(ALL_COURSES.items(), reverse=True,
                         key=lambda course: fuzzy_match(course, search_string)
                         )[:100]
    weighted_results = sorted(top_results, reverse=True,
                              key=lambda course: weight_course(course,
                                                               search_string,
                                                               structure, 
                                                               *specialisations)
                              )[:30]

    return {code: title for code, title in weighted_results}

def regex_search(search_string: str):
    """ 
    Uses the search string as a regex to match all courses with an exact pattern.
    """

    pat = re.compile(search_string, re.I)
    courses = list(coursesCOL.find({"code": {"$regex": pat}}))

    # TODO: do we want to always include matching legacy courses (excluding duplicates)?
    if not courses:
        for year in sorted(ARCHIVED_YEARS, reverse=True):
            courses = list(archivesDB[str(year)].find({"code": {"$regex": pat}}))
            if courses:
                break

    return {course["code"]: course["title"] for course in courses}


@router.post(
    "/getAllUnlocked/",
    response_model=CoursesState,
    responses={
        400: {"model": message, "description": "Uh oh you broke me"},
        200: {
            "description": "Returns the state of all the courses",
            "content": {
                "application/json": {
                    "example": {
                        "COMP9302": {
                            "is_accurate": True,
                            "unlocked": True,
                            "handbook_note": "This course can only be taken in the final term of your program.",
                            "warnings": [],
                        }
                    }
                }
            },
        },
    },
)
def getAllUnlocked(userData: UserData):
    """
    Given the userData and a list of locked courses, returns the state of all
    the courses. Note that locked courses always return as True with no warnings
    since it doesn't make sense for us to tell the user they can't take a course
    that they have already completed
    """

    coursesState = {}
    user = User(fixUserData(userData.dict())) if type(userData) != User else userData
    for course, condition in CONDITIONS.items():
        result, warnings = condition.validate(user) if condition is not None else (True, [])
        if result:
            coursesState[course] = {
                "is_accurate": condition is not None,
                "unlocked": result,
                "handbook_note": CACHED_HANDBOOK_NOTE.get(course, ""),
                "warnings": warnings,
            }

    return {"courses_state": coursesState}


@router.get(
    "/getLegacyCourses/{year}/{term}",
    response_model=ProgramCourses,
    responses={
        400: {"model": message, "description": "Year or Term input is incorrect"},
        200: {
            "description": "Returns the program structure",
            "content": {
                "application/json": {
                    "example": {
                        "courses": {
                            "ACCT1511": "Accounting and Financial Management 1B",
                            "ACCT2542": "Corporate Financial Reporting and Analysis",
                            "ACCT3202": "Industry Placement 2",
                            "ACCT3303": "Industry Placement 3",
                            "ACCT3610": "Business Analysis and Valuation",
                            "ACCT4797": "Thesis (Accounting) B",
                            "ACCT4809": "Current Developments in Auditing Research",
                            "ACCT4852": "Current Developments in Accounting Research - Managerial",
                            "ACCT4897": "Seminar in Research Methodology",
                            "ACTL1101": "Introduction to Actuarial Studies",
                            "ACTL2101": "Industry Placement 1",
                            "ACTL2102": "Foundations of Actuarial Models",
                            "ACTL3142": "Actuarial Data and Analysis",
                        }
                    }
                }
            },
        },
    },
)
def getLegacyCourses(year, term):
    """
    Gets all the courses that were offered in that term for that year
    """
    result = {c['code']: c['title'] for c in archivesDB[year].find() if term in c['terms']}

    if result == {}:
        raise HTTPException(status_code=400, detail="Invalid term or year. Valid terms: T0, T1, T2, T3. Valid years: 2019, 2020, 2021, 2022.")

    return {'courses' : result}


@router.get("/getLegacyCourse/{year}/{courseCode}")
def getLegacyCourse(year, courseCode):
    """
        Like /getCourse/ but for legacy courses in the given year.
        Returns information relating to the given course
    """
    result = list(archivesDB[str(year)].find({"code": courseCode}))
    if result == {}:
        raise HTTPException(status_code=400, detail="invalid course code or year")
    del result["_id"]
    result["is_legacy"] = True
    return result


@router.post("/unselectCourse/{unselectedCourse}", response_model=AffectedCourses,
            responses={
                422: {"model": message, "description": "Unselected course query is required"},
                400: {"model": message, "description": "Uh oh you broke me"},
                200: {
                    "description": "Returns the state of all the courses",
                    "content": {
                        "application/json": {
                            "example": {
                                 "affected_courses": [
                                     "COMP1521",
                                     "COMP1531",
                                     "COMP3121"
                                 ]
                             }
                         }
                     }
                 }
            })
def unselectCourse(userData: UserData, unselectedCourse: str):
    """
    Creates a new user class and returns all the courses
    affected from the course that was unselected in sorted order
    """
    affectedCourses = User(fixUserData(userData.dict())).unselect_course(unselectedCourse)

    return {'affected_courses': affectedCourses}


@router.post("/coursesUnlockedWhenTaken/{courseToBeTaken}", response_model=CoursesUnlockedWhenTaken,
            responses={
                400: {"model": message, "description": "Uh oh you broke me"},
                200: {
                    "description": "Returns all courses which are unlocked when this course is taken",
                    "content": {
                        "application/json": {
                            "example": {
                                "direct_unlock": ["COMP2511", "COMP3311"],
                                "indirect_unlock": []
                            }
                        }
                    }
                }
            })
def coursesUnlockedWhenTaken(userData: UserData, courseToBeTaken: str):
    """ Returns all courses which are unlocked when given course is taken """
    # define the user object with user data
    user = User(fixUserData(userData.dict()))

    ## initial state
    courses_initially_unlocked = unlocked_set(getAllUnlocked(user)['courses_state'])
    ## add course to the user
    user.add_courses({courseToBeTaken: [getCourse(courseToBeTaken)['UOC'], None]})
    ## final state
    courses_now_unlocked = unlocked_set(getAllUnlocked(user)['courses_state'])
    new_courses = courses_now_unlocked - courses_initially_unlocked

    ## Differentiate direct and indirect unlocks
    path_to = set(getCourse(courseToBeTaken)['path_to'])
    direct_unlock = new_courses.intersection(path_to)
    indirect_unlock = new_courses - direct_unlock

    return {
        'direct_unlock': sorted(list(direct_unlock)),
        'indirect_unlock': sorted(list(indirect_unlock))
    }

def unlocked_set(courses_state):
    """ Fetch the set of unlocked courses from the courses_state of a getAllUnlocked call """
    return set(course for course in courses_state if courses_state[course]['unlocked'])


def fuzzy_match(course: tuple, search_term: str):
    """ Gives the course a weighting based on the relevance to the search """
    (code, title) = course

    # either match against a course code, or match many words against the title
    # (not necessarily in the same order as the title)
    search_term = search_term.lower()
    if re.match('[a-z]{4}[0-9]', search_term):
        return fuzz.ratio(code.lower(), search_term)

    return max(fuzz.ratio(code.lower(), search_term),
               sum(fuzz.partial_ratio(title.lower(), word)
                       for word in search_term.split(' ')))

def weight_course(course: tuple, search_term: str, structure: dict,
                  major_code: Optional[str] = None, minor_code: Optional[str] = None):
    """ Gives the course a weighting based on the relevance to the user's degree """
    weight = fuzzy_match(course, search_term)
    (code, title) = course

    if major_code is not None:
        for key in structure['Major'].items():
            if isinstance(key[1], dict):
                if key[1].get(code) is not None:
                    weight += 20
                    break

        if str(code).startswith(major_code[:4]):
            weight += 14

    if minor_code is not None:
        for key in structure['Minor'].items():
            if isinstance(key[1], dict):
                if key[1].get(code) is not None:
                    weight += 10
                    break

        if str(code).startswith(minor_code[:4]):
            weight += 7

    return weight
