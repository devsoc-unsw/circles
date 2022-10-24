"""
route for planner algorithms
"""
from fastapi import APIRouter
from algorithms.objects.user import User
# from server.routers.model import ElliotMoveCourseInfo, ElliotTermEnum
from server.routers.courses import get_course
from server.routers.model import ValidCoursesState, PlannerData, CONDITIONS, CACHED_HANDBOOK_NOTE
from server.routers.utility import get_core_courses
from math import lcm
# from server.database import coursesCOL

MIN_COMPLETED_COURSE_UOC = 6

def fix_planner_data(plannerData: PlannerData):
    """ fixes the planner data to add missing UOC info """
    for year_index, year in enumerate(plannerData.plan):
        for term_index, term in enumerate(year):
            for courseName, course in term.items():
                if not isinstance(course, list):
                    plannerData.plan[year_index][term_index][courseName] = [get_course(courseName)["UOC"], course]
    return plannerData

router = APIRouter(
    prefix="/planner", tags=["planner"], responses={404: {"description": "Not found"}}
)


@router.get("/")
def planner_index() -> str:
    """ sanity test that this file is loaded """
    return "Index of planner"

@router.post("/validateTermPlanner/", response_model=ValidCoursesState)
def validate_term_planner(plannerData: PlannerData):
    """
    Will iteratively go through the term planner data whilst
    iteratively filling the user with courses.

    The mostRecentPastTerm will show the latest term (and current year) that has
    passed and all warnings will be suppressed until after this term

    Returns the state of all the courses on the term planner
    """
    data = fix_planner_data(plannerData)
    emptyUserData = {
        "program": data.programCode,
        "specialisations": data.specialisations,
        "year": 1,  # Start off as a first year
        "courses": {},  # Start off the user with an empty year
        "core_courses": get_core_courses(data.programCode, data.specialisations),
    }
    user = User(emptyUserData)
    # State of courses on the term planner
    coursesState = {}

    currYear = data.mostRecentPastTerm["Y"]
    pastTerm = data.mostRecentPastTerm["T"]

    for yearIndex, year in enumerate(data.plan):
        # Go through all the years
        for termIndex, term in enumerate(year):
            user.add_current_courses(term)

            for course in term:
                is_answer_accurate = CONDITIONS.get(course) is not None
                unlocked, warnings = (
                    CONDITIONS[course].validate(user)
                    if is_answer_accurate
                    else (True, [])
                )
                coursesState[course] = {
                    "is_accurate": is_answer_accurate,
                    "handbook_note": CACHED_HANDBOOK_NOTE.get(course, ""),
                    "unlocked": unlocked,
                    "warnings": warnings,
                    "supressed": yearIndex + 1 < currYear or (yearIndex + 1 == currYear and termIndex <= pastTerm)
                }
            # Add all these courses to the user in preparation for the next term
            user.empty_current_courses()
            user.add_courses(term)

        user.year += 1

    return {"courses_state": coursesState}

from server.database import usersDB, coursesCOL
from server.config import DUMMY_TOKEN
from server.routers.model import CourseDetails, PlannerLocalStorage, ElliotMoveCourseInfo, ElliotGetTermsData, Storage
from pydantic import BaseModel
# from model import CourseDetails, PlannerLocalStorage, ElliotMoveCourseInfo, ElliotGetTermsData

from pprint import pprint
from server.routers.user import get_user, set_user
import requests
import json
from operator import itemgetter
from server.tests.user.utility import clear
PATH = "server/example_input/example_local_storage_data.json"

with open(PATH, encoding="utf8") as f:
    DATA = json.load(f)

def print_user():
    x = requests.get(f'http://127.0.0.1:8000/user/data/{DUMMY_TOKEN}')
    pprint(json.loads(x.text))

