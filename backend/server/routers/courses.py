import re
from fastapi import APIRouter, HTTPException
from server.database import coursesCOL, archivesDB
from algorithms.objects.user import User
from server.routers.model import *
from itertools import chain

router = APIRouter(
    prefix='/courses',
    tags=['courses'],
)

@router.get("/")
def apiIndex():
    return "Index of courses"

def fixUserData(userData: dict):
    """
        dates and returns the userData with the UOC of a course
    """
    coursesWithoutUoc = [course for course in userData["courses"] if type(userData["courses"][course]) is int]
    filledInCourses = {course : [getCourse(course)["UOC"], userData["courses"][course]] for course in coursesWithoutUoc}
    userData["courses"].update(filledInCourses)
    return userData

@router.get("/getCourse/{courseCode}", response_model=courseDetails,
            responses={
                400: {"model": message, "description": "The given course code could not be found in the database"},
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
                                "equivalents": {
                                    "DPST1091": 1,
                                    "COMP1917": 1
                                },
                                "exclusions": {
                                    "DPST1091": 1
                                },
                                "path_to": {
                                    "COMP1521": 1,
                                    "COMP1531": 1,
                                    "COMP2041": 1,
                                    "COMP2111": 1,
                                    "COMP2121": 1,
                                    "COMP2521": 1,
                                    "COMP9334": 1,
                                    "ELEC2117": 1,
                                    "SENG2991": 1
                                },
                                "terms": [
                                    "T1",
                                    "T2",
                                    "T3"
                                ],
                                "raw_requirements" : "",
                                "gen_ed": 1,
                                "path_from": {}
                            }
                        }
                    }
                }
            })
def getCourse(courseCode: str):
    '''get info about a course given courseCode'''
    result = coursesCOL.find_one({'code' : courseCode})
    if not result:
        raise HTTPException(status_code=400, detail=f"Course code {courseCode} was not found")
    result.setdefault("school", None)
    del result['_id']

    return result

@router.get("/searchCourse/{string}")
def search(string):
    ''' Search for courses with regex 
    e.g. search(COMP1) would return 
        { “COMP1511” :  “Programming Fundamentals”,
          “COMP1521” : “Computer Systems Fundamentals”, 
          “COMP1531”: “SoftEng Fundamentals, 
            ……. } 
    '''
    pat = re.compile(r'{}'.format(string), re.I)
    code_query = coursesCOL.find({'code': {'$regex': pat}})
    title_query = coursesCOL.find({'title': {'$regex': pat}})

    return { course['code']: course['title'] for course in chain(code_query, title_query) }

@router.post("/getAllUnlocked/", response_model=CoursesState,
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
                                    "warnings": []
                                }
                            }
                        }
                    }
                }
            })
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
        # Condition object exists for this course
        result, warnings = condition.validate(user) if condition else (True, [])
        coursesState[course] = {
            "is_accurate": bool(condition),
            "unlocked": result,
            "handbook_note": CACHED_HANDBOOK_NOTE.get(course, ""),
            "warnings": warnings
        }

    return {'courses_state': coursesState}

@router.get("/getLegacyCourses/{year}/{term}", response_model=programCourses,
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
                                    "ACTL3142": "Actuarial Data and Analysis"
                                }
                            }
                        }
                    }
                }
            })
def getLegacyCourses(year, term):
    """
        gets all the courses that were offered in that term for that year
    """
    result = {c['code']: c['title'] for c in archivesDB[year].find() if term in c['terms']} 

    if result == {}:
        raise HTTPException(status_code=400, detail=f"Invalid term or year. Valid terms: ST, T1, T2, T3. Valid years: 2019, 2020, 2021, 2022.")

    return {'courses' : result}

@router.post("/unselectCourse/", response_model=AffectedCourses,
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
def unselectCourse(userData: UserData, lockedCourses: list, unselectedCourse: str):
    """
        Creates a new user class and returns all the courses
        affected from the course that was unselected in sorted order
    """
    affectedCourses = User(fixUserData(userData.dict())).unselect_course(unselectedCourse, lockedCourses)

    return {'affected_courses': affectedCourses}

@router.post("/coursesUnlockedWhenTaken/{courseToBeTaken}", response_model=CoursesUnlockedWhenTaken,
            responses={
                400: {"model": message, "description": "Uh oh you broke me"},
                200: {
                    "description": "Returns all courses which are unlocked when this course is taken",
                    "content": {
                        "application/json": {
                            "example": {
                                "courses_unlocked_when_taken": ["COMP2511, COMP3311"]
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

    return {'courses_unlocked_when_taken' : sorted(list(courses_now_unlocked - courses_initially_unlocked))}

def unlocked_set(courses_state):
    '''fetch the set of unlocked courses from the courses_state of a getAllUnlocked call'''
    return set(course for course in courses_state if courses_state[course]['unlocked'])
