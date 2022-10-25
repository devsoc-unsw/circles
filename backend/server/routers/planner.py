"""
route for planner algorithms
"""
from typing import Tuple
from algorithms.validate_term_planner import validate_terms
from fastapi import APIRouter, HTTPException
from server.routers.courses import get_course
from server.routers.model import ValidCoursesState, ValidPlannerData, PlannerData, CourseCode, UnPlannedToTerm, PlannedToTerm, CONDITIONS, CACHED_HANDBOOK_NOTE
from math import lcm
from server.routers.user import get_user, set_user
from server.config import DUMMY_TOKEN
from operator import itemgetter

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


@router.post("/addToUnplanned")
def addToUnplanned(courseCode: CourseCode, token: str = DUMMY_TOKEN):
    # Add course to unplanned column
    user = get_user(token)
    user['planner']['unplanned'].append(courseCode.courseCode)
    set_user(token, user, True)


@router.post("/unPlannedToTerm")
def setUnPlannedCourseToTerm(d: UnPlannedToTerm, token: str = DUMMY_TOKEN):
    course = get_course(d.courseCode)
    uoc, terms = itemgetter('UOC', 'terms')(course)
    user = get_user(token)
    planner = user['planner']
    instanceNum = 0
    termsList = getTermsList(d.destTerm, uoc, terms, planner['isSummerEnabled'], instanceNum)

    # If moving a multiterm course out of bounds
    if course['is_multiterm'] and isCourseOutOfBounds(planner['numYears'], d.destRow, termsList):
        raise HTTPException(status_code=400, detail=f'{d.courseCode} would extend outside of the term planner. Either drag it to a different term, or extend the planner first')

    planner['unplanned'].remove(d.courseCode)

    # If multiterm add multiple instances of course
    if course['is_multiterm']:
        termsList.pop(instanceNum)
        planner['years'][d.destRow][d.destTerm].insert(d.destIndex, d.courseCode)
        for termRow in termsList:
            term, rowOffset = itemgetter('term', 'rowOffset')(termRow)
            index = len(planner['years'][d.destRow + rowOffset][term])
            planner['years'][d.destRow + rowOffset][term].insert(index, d.courseCode)
    else:
        planner['years'][d.destRow][d.destTerm].insert(d.destIndex, d.courseCode)
    set_user(token, user, True)


@router.post("/plannedToTerm")
def setPlannedCourseToTerm(d: PlannedToTerm, token: str = DUMMY_TOKEN):
    course = get_course(d.courseCode)
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
        for term in terms:
            targetTerm: list = planner['years'][year][term]
            try:
                courseIndex = targetTerm.index(d.courseCode)
            except ValueError:
                courseIndex = None
            if courseIndex is not None:
                previousIndex[f'{year}{term}'] = courseIndex
                targetTerm.remove(d.courseCode)
                srcTermList.append(term)

    instanceNum = srcTermList.index(d.srcTerm)
    newTerms = getTermsList(d.destTerm, uoc, termsOffered, planner['isSummerEnabled'], instanceNum) if isMultiterm else []

    # If multiterm course and out of bounds, raise exception without updating database
    if isMultiterm and isCourseOutOfBounds(planner['numYears'], d.destRow, newTerms):
        raise HTTPException(status_code=400, detail=f'{d.courseCode} would extend outside of the term planner. Either drag it to a different term, or extend the planner first')
    elif isMultiterm:
        newTerms.pop(instanceNum)

    firstTerm = planner['years'][d.destRow][d.destTerm]
    dropIndex = d.destIndex

    # If dragged multiterm course to a column it already exists in
    if isMultiterm and f'{d.destRow}{d.destIndex}' in previousIndex:
        currIndex = previousIndex[f'{d.destRow}{d.destIndex}']
        if currIndex < d.destIndex:
            dropIndex -= 1

    # Move every instance of course
    firstTerm.insert(dropIndex, d.courseCode)
    for termRowOffset in newTerms:
        term, rowOffset = itemgetter('term', 'rowOffset')(termRowOffset)
        targetTerm = planner['years'][d.destRow + rowOffset][term]
        termId = f'{d.destRow + rowOffset}{term}'
        index = previousIndex[termId] if termId in previousIndex else len(targetTerm)
        targetTerm.insert(index, d.courseCode)
    set_user(token, user, True)


@router.post('/removeCourse')
def removeCourse(d: CourseCode, token: str = DUMMY_TOKEN):
    user = get_user(token)
    planner = user['planner']

    # remove course from years (if it's there)
    for year in planner['years']:
        for _, courseList in year.items():
            if d.courseCode in courseList:
                courseList.remove(d.courseCode)

    # remove course from unplanned (if it's there)
    if d.courseCode in planner['unplanned']:
        planner['unplanned'].remove(d.courseCode)
    set_user(token, user, True)


@router.post("/removeAll")
def removeAllCourses(token: str = DUMMY_TOKEN):
    user = get_user(token)
    
    # Replace each year with an empty year
    user['planner']['years'] = generate_empty_years(user['planner']['numYears'])

    # Clear unplanned column
    user['planner']['unplanned'] = []
    set_user(token, user, True)


@router.post("/unscheduleCourse")
def unschedule(d: CourseCode, token: str = DUMMY_TOKEN):
    user = get_user(token)
    planner = user['planner']
    course = get_course(d.courseCode)

    removed = set()
    # Remove every instance of the course from each year
    for year in planner['years']:
        for courseList in year.values():
            if d.courseCode in courseList:
                courseList.remove(d.courseCode)
                removed.add(d.courseCode)

    # Add the course to unplanned
    for course in removed:
        planner['unplanned'].append(course)
    set_user(token, user, True)


@router.post('/unscheduleAll')
def unscheduleAll(token: str = DUMMY_TOKEN):
    user = get_user(token)
    removed = set()

    # Remove every course from each year
    for year in user['planner']['years']:
        for term, courseList in year.items():
            removed = removed | set(courseList)
            year[term] = []

    # Add every removed course to unplanned column
    for course in removed:
        user['planner']['unplanned'].append(course)
    set_user(token, user, True)

def generate_empty_years(nYears: int):
    return [{'T0': [], 'T1': [], 'T2': [], 'T3': []} for _ in range(nYears)]

def getTermsList(currentTerm: str, uoc: int, termsOffered: list[str], isSummerEnabled: bool, instanceNum: int):
    allTerms = ['T1', 'T2', 'T3']
    termsList = []
    if isSummerEnabled:
        allTerms.insert(0, 'T0')

    # Remove any unavailable terms
    terms = sorted(list(set(allTerms) & set(termsOffered)))
    index = terms.index(currentTerm) - 1
    rowOffset = 0

    numTerms = lcm(uoc, MIN_COMPLETED_COURSE_UOC) // uoc

    for _ in range(instanceNum):
        if index < 0:
            index = len(terms) - 1
            rowOffset -= 1
        
        termsList.insert(0, {
            'term': terms[(index + len(terms) % 3)],
            'rowOffset': rowOffset
        })

        index -= 1

    rowOffset = 0
    index = terms.index(currentTerm)

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


def isCourseOutOfBounds(numYears, destRow, terms):
    max_rowoffset = max(terms, key= lambda x: x['rowOffset'])['rowOffset']
    min_rowoffset = min(terms, key= lambda x: x['rowOffset'])['rowOffset']

    return destRow + min_rowoffset < 0 or destRow + max_rowoffset > numYears - 1