@router.get("/elliot")
def elliot():
    clear()
    requests.post('http://127.0.0.1:8000/user/saveLocalStorage', json=DATA["empty_year"])
    a = {'courseCode': 'COMP1511'}
    requests.post('http://127.0.0.1:8000/planner/addToUnplanned', json=a)
    a['courseCode'] = 'ENGG2600'
    requests.post('http://127.0.0.1:8000/planner/addToUnplanned', json=a)
    requests.get(f'http://127.0.0.1:8000/user/data/{DUMMY_TOKEN}')

    data = {
        'destRow': 0,
        'destTerm': 'T3',
        'destIndex': 0,
        'courseCode': 'COMP1511'
    }
    requests.post('http://127.0.0.1:8000/planner/unPlannedToTerm', json=data)
    data = {
        'destRow': 0,
        'destTerm': 'T1',
        'destIndex': 0,
        'courseCode': 'ENGG2600'
    }
    requests.post('http://127.0.0.1:8000/planner/unPlannedToTerm', json=data)

    move = {
        'srcRow': 0,
        'srcTerm': 'T3',
        'destRow': 1,
        'destTerm': 'T1',
        'destIndex': 1,
        'courseCode': 'ENGG2600'
    }
    requests.post('http://127.0.0.1:8000/planner/plannedToTerm', json=move)
    print_user()

class AddToUnplanned(BaseModel):
    courseCode: str

class UnPlannedToTerm(BaseModel):
    destRow: int
    destTerm: str
    destIndex: int
    courseCode: str

class PlannedToTerm(BaseModel):
    srcRow: int
    srcTerm: str
    destRow: int
    destTerm: str
    destIndex: int
    courseCode: str

@router.post("/addToUnplanned")
def addToUnplanned(courseCode: AddToUnplanned, token: str = DUMMY_TOKEN):
    user = get_user(token)
    user['planner']['unplanned'].append(courseCode.courseCode)
    set_user(token, user, True)

@router.post("/unPlannedToTerm")
def setUnPlannedCourseToTerm(d: UnPlannedToTerm, token: str = DUMMY_TOKEN):
    course = coursesCOL.find_one({'code': d.courseCode})
    user = get_user(token)
    planner = user['planner']

    # print(d.destTerm)
    planner['unplanned'].remove(d.courseCode)
    instanceNum = 0

    if course['is_multiterm']:
        uoc, terms = itemgetter('UOC', 'terms')(course)
        termsList = getTermsList(d.destTerm, uoc, terms, planner['isSummerEnabled'], instanceNum)
        termsList.pop(instanceNum)
        planner['years'][d.destRow][d.destTerm].insert(d.destIndex, d.courseCode)
        # pprint(termsList)
        for termRow in termsList:
            term, rowOffset = itemgetter('term', 'rowOffset')(termRow)
            index = len(planner['years'][d.destRow + rowOffset][term])
            planner['years'][d.destRow + rowOffset][term].insert(index, d.courseCode)
    else:
        planner['years'][d.destRow][d.destTerm].insert(d.destIndex, d.courseCode)
    set_user(token, user, True)

@router.post("/plannedToTerm")
def setPlannedCourseToTerm(d: PlannedToTerm, token: str = DUMMY_TOKEN):
    course: CourseDetails = coursesCOL.find_one({'code': d.courseCode})
    user = get_user(token)
    planner = user['planner']

    uoc, termsOffered, isMultiterm = itemgetter('UOC', 'terms', 'is_multiterm')(course)

    srcTermList = []

    # If only changing index of multiterm course, don't change other course instances
    if isMultiterm and d.srcRow == d.destRow and d.srcTerm == d.destTerm:
        planner.years[d.srcRow][d.srcTerm].remove(d.courseCode)
        planner.years[d.srcRow][d.srcTerm].insert(d.destIndex, d.courseCode)
        set_user(token, user, True)
        return

    # Remove every instance of the course from the planner
    previousIndex = {}
    for year in range(len(planner['years'])):
        terms = planner['years'][year]
        # term = 'T1', 'T2', 'T3', etc
        for term in terms:
            targetTerm: list = planner['years'][year][term]
            try:
                courseIndex = targetTerm.index(d.courseCode)
            except ValueError:
                courseIndex = None
            # print(courseIndex)
            if courseIndex is not None:
                previousIndex[f'{year}{term}'] = courseIndex
                targetTerm.remove(d.courseCode)
                srcTermList.append(term)
                # print('wot')

    # pprint(previousIndex)
    # pprint(srcTermList)
    instanceNum = srcTermList.index(d.srcTerm) # 0
    newTerms = getTermsList(d.destTerm, uoc, termsOffered, planner['isSummerEnabled'], instanceNum) if isMultiterm else []
    pprint(newTerms)
    if isMultiterm:
        newTerms.pop(instanceNum)
    # for x in newTerms:
    #     print(x)
    firstTerm = planner['years'][d.destRow][d.destTerm]
    dropIndex = d.destIndex

    # Place dragged multiterm instance into correct index
    if isMultiterm and f'{d.destRow}{d.destTerm}' in previousIndex:
        currIndex = previousIndex[f'{d.destRow}{d.destTerm}']
        if currIndex < d.destIndex:
            dropIndex -= 1

        firstTerm.insert(dropIndex, d.courseCode)
        for termRowOffset in newTerms:
            term, rowOffset = itemgetter('term', 'rowOffset')(termRowOffset)
            targetTerm = planner['years'][d.destRow + rowOffset][term]
            termId = f'{d.destRow + rowOffset}{term}'
            index = previousIndex[termId] if termId in previousIndex else len(targetTerm)
            targetTerm.insert(index, d.courseCode)
    else:
        planner['years'][d.destRow][d.destTerm].insert(d.destIndex, d.courseCode)
    set_user(token, user, True)


