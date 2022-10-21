"""
route for planner algorithms
"""
from typing import Tuple
from fastapi import APIRouter, HTTPException
from server.routers.utility import get_course
from algorithms.validate_term_planner import validate_terms
from algorithms.autoplanning import autoplan
from algorithms.objects.user import User
from algorithms.objects.course import Course
from server.routers.model import (ValidCoursesState, PlannerData, ValidPlannerData, 
                                CourseCodes, UserData, ProgramTime)

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
        program=plannerData.program,
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

@router.get("/autoplanning/", response_model=PlannerData)
def autoplanning(courseCodes: CourseCodes, userData: UserData, programTime: ProgramTime):
    result = {"program": userData.program, "specialisations": list(userData.specialisations.keys()), "plan": [], "mostRecentPastTerm": {"Y": 0, "T": 0}}
    courses = [get_course(courseCode) for courseCode in courseCodes.courses]
    user = User(dict(userData))
    try:
        autoplanned = autoplan(courses, user, programTime.startTime, programTime.endTime, programTime.uocMax)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {e}")
    
    for year in range(programTime.startTime[0], programTime.endTime[0] + 1):
        result["plan"].append([])
        for term in range(0, 4):
            result["plan"][year - programTime.startTime[0]].append({})
            for course in autoplanned:
                print(course)
                if course[1][0] == year and course[1][1] == term:
                    result["plan"][year - programTime.startTime[0]][term][course[0]] = [get_course(course[0]).uoc , None]
    return result