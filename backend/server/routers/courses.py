"""
APIs for the /courses/ route.
"""
import re
from typing import Dict, List, Set, Tuple

from algorithms.objects.user import User
from data.config import ARCHIVED_YEARS
from data.utility.data_helpers import read_data
from fastapi import APIRouter, HTTPException
from fuzzywuzzy import fuzz # type: ignore
from server.database import archivesDB, coursesCOL
from server.routers.model import (CACHED_HANDBOOK_NOTE, CONDITIONS, CourseCodes,
                                  CourseDetails, CoursesState, CoursesPath,
                                  CoursesUnlockedWhenTaken, ProgramCourses,
                                  UserData)


router = APIRouter(
    prefix="/courses",
    tags=["courses"],
)

# TODO: would prefer to initialise ALL_COURSES here but that fails on CI for some reason
ALL_COURSES: Dict[str, str] | None = None
CODE_MAPPING: Dict = read_data("data/utility/programCodeMappings.json")["title_to_code"]

def fetch_all_courses() -> Dict[str, str]:
    """
    Returns a dictionary of all courses as a key-val pair with:
        key: course code
        value: course_title
    """
    courses = {}
    for course in coursesCOL.find():
        courses[course["code"]] = course["title"]

    for year in sorted(ARCHIVED_YEARS, reverse=True):
        for course in archivesDB[str(year)].find():
            if course["code"] not in courses:
                courses[course["code"]] = course["title"]

    return courses


def fix_user_data(userData: dict):
    """ Updates and returns the userData with the UOC of a course """
    coursesWithoutUoc = [
        course
        for course in userData["courses"]
        if not isinstance(userData["courses"][course], list)
    ]
    filledInCourses = {
        course: [get_course(course)["UOC"], userData["courses"][course]]
        for course in coursesWithoutUoc
    }
    userData["courses"].update(filledInCourses)
    return userData


@router.get("/")
def api_index() -> str:
    """ Returns the index of the courses API """
    return "Index of courses"


@router.get(
    "/getCourse/{courseCode}",
    response_model=CourseDetails,
    responses={
        400: {
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
                        "terms": ["T1", "T2", "T3"],
                        "raw_requirements": "",
                        "gen_ed": 1,
                    }
                }
            },
        },
    },
)
def get_course(courseCode: str) -> Dict:
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
def search(userData: UserData, search_string: str) -> Dict[str, str]:
    """
    Search for courses with regex
    e.g. search(COMP1) would return
        { "COMP1511" :  "Programming Fundamentals",
          "COMP1521" : "Computer Systems Fundamentals",
          "COMP1531": "SoftEng Fundamentals",
            ……. }
    """
    global ALL_COURSES
    from server.routers.programs import get_structure

    if ALL_COURSES is None:
        ALL_COURSES = fetch_all_courses()

    specialisations = list(userData.specialisations.keys())
    majors = list(filter(lambda x: x.endswith("1") or x.endswith("H"), specialisations))
    minors = list(filter(lambda x: x.endswith("2"), specialisations))
    structure = get_structure(userData.program, "+".join(specialisations))['structure']

    top_results = sorted(ALL_COURSES.items(), reverse=True,
                         key=lambda course: fuzzy_match(course, search_string)
                         )[:100]
    weighted_results = sorted(top_results, reverse=True,
                              key=lambda course: weight_course(course,
                                                               search_string,
                                                               structure, 
                                                               majors,
                                                               minors)
                              )[:30]

    return dict(weighted_results)

def regex_search(search_string: str) -> dict[str, str]:
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
        400: {"description": "Uh oh you broke me"},
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
def get_all_unlocked(userData: UserData) -> Dict[str, Dict]:
    """
    Given the userData and a list of locked courses, returns the state of all
    the courses. Note that locked courses always return as True with no warnings
    since it doesn't make sense for us to tell the user they can't take a course
    that they have already completed
    """

    coursesState = {}
    user = User(fix_user_data(userData.dict())) if not isinstance(userData, User) else userData
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
        400: {"description": "Year or Term input is incorrect"},
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
def get_legacy_courses(year, term) -> Dict[str, Dict[str, str]]:
    """
    Gets all the courses that were offered in that term for that year
    """
    result = {c['code']: c['title'] for c in archivesDB[year].find() if term in c['terms']}

    if not result:
        raise HTTPException(status_code=400, detail="Invalid term or year. Valid terms: T0, T1, T2, T3. Valid years: 2019, 2020, 2021, 2022.")

    return {'courses' : result}


@router.get("/getLegacyCourse/{year}/{courseCode}")
def get_legacy_course(year, courseCode):
    """
        Like /getCourse/ but for legacy courses in the given year.
        Returns information relating to the given course
    """
    result = archivesDB[str(year)].find_one({"code": courseCode})
    if not result:
        raise HTTPException(status_code=400, detail="invalid course code or year")
    del result["_id"]
    result["is_legacy"] = True
    return result


@router.post("/unselectCourse/{unselectedCourse}", response_model=CourseCodes,
            responses={
                400: {"description": "Uh oh you broke me"},
                200: {
                    "description": "Returns the state of all the courses",
                    "content": {
                        "application/json": {
                            "example": {
                                 "courses": [
                                     "COMP1521",
                                     "COMP1531",
                                     "COMP3121"
                                 ]
                             }
                         }
                     }
                 }
            })
def unselect_course(userData: UserData, unselectedCourse: str) -> List[str]:
    """
    Creates a new user class and returns all the courses
    affected from the course that was unselected in alphabetically sorted order
    """
    user = User(fix_user_data(userData.dict()))
    if not user.has_taken_course(unselectedCourse):
        return { 'courses' : [] }

    affected_courses = []
    # Brute force loop through all taken courses and if we find a course which is
    # no longer unlocked, we unselect it, add it to the affected course list,
    # then restart loop.
    courses_to_delete = [unselectedCourse]
    while courses_to_delete:
        affected_courses.extend(courses_to_delete)
        for course in courses_to_delete:
            if user.has_taken_course(course):
                user.pop_course(course)

        courses_to_delete = [
            c
            for c in user.get_courses()
            if CONDITIONS.get(c) is not None  # course is in conditions
            and not (CONDITIONS[c].validate(user))[0]  # not unlocked anymore
        ]

    return { 'courses' : list(sorted(affected_courses)) }


@router.get("/courseChildren/{course}", response_model=CoursesPath,
            responses = {
                200 : {
                    "courses": ["COMP1521", "COMP1531"]
                }
            })
def course_children(course: str):
    """
    fetches courses which are dependant on taking 'course'
    eg 1511 -> 1521, 1531, 2521 etc
    """
    if not CONDITIONS.get(course):
        raise HTTPException(400, f"no course by name {course}")
    return {
            "original" : course,
            "courses": [
                coursename for coursename, condition in CONDITIONS.items()
                if condition is not None and condition.is_path_to(course)
            ]
        }

@router.get("/getPathFrom/{course}", response_model=CoursesPath,
            responses = {
                200 : {
                    "courses": ["COMP1521", "COMP1531"]
                }
            })
def get_path_from(course: str) -> Dict[str, str | Dict[str, List[str]]]:
    """
    fetches courses which can be used to satisfy 'course'
    eg 2521 -> 1511
    """
    course_condition = CONDITIONS.get(course)
    if not course_condition:
        raise HTTPException(400, f"no course by name {course}")
    return {
        "original" : course,
        "courses" :[
            coursename for coursename, _ in CONDITIONS.items()
            if course_condition.is_path_to(coursename)
        ]
    }


@router.post("/coursesUnlockedWhenTaken/{courseToBeTaken}", response_model=CoursesUnlockedWhenTaken,
            responses={
                400: { "description": "Uh oh you broke me" },
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
def courses_unlocked_when_taken(userData: UserData, courseToBeTaken: str) -> Dict[str, List[str]]:
    """ Returns all courses which are unlocked when given course is taken """
    # define the user object with user data
    user = User(fix_user_data(userData.dict()))

    ## initial state
    courses_initially_unlocked: set = unlocked_set(get_all_unlocked(user)['courses_state'])
    ## add course to the user
    user.add_courses({courseToBeTaken: [get_course(courseToBeTaken)['UOC'], None]})
    ## final state
    courses_now_unlocked: set = unlocked_set(get_all_unlocked(user)['courses_state'])
    new_courses: set = courses_now_unlocked - courses_initially_unlocked

    ## Differentiate direct and indirect unlocks
    path_to: set = set(course_children(courseToBeTaken)["courses"])
    direct_unlock: set  = new_courses.intersection(path_to)
    indirect_unlock: set= new_courses - direct_unlock

    return {
        'direct_unlock': sorted(list(direct_unlock)),
        'indirect_unlock': sorted(list(indirect_unlock))
    }

def unlocked_set(courses_state) -> Set[str]:
    """ Fetch the set of unlocked courses from the courses_state of a getAllUnlocked call """
    return set(course for course in courses_state if courses_state[course]['unlocked'])


def fuzzy_match(course: Tuple[str, str], search_term: str) -> float:
    """ Gives the course a weighting based on the relevance to the search """
    code, title = course

    # either match against a course code, or match many words against the title
    # (not necessarily in the same order as the title)
    search_term = search_term.lower()
    if re.match('[a-z]{4}[0-9]', search_term):
        return fuzz.ratio(code.lower(), search_term) * 10

    return max(fuzz.ratio(code.lower(), search_term),
               sum(fuzz.partial_ratio(title.lower(), word)
                       for word in search_term.split(' ')))

def weight_course(course: tuple, search_term: str, structure: dict,
                  majors: list, minors: list) -> float:
    """ Gives the course a weighting based on the relevance to the user's degree """
    weight = fuzzy_match(course, search_term)
    code, _ = course

    for structKey in structure.keys():
        if "Major" not in structKey:
            continue
        for key in structure[structKey].items():
            if isinstance(key[1], dict):
                for c in key[1].get("courses", {}):
                    if code in c:
                        if re.match("core|prescribed", key[0], flags=re.IGNORECASE):
                            weight += 40
                        else:
                            weight += 20
                        break

    for major_code in majors:
        if str(code).startswith(major_code[:4]):
            weight += 14
            break

    for structKey in structure.keys():
        if "Minor" not in structKey:
            continue
        for key in structure[structKey].items():
            if isinstance(key[1], dict):
                for c in key[1].get("courses", {}):
                    if code in c:
                        if re.match("core|prescribed", key[0], flags=re.IGNORECASE):
                            weight += 20
                        else:
                            weight += 10
                        break

    for minor_code in minors:
        if str(code).startswith(minor_code[:4]):
            weight += 7
            break

    return weight
