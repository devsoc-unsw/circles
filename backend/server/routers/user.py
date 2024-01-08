from itertools import chain
from typing import Any, Dict, cast

from bson.objectid import ObjectId
from fastapi import APIRouter, HTTPException

from data.config import LIVE_YEAR
from server.config import DUMMY_TOKEN
from server.database import usersDB
from server.routers.courses import get_course
from server.routers.model import (
    CONDITIONS,
    CourseMark,
    CourseStorage,
    DegreeLocalStorage,
    DegreeWizardInfo,
    LocalStorage,
    PlannerLocalStorage,
    SpecType,
    Storage,
)
from server.routers.programs import get_programs
from server.routers.specialisations import get_specialisation_types, get_specialisations

from pydantic.json import ENCODERS_BY_TYPE
ENCODERS_BY_TYPE[ObjectId] = str

router = APIRouter(
    prefix="/user",
    tags=["user"],
)

# keep this private

def set_user(token: str, item: Storage, overwrite: bool = False):
    data = usersDB['tokens'].find_one({'token': token})
    if data:
        if not overwrite:
            print("Tried to overwrite existing user. Use overwrite=True to overwrite.")
            return
        objectID = data['objectId']
        usersDB['users'].update_one(
            {'_id': ObjectId(objectID)}, {'$set': item})
    else:
        objectID = usersDB['users'].insert_one(dict(item)).inserted_id
        usersDB['tokens'].insert_one({'token': token, 'objectId': objectID})


# Ideally not used often.
@router.post("/saveLocalStorage")
def save_local_storage(localStorage: LocalStorage, token: str = DUMMY_TOKEN):
    # TODO: turn giving no token into an error
    planned: list[str] = sum((sum(year.values(), [])
                             for year in localStorage.planner['years']), [])
    unplanned: list[str] = localStorage.planner['unplanned']
    courses: dict[str, CourseStorage] = {
        course: {
            'code': course,
            'suppressed': False, # guess we will nuke this config
            'mark': None, # wtf we nuking marks?
            'uoc': get_course(course)['UOC'],
            'ignoreFromProgression': False
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
def get_user_p(token: str) -> dict[str, CourseStorage]:
    # expects to also get the
    # title: str
    # plannedFor: string of form "year term"
    # isMultiterm
    # uoc -> UOC
    res = get_user(token)['courses']
    planner = get_user_planner(token)
    for c in res.values():
        c = cast(Dict, c)
        course = get_course(c['code'])
        c['title'] = course['title']
        c['isMultiterm'] = course['is_multiterm']
        for index, year in enumerate(planner['years']):
            for termIndex, term in year.items():
                if c['code'] in term:
                    c['plannedFor'] = f"{index + planner['startYear']} {termIndex}"
                    break
        if c['code'] in planner['unplanned']:
            c['plannedFor'] = "unplanned"
        c['plannedFor'] = c.get('plannedFor') # set to None if need be
        c['UOC'] = c.pop('uoc')
    return res

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
        'lockedTerms': {},
        'years': [],
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


@router.post("/toggleSummerTerm")
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

@router.post("/reset")
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
        'lockedTerms': {},
        'years': [],
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

@router.post("/setupDegreeWizard", response_model=Storage)
def setup_degree_wizard(wizard: DegreeWizardInfo, token: str = DUMMY_TOKEN):
    # validate
    print("MADE INNER")
    num_years = wizard.endYear - wizard.startYear + 1
    if num_years < 1:
        raise HTTPException(status_code=400, detail="Invalid year range")

    # Ensure valid prog code - done by the specialisatoin check so this is
    # techincally redundant
    progs = get_programs()["programs"]
    print('progs: ', progs)
    if progs is None:
        raise HTTPException(status_code=400, detail="Invalid program code")
    print("valid program")

    # Ensure that all specialisations are valid
    # Need a bidirectoinal validate
    # All specs in wizard (lhs) must be in the RHS
    # All specs in the RHS that are "required" must have an associated LHS selection
    avail_spec_types: list[SpecType] = get_specialisation_types(wizard.programCode)["types"]
    # Type of elemn in the following is
    # Dict[Literal['specs'], Dict[str(programTitle), specInfo]]
    # Keys in the specInfo
    # - 'specs': List[str] - name of the specialisations - thing that matters
    # - 'notes': str - dw abt this (Fe's prob tbh)
    # - 'is_optional': bool - if true then u need to validate associated elem in LHS
    avail_specs = list(chain.from_iterable(
        cast(list[Any], specs) # for some bs, specs is still List[Any | None] ??????
        for spec_type in avail_spec_types
        if (specs := list(get_specialisations(wizard.programCode, spec_type).values())) is not None
    ))
    # LHS subset All specs
    invalid_lhs_specs = set(wizard.specs).difference(
        spec_code
        for specs in avail_specs
        for actl_spec in specs.values()
        for spec_code in actl_spec.get('specs', []).keys()
    )
    # All compulsory in RHS has an entry in LHS
    spec_reqs_not_met = [
        actl_spec
        for specs in avail_specs
        for actl_spec in specs.values()
        if (
            actl_spec.get('is_optional') is False
            and not set(actl_spec.get('specs', []).keys()).intersection(wizard.specs)
        )

    ]

    # ceebs returning the bad data because FE should be valid anyways
    if invalid_lhs_specs or spec_reqs_not_met:
        raise HTTPException(status_code=400, detail="Invalid specialisations")
    print("Valid specs")

    planner: PlannerLocalStorage = {
        'mostRecentPastTerm': {
            'Y': 0,
            'T': 0
        },
        'unplanned': [],
        'isSummerEnabled': True,
        'startYear': wizard.startYear,
        'lockedTerms': {},
        'years': [],
    }
    
    planner['years'] = [
        {"T0": [], "T1": [], "T2": [], "T3": []}
        for _ in range(num_years)
    ]

    user: Storage = {
        'degree': {
            'programCode': wizard.programCode,
            'specs': wizard.specs,
            'isComplete': True,
        },
        'planner': planner,
        'courses': {}
    }
    set_user(token, user, True)
    return user
