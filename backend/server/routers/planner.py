"""
route for planner algorithms
"""
from typing import Tuple
from fastapi import APIRouter, HTTPException
from algorithms.validate_term_planner import validate_terms
from algorithms.autoplanning import autoplan
from algorithms.objects.user import User
from server.routers.model import (ValidCoursesState, PlannerData, 
                                ValidPlannerData, UserData, ProgramTime)
from server.routers.courses import get_course
from server.routers.utility import get_course_object

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

@router.post("/autoplanning/", 
    response_model=dict,
    responses = {
        400: {"description": "Bad Request e.g. can't create a plan with the given constraints`"},
        200: {
            "description": "Successful Response",
            "content": {
                "plan": [
                    {
                        "T1": [
                            "COMP1511",
                            "MATH1131"
                        ],
                        "T3": [
                            "COMP1521"
                        ]
                    },
                    {
                        "T0": [
                            "COMP2521"
                        ],
                        "T2": [
                            "COMP1531"
                        ],
                        "T1": [
                            "COMP3821",
                            "COMP3891",
                        ]
                    }
                ]
            }
        }
    }
)
def autoplanning(courseCodes: list[str], userData: UserData, programTime: ProgramTime) -> dict:
    user = User(dict(userData))

    try:
        courses = [get_course_object(courseCode, programTime) for courseCode in courseCodes]
        autoplanned = autoplan(courses, user, programTime.startTime, programTime.endTime, programTime.uocMax)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {e}")

    result: dict[str, list[dict]] = {"plan": [ {} for _ in range(programTime.endTime[0] - programTime.startTime[0] + 1)]}

    for course in autoplanned:
        result["plan"][course[1][0] - programTime.startTime[0]].setdefault(f'T{course[1][1]}', []).append(course[0])
    return result
