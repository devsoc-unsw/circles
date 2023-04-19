from itertools import chain
from typing import cast

import pydantic
from bson.objectid import ObjectId
from data.config import LIVE_YEAR
from fastapi import APIRouter
from server.config import DUMMY_TOKEN
from server.routers.model import CourseMark, CoursesStorage, DegreeLocalStorage, LocalStorage, PlannerLocalStorage, Storage
from server.database import usersDB

pydantic.json.ENCODERS_BY_TYPE[ObjectId] = str

router = APIRouter(
    prefix="/user",
    tags=["user"],
)

# keep this private


def set_user(token: str, item: Storage, overwrite: bool = False):
    data = usersDB['tokens'].find_one({'token': token})
    if data:
        if not overwrite:
            return
        objectID = data['objectId']
        usersDB['users'].update_one(
            {'_id': ObjectId(objectID)}, {'$set': item})
    else:
        objectID = usersDB['users'].insert_one(dict(item)).inserted_id
        usersDB['tokens'].insert_one({'token': token, 'objectId': objectID})


# Ideally not used often.
@router.post("/saveLocalStorage/")
def save_local_storage(localStorage: LocalStorage, token: str = DUMMY_TOKEN):
    # TODO: turn giving no token into an error
    planned: list[str] = sum((sum(year.values(), [])
                             for year in localStorage.planner['years']), [])
    unplanned: list[str] = localStorage.planner['unplanned']
    courses: dict[str, CoursesStorage] = {
        course: {
            'code': course,
            # this is peter's fault for sucking at spelling
            'suppressed': localStorage.planner['courses'][course]['supressed'],
            'mark': localStorage.planner['courses'][course].get('mark', None)
        }
        for course in chain(planned, unplanned)
    }
    # cancer, but the FE inspired this cancer
    real_planner = localStorage.planner.copy()
    item: Storage = {
        'degree': localStorage.degree,
        'planner': real_planner,
        'courses': courses
    }
    set_user(token, item)


@router.get("/data/all/{token}")
def get_user(token: str) -> Storage:
    data = usersDB['tokens'].find_one({'token': token})
    if data is None:
        # TODO: this is so jank - add actual register / checking process when it comes
        # should error and prompt a registration - at some point ;)
        return default_cs_user()
        # raise HTTPException(400,f"Invalid token: {token}")
    return cast(Storage, usersDB['users'].find_one(
        {'_id': ObjectId(data['objectId'])}))

@router.get("/data/degree/{token}")
def get_user_degree(token: str) -> DegreeLocalStorage:
    return get_user(token)['degree']

@router.get("/data/planner/{token}")
def get_user_planner(token: str) -> PlannerLocalStorage:
    return get_user(token)['planner']

@router.get("/data/courses/{token}")
def get_user_p(token: str) -> dict[str, CoursesStorage]:
    return get_user(token)['courses']

# this is super jank - should never see prod
@router.post("/register/{token}")
def register_user(token: str):
    user = default_cs_user()
    set_user(token, user)

# makes an empty CS Student


def default_cs_user() -> Storage:
    planner: PlannerLocalStorage = {
        'mostRecentPastTerm': {
            'Y': 0,
            'T': 0
        },
        'unplanned': [],
        'isSummerEnabled': True,
        'startYear': LIVE_YEAR,
        'years': [],
        'courses': {},
    }
    user: Storage = {
        'degree': {
            'programCode': '3778',
            'specs': ['COMPA1'],
            'isComplete': False,
        },
        'planner': planner,
        'courses': {}
    }
    return user


@router.put("/toggleSummerTerm")
def toggle_summer_term(token: str = DUMMY_TOKEN):
    user = get_user(token)
    user['planner']['isSummerEnabled'] = not user['planner']['isSummerEnabled']
    if not user['planner']['isSummerEnabled']:
        for year in user['planner']['years']:
            user['planner']['unplanned'].extend(year['T0'])
            year['T0'] = []
    set_user(token, user, True)


@router.put("/toggleWarnings")
def toggle_warnings(courses: list[str], token: str = DUMMY_TOKEN):
    user = get_user(token)
    for course in courses:
        user['courses'][course]['suppressed'] = not user['courses'][course]['suppressed']
    set_user(token, user, True)

@router.put("/updateCourseMark",
            responses={
        400: { "description": "if the mark is invalid or it isn't in the user's courses" },
        200: {
            "description": "on successful update",
        }
    }
)
def update_course_mark(courseMark: CourseMark, token: str = DUMMY_TOKEN):
    user = get_user(token)

    if isinstance(courseMark.mark, int) and (courseMark.mark < 0 or courseMark.mark > 100):
        raise HTTPException(
            status_code=400, detail=f"Invalid mark '{courseMark.mark}'"
        )

    if courseMark.course in user['courses']:
        user['courses'][courseMark.course]['mark'] = courseMark.mark
    else:
        raise HTTPException(
            status_code=400, detail=f"Course code {courseMark.course} was not found in user's courses"
        )

    set_user(token, user, True)


@router.put("/updateStartYear")
def update_start_year(startYear: int, token: str = DUMMY_TOKEN):
    """
        Update the start year the user is taking.
        The degree length stays the same and the contents are shifted to fit the new start year.
    """
    user = get_user(token)
    user['planner']['startYear'] = startYear
    set_user(token, user, True)


@router.put("/updateDegreeLength")
def update_degree_length(numYears: int, token: str = DUMMY_TOKEN):
    user = get_user(token)
    if len(user['planner']['years']) == numYears:
        return
    diff = numYears - len(user['planner']['years'])
    if diff > 0:
        user['planner']['years'] += ([{"T0": [],
                                     "T1": [], "T2": [], "T3": []}] * diff)
    else:
        for year in user['planner']['years'][diff:]:
            for term in year.values():
                user['planner']['unplanned'].extend(term)
        user['planner']['years'] = user['planner']['years'][:diff]
    set_user(token, user, True)

@router.put("/setProgram")
def setProgram(programCode: str, token: str = DUMMY_TOKEN):
    user = get_user(token)
    user['degree']['programCode'] = programCode
    set_user(token, user, True)

@router.put("/addSpecialisation")
def addSpecialisation(specialisation: str, token: str = DUMMY_TOKEN):
    user = get_user(token)
    user['degree']['specs'].append(specialisation)
    set_user(token, user, True)

@router.put("/removeSpecialisation")
def removeSpecialisation(specialisation: str, token: str = DUMMY_TOKEN):
    user = get_user(token)
    specs = user['degree']['specs']
    if specialisation in specs:
        specs.remove(specialisation)
    set_user(token, user, True)

@router.put("/setIsComplete")
def setIsComplete(isComplete: bool, token: str = DUMMY_TOKEN):
    user = get_user(token)
    user['degree']['isComplete'] = isComplete
    set_user(token, user, True)

@router.put("/reset")
def reset(token: str = DUMMY_TOKEN):
    """Resets user data of a parsed token"""
    planner: PlannerLocalStorage = {
        'mostRecentPastTerm': {
            'Y': 0,
            'T': 0
        },
        'unplanned': [],
        'isSummerEnabled': True,
        'startYear': LIVE_YEAR,
        'years': [],
        'courses': {},
    }

    user: Storage = {
        'degree': {
            'programCode': '',
            'specs': [],
            'isComplete': False,
        },
        'planner': planner,
        'courses': {}
    }
    set_user(token, user, True)
    
