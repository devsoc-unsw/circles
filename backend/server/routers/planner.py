from fastapi import APIRouter
from fastapi.params import Body
from algorithms.objects.user import User
from server.routers.courses import getCourse
from server.routers.model import CoursesState, PlannerData, CONDITIONS


router = APIRouter(
    prefix='/planner',
    tags=['planner'],
    responses={404: {"description": "Not found"}}
)


@router.get("/")
def plannerIndex():
    return "Index of planner"

def fixPlannerData(plannerData: PlannerData):
    for year in plannerData["plan"]:
        for term in year:
            for courseName, course in term.items():
                if type(course) is int:
                    term[courseName] = [getCourse(courseName)["UOC"], course]

@router.post("/validateTermPlanner/", response_model=CoursesState)
async def validateTermPlanner(plannerData: PlannerData = Body(
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
                    "COMP3331": [6, None]
                }
            ],
            [
                {},
                {
                    "COMP1531": [6, None],
                    "COMP6080": [6, None],
                    "COMP3821": [6, None]
                }
            ]
        ]
    }
)):
    """
    Will iteratveily go through the term planner data whilst "building up" the user.
    Starting from 1st year ST, we will create an empty user and evaluate the courses.
    Then we will add ST courses to the user and evaluate T1. Then we will add T1
    courses and evaluate T2. Then add T2 and evaluate T3. Then add T3 and evaluate
    2nd year ST... and so on.

    Returns the state of all the courses on the term planner
    """
    data = fixPlannerData(plannerData.dict())
    emptyUserData = {
        "program": data["program"],
        "specialisations": data["specialisations"],
        "year": 1, # Start off as a first year
        "courses": {} # Start off the user with an empty year
    }
    user = User(emptyUserData)
    # State of courses on the term planner
    coursesState = {} # TODO: possibly push to user class?

    for year in data["plan"]:
        # Go through all the years
        for term in year:
            user.add_current_courses(term)

            for course in term:
                is_answer_accurate = CONDITIONS.get(course) is not None
                unlocked, warnings = CONDITIONS[course].validate(user) if is_answer_accurate else (True, [])
                coursesState[course] = {
                    "is_accurate": is_answer_accurate,
                    "handbook_note": "", # TODO: Cache handbook notes
                    "unlocked": unlocked,
                    "warnings": warnings
                }
            # Add all these courses to the user in preparation for the next term
            user.empty_current_courses()
            user.add_courses(term)

        user.year += 1

    return {"courses_state": coursesState}
