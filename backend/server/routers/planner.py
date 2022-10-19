"""
route for planner algorithms
"""
from typing import Tuple
from fastapi import APIRouter
from algorithms.validate_term_planner import validate_terms
from server.routers.courses import get_course
from server.routers.model import ValidCoursesState, ValidPlannerData, PlannerData, CONDITIONS, CACHED_HANDBOOK_NOTE
from math import lcm

MIN_COMPLETED_COURSE_UOC = 6

def fix_planner_data(plannerData: PlannerData) -> ValidPlannerData:
    """ fixes the planner data to add missing UOC info """
    plan: list[list[dict[str, Tuple[int, int | None]]]] = []
    for year_index, year in enumerate(plannerData.plan):
        plan.append([])
        for term_index, term in enumerate(year):
            plan[year_index].append({})
            for courseName, course in term.items():
                if not isinstance(course, list):
                    plan[year_index][term_index][courseName] = (get_course(courseName)["UOC"], course)
                elif course[0] is not None:
                    plan[year_index][term_index][courseName] = (course[0], course[1])
    return ValidPlannerData(
        programCode=plannerData.programCode,
        specialisations=plannerData.specialisations,
        plan=plan,
        mostRecentPastTerm=plannerData.mostRecentPastTerm
    )

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
    coursesState = validate_terms(data)

    return {"courses_state": coursesState}

from server.database import usersDB, coursesCOL
from server.config import DUMMY_TOKEN
from server.routers.model import CourseDetails, PlannerLocalStorage, ElliotMoveCourseInfo, ElliotGetTermsData

# from model import CourseDetails, PlannerLocalStorage, ElliotMoveCourseInfo, ElliotGetTermsData

# NOTE: Not worrying about index atm. That can be a frontend thing :)

def addToUnplanned(courseCode: str):
    course = coursesCOL.find_one({'code': courseCode})
    planner = get_planner()
    planner.unplanned.append(courseCode)

def setUnPlannedCourseToTerm(destRow: int, destTerm: str, destIndex: int, courseName: str):
    course: CourseDetails = coursesCOL.find_one({'code': courseName})
    planner: PlannerLocalStorage = get_planner()
    # remove from unplanned
    planner.unplanned.remove(courseName)

    if course.is_multiterm:
        uoc, terms = course.UOC, course.terms
        termsList = getTermsList(destTerm, uoc, terms, planner.isSummerEnabled)

        for termRow in termsList:
            term, rowOffset = termRow
            index = planner.years[destRow + rowOffset][term].insert(index, courseName)
    else:
        planner.years[destRow][destTerm].insert(destIndex, courseName)


def setPlannedCourseToTerm(srcRow, srcTerm, srcIndex, destRow, destTerm, destIndex, courseCode):
    course: CourseDetails = coursesCOL.find_one({'code': courseCode})
    planner: PlannerLocalStorage = get_planner()

    uoc, termsOffered, isMultiterm = course.UOC, course.terms, course.is_multiterm

    srcTermList = []

    # If only changing index of multiterm course, don'T change other course instances
    if isMultiterm and srcRow == destRow and srcTerm == destTerm:
        planner.years[srcRow][srcTerm].remove(courseCode)
        planner.years[srcRow][srcTerm].insert(destIndex, courseCode)
        return

    # Remove every instance of the course from the planner
    previousIndex = {}
    for year in range(len(planner.years)):
        terms = planner.years[year]
        # term = 'T1', 'T2', 'T3', etc
        for term in terms:
            targetTerm: list = planner.years[year][term]
            try:
                courseIndex = targetTerm.index(courseCode)
            except ValueError:
                courseIndex = None
            
            if courseIndex:
                previousIndex[f'{year}{term}'] = courseIndex
                targetTerm.remove(courseIndex)
                srcTermList.append(term)

    instanceNum = srcTermList.index(srcTerm)
    newTerms = getTermsList(destTerm, uoc, termsOffered, planner.isSummerEnabled, instanceNum) if isMultiterm else []
    newTerms.pop(instanceNum)
    firstTerm = planner.years[destRow][destTerm]
    dropIndex = destIndex

    # Place dragged multiterm instance into correct index
    if isMultiterm and f'{destRow}{destTerm}' in previousIndex:
        currIndex = previousIndex[f'{destRow}{destTerm}']
        if currIndex < destIndex:
            dropIndex -= 1

        firstTerm.insert(dropIndex, courseCode)
        for termRowOffset in newTerms:
            term, rowOffset = termRowOffset
            targetTerm = planner.years[destRow + rowOffset][term]
            termId = f'{destRow + rowOffset}{term}'
            index = previousIndex[termId] if termId in previousIndex else len(targetTerm)
            targetTerm.insert(index, courseCode)


from pprint import pprint
from server.routers.user import get_user

@router.get("/elliot")
def elliot():
    print("IN ELLIOT!")

    course = get_course("COMP1511")
    pprint(course)

    pprint(usersDB.get_collection('tokens'))
    usersDB.
    # user = get_user(DUMMY_TOKEN)
    # pprint(user)

# @router.get("/elliot", response_model=ElliotMoveCourseInfo)
# def moveCourse(data: ElliotMoveCourseInfo):
#     courseName, destTerm, srcTerm = data.courseName, data.destTerm, data.srcTerm
#     # destTerm = 2020T1
#     course: CourseDetails = coursesCOL.find_one({'code': courseName})

#     newPlannedFor = [destTerm]
#     planner: PlannerLocalStorage = get_planner()
#     if course.is_multiterm:
#         year = int(srcTerm[:4]) # year = 2020
#         startTerm = srcTerm[4:] # startTerm = T1
#         uoc, termsOffered = course.UOC, course.terms
#         # e.g. startTerm == T2

#         plannedFor = getPlannedFor(planner, courseName)

#         instanceNum = plannedFor.index(startTerm) if plannedFor else 0

#         terms: list(ElliotGetTermsData) = getTermsList(startTerm, uoc, termsOffered, planner.isSummerEnabled, instanceNum)

#         maxRowOffset = terms[len(terms) - 1].rowOffset
#         if year + maxRowOffset > planner.startYear + planner.numYears:
#             pass
#             # multiterm course going off the edge

#         # Moving course (move every instance of multiterm courses)
#         startTerm = destTerm[:4]
#         instanceNum = plannedFor.index(startTerm) if plannedFor else 0

#         terms.pop(instanceNum)

#         for termRow in terms:
#             term, rowOffset = termRow.term, termRow.rowOffset
#             year = int(destTerm[:4] + rowOffset)
#             newPlannedFor.append(f'{year}{term}')

#     newPlannedFor.sort()
#     # update plannedFor (not used)

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
    allTerms = ['T1', 'T2', 'T3']
    termsList = []
    if isSummerEnabled:
        allTerms.insert(0, 'T0')

    terms = list(set(allTerms) & set(termsOffered))

    index = terms.index(currentTerm) - 1
    rowOffset = 0

    numTerms = lcm(uoc, MIN_COMPLETED_COURSE_UOC)

    for _ in range(instanceNum):
        if index < 0:
            index = terms.length - 1
            rowOffset -= 1
        
        terms.insert(0, {
            'term': terms[(index + len(terms) % 3)],
            'rowOffset': rowOffset
        })

        index -= 1

    for _ in range(instanceNum, numTerms):
        if index == len(terms):
            index = 0
            rowOffset += 1

        termsList.append({
            'term': terms[index],
            'rowOffset': rowOffset
        })

        index += 1

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
    