def removeCourse(courseName):
    planner = get_planner()
    # remove course from years
    for year in planner.years:
        for _, courseList in year.items():
            if courseName in courseList:
                courseList.remove(courseName)
        # for courseList in year.__dict__.values():
        #     if courseName in courseList:
        #         courseList.remove(courseName)

    # remove course from unplanned
    if courseName in planner.unplanned:
        planner.unplanned.remove(courseName)

def removeAllCourses():
    planner = get_planner()
    planner.years = generate_empty_years(planner.numYears)
    planner.unplanned = []


def unschedule(code):
    planner = get_planner()
    removed = set()
    for year in planner.years:
        for courseList in year.__dict__.values():
            if code in courseList:
                courseList.remove(code)
                removed.add(code)

    for course in removed:
        planner.unplanned.append(course)


    #! plannerSlice.ts has code that I can't replicate
    # state.courses[code].plannedFor = null;
    # state.courses[code].isUnlocked = true;
    # state.courses[code].warnings = [];
    # state.courses[code].handbookNote = '';
    # state.courses[code].isAccurate = true;

def unscheduleAll():
    planner = get_planner()
    removed = set()
    for year in planner.years:
        for term, courseList in year.__dict__.items():
            removed = removed | set(courseList)
            year[term] = []
    for course in removed:
        planner.unplanned.append(course)




def generate_empty_years(nYears: int):
    return [{'T0': [], 'T1': [], 'T2': [], 'T3': []} for _ in range(nYears)]

def getTermsList(currentTerm: str, uoc: int, termsOffered: list[str], isSummerEnabled: bool, instanceNum: int):
    # print("SUYMMER", isSummerEnabled)
    # print("offered", termsOffered)
    allTerms = ['T1', 'T2', 'T3']
    termsList = []
    if isSummerEnabled:
        allTerms.insert(0, 'T0')
    # print(allTerms)
    terms = sorted(list(set(allTerms) & set(termsOffered)))
    index = terms.index(currentTerm) - 1
    rowOffset = 0

    numTerms = lcm(uoc, MIN_COMPLETED_COURSE_UOC) // uoc
    # print("beans",numTerms)

    for _ in range(instanceNum):
        # print('wto')
        if index < 0:
            index = len(terms) - 1
            rowOffset -= 1
        
        termsList.insert(0, {
            'term': terms[(index + len(terms) % 3)],
            'rowOffset': rowOffset
        })

        index -= 1
    # pprint(termsList)
    rowOffset = 0
    index = terms.index(currentTerm)

    for _ in range(instanceNum, numTerms):
        if index == len(terms):
            index = 0
            rowOffset += 1

        # print(index, terms[index], rowOffset)
        termsList.append({
            'term': terms[index],
            'rowOffset': rowOffset
        })
        # print(terms[index], rowOffset)

        index += 1
    # pprint(termsList)
    return termsList

def get_planner():
    pass

def getPlannedFor(planner: PlannerLocalStorage, courseName: str):
    plannedFor = []
    for year in planner.years:
        for term, courses in year.__dict__.items():
            if courseName in courses:
                plannedFor.append(term)
    return plannedFor

def checkCourseOutofBounds(course, planner, destTerm):
    plannedFor = getPlannedFor(planner, course.code)
    termCode = destTerm[4:]
    instanceNum = plannedFor.index(termCode)

    termList = getTermsList(destTerm, course.uoc, course.terms, planner.isSummerEnabled, instanceNum)
    

