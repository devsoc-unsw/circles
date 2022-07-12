"""
route for planner algorithms
"""
from fastapi import APIRouter
from fastapi.params import Body
from algorithms.objects.user import User
from server.routers.courses import get_course
from server.routers.model import ValidCoursesState, PlannerData, CONDITIONS, CACHED_HANDBOOK_NOTE

def fix_planner_data(plannerData: PlannerData):
    """ fixes the planner data to add missing UOC info """
    for year_index, year in enumerate(plannerData["plan"]):
        for term_index, term in enumerate(year):
            for courseName, course in term.items():
                if not isinstance(course, list):
                    plannerData["plan"][year_index][term_index][courseName] = [get_course(courseName)["UOC"], course]
    return plannerData

router = APIRouter(
    prefix="/planner", tags=["planner"], responses={404: {"description": "Not found"}}
)


@router.get("/")
def planner_index():
    """ sanity test that this file is loaded """
    return "Index of planner"

@router.post("/validateTermPlanner/", response_model=ValidCoursesState)
async def validate_term_planner(
    plannerData: PlannerData = Body(
        ...,
        example={
            "program": "3707",
            "specialisations": ["COMPA1"],
            "year": 1,
            "plan": [
                [
                    {},
                    {
                        "COMP1511": [6, None],
                        "MATH1141": [6, None],
                        "MATH1081": [6, None],
                    },
                    {
                        "COMP1521": [6, None],
                        "COMP9444": [6, None],
                    },
                    {
                        "COMP2521": [6, None],
                        "MATH1241": [6, None],
                        "COMP3331": [6, None],
                    },
                ],
                [
                    {},
                    {
                        "COMP1531": [6, None],
                        "COMP6080": [6, None],
                        "COMP3821": [6, None],
                    },
                ],
            ],
            "mostRecentPastTerm": {
                "Y": 1,
                "T": 0,
            },
        },
    )
):
    """
    Will iteratively go through the term planner data whilst
    iteratively filling the user with courses.

    The mostRecentPastTerm will show the latest term (and current year) that has
    passed and all warnings will be suppressed until after this term

    Returns the state of all the courses on the term planner
    """
    data = fix_planner_data(plannerData.dict())
    emptyUserData = {
        "program": data["program"],
        "specialisations": data["specialisations"],
        "year": 1,  # Start off as a first year
        "courses": {},  # Start off the user with an empty year
    }
    user = User(emptyUserData)
    # State of courses on the term planner
    coursesState = {}  # TODO: possibly push to user class?

    currYear = data["mostRecentPastTerm"]["Y"]
    pastTerm = data["mostRecentPastTerm"]["T"]

    for yearIndex, year in enumerate(data["plan"]):
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
