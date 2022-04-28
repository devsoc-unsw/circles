from fastapi import APIRouter
from fastapi.params import Body
from algorithms.objects.user import User
from server.routers.courses import getCourse
from server.routers.model import CoursesState, PlannerData, CONDITIONS, CACHED_HANDBOOK_NOTE


router = APIRouter(
    prefix="/planner", tags=["planner"], responses={404: {"description": "Not found"}}
)


@router.get("/")
def plannerIndex():
    return "Index of planner"

def fixPlannerData(plannerData: PlannerData):
    for year_index, year in enumerate(plannerData["plan"]):
        for term_index, term in enumerate(year):
            for courseName, course in term.items():
                if type(course) is not list:
                    plannerData["plan"][year_index][term_index][courseName] = [getCourse(courseName)["UOC"], course]
    return plannerData

@router.post("/validateTermPlanner/", response_model=CoursesState)
async def validateTermPlanner(
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
    Will iteratively go through the term planner data whilst "building up" the user.
    Starting from 1st year T0, we will create an empty user and evaluate the courses.
    Then we will add T0 courses to the user and evaluate T1. Then we will add T1
    courses and evaluate T2. Then add T2 and evaluate T3. Then add T3 and evaluate
    2nd year T0... and so on.

    The mostRecentPastTerm will show the latest term (and current year) that has 
    passed and all warnings will be suppressed until after this term

    Returns the state of all the courses on the term planner
    """
    data = fixPlannerData(plannerData.dict())
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
            inPast =  yearIndex + 1 < currYear or (yearIndex + 1 == currYear and termIndex <= pastTerm)
            
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
                    "unlocked": unlocked if not inPast else True,
                    "warnings": warnings if not inPast else [],
                }
            # Add all these courses to the user in preparation for the next term
            user.empty_current_courses()
            user.add_courses(term)

        user.year += 1

    return {"courses_state": coursesState}
