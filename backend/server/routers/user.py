from itertools import chain
from typing import Annotated, Any, Dict, Optional, cast
from bson.objectid import ObjectId
from fastapi import APIRouter, HTTPException, Security
from starlette.status import HTTP_403_FORBIDDEN

from server.routers.auth_utility.middleware import HTTPBearerToUserID
from server.routers.courses import get_course
from server.routers.model import CourseMark, CourseStorage, DegreeWizardInfo, CourseStorageWithExtra, DegreeLocalStorage, LocalStorage, PlannerLocalStorage, Storage, SpecType
from server.routers.programs import get_programs
from server.routers.specialisations import get_specialisation_types, get_specialisations

import server.db.helpers.users as udb
from server.db.helpers.models import PartialUserStorage, UserStorage as NEWUserStorage, UserDegreeStorage as NEWUserDegreeStorage, UserPlannerStorage as NEWUserPlannerStorage, UserCoursesStorage as NEWUserCoursesStorage, UserCourseStorage as NEWUserCourseStorage


from pydantic import BaseModel
# TODO-OLLI: i think we can get rid of this now since we do not use ObjectId anywhere
BaseModel.model_config["json_encoders"] = {ObjectId: str}

router = APIRouter(
    prefix="/user",
    tags=["user"],
)

require_uid = HTTPBearerToUserID()

# TODO-OLLI: remove these underwrite helpers once we get rid of the old TypedDicts
def _otn_planner(s: PlannerLocalStorage) -> NEWUserPlannerStorage:
    return NEWUserPlannerStorage.model_validate(s)

def _otn_degree(s: DegreeLocalStorage) -> NEWUserDegreeStorage:
    return NEWUserDegreeStorage.model_validate(s)

def _otn_courses(s: dict[str, CourseStorage]) -> NEWUserCoursesStorage:
    return { code: NEWUserCourseStorage.model_validate(info) for code, info in s.items() }

def _nto_courses(s: NEWUserCoursesStorage) -> dict[str, CourseStorage]:
    return { 
        code: {
            'code': info.code,
            'ignoreFromProgression': info.ignoreFromProgression,
            'mark': info.mark,
            'suppressed': info.suppressed,
            'uoc': info.uoc,
        } for code, info in s.items()
    }

def _nto_planner(s: NEWUserPlannerStorage) -> PlannerLocalStorage:
    return {
        'isSummerEnabled': s.isSummerEnabled,
        'lockedTerms': s.lockedTerms,
        'mostRecentPastTerm': {
            'T': s.mostRecentPastTerm.T,
            'Y': s.mostRecentPastTerm.Y,
        },
        'startYear': s.startYear,
        'unplanned': s.unplanned,
        'years': [{ 
            'T0': y.T0,
            'T1': y.T1,
            'T2': y.T2,
            'T3': y.T3,
        } for y in s.years],
    }

def _nto_degree(s: NEWUserDegreeStorage) -> DegreeLocalStorage:
    return {
        'programCode': s.programCode,
        'specs': s.specs,
    }

def _nto_storage(s: NEWUserStorage) -> Storage:
    return {
        'courses': _nto_courses(s.courses),
        'degree': _nto_degree(s.degree),
        'planner': _nto_planner(s.planner),
    }


def get_setup_user(uid: str) -> Storage:
    data = udb.get_user(uid)
    assert data is not None  # this uid should only come from a token exchange, and we only delete users after logout
    if data.setup is False:
        raise HTTPException(
            status_code=HTTP_403_FORBIDDEN,
            detail="User must be setup to access this resource.",
        )

    return _nto_storage(data)

# keep this private
def set_user(uid: str, item: Storage, overwrite: bool = False):
    if not overwrite and udb.user_is_setup(uid):
        # TODO-OLLI: get rid of the overwrite field when we get rid of this function all together
        print("Tried to overwrite existing user. Use overwrite=True to overwrite.")
        print("++ ABOUT TO ASSERT FALSE:", uid)
        assert False  # want to remove these cases too

    res = udb.update_user(uid, PartialUserStorage(
        courses=_otn_courses(item['courses']),
        degree=_otn_degree(item['degree']),
        planner=_otn_planner(item['planner']),
    ))

    assert res


# Ideally not used often.
@router.post("/saveLocalStorage")
def save_local_storage(localStorage: LocalStorage, uid: Annotated[str, Security(require_uid)]):
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
    set_user(uid, item)


@router.get("/data/all")
def get_user(uid: Annotated[str, Security(require_uid)]) -> Storage:
    return get_setup_user(uid)

@router.get("/data/degree")
def get_user_degree(uid: Annotated[str, Security(require_uid)]) -> DegreeLocalStorage:
    return get_setup_user(uid)['degree']

@router.get("/data/planner")
def get_user_planner(uid: Annotated[str, Security(require_uid)]) -> PlannerLocalStorage:
    return get_setup_user(uid)['planner']

@router.get("/data/courses")
def get_user_p(uid: Annotated[str, Security(require_uid)]) -> Dict[str, CourseStorageWithExtra]:
    # expects to also get the
    # title: str
    # plannedFor: string of form "year term"
    # isMultiterm
    # uoc -> UOC
    # TODO-OLLI: remove the additional data here and get frontend to request it itself
    user = get_setup_user(uid)
    raw_courses = user['courses']
    planner = user['planner']

    # flatten the planner
    flattened: Dict[str, Optional[str]] = { code: None for code in planner['unplanned'] }
    for index, year in enumerate(planner['years']):
        for termIndex, term in year.items():
            for course in term:
                assert course not in flattened  # makes sure its not double storred
                flattened[course] = f"{index + planner['startYear']} {termIndex}"

    res: Dict[str, CourseStorageWithExtra] = {}

    for raw_course in raw_courses.values():
        course_info = get_course(raw_course['code'])

        with_extra_info: CourseStorageWithExtra = {
            'code': raw_course['code'],
            'ignoreFromProgression': raw_course['ignoreFromProgression'],
            'mark': raw_course['mark'],
            'uoc': raw_course['uoc'],
            'suppressed': raw_course['suppressed'],
            'isMultiterm': course_info['is_multiterm'],
            'title': course_info['title'],
            'plannedFor': flattened.get(raw_course['code']),
        }
        assert raw_course['code'] in flattened, with_extra_info  # ensure it was somewhere

        res[raw_course['code']] = with_extra_info

    return res

@router.post("/toggleSummerTerm")
def toggle_summer_term(uid: Annotated[str, Security(require_uid)]):
    user = get_setup_user(uid)
    user['planner']['isSummerEnabled'] = not user['planner']['isSummerEnabled']
    if not user['planner']['isSummerEnabled']:
        for year in user['planner']['years']:
            user['planner']['unplanned'].extend(year['T0'])
            year['T0'] = []
    set_user(uid, user, True)


@router.put("/toggleWarnings")
def toggle_warnings(courses: list[str], uid: Annotated[str, Security(require_uid)]):
    user = get_setup_user(uid)
    for course in courses:
        user['courses'][course]['suppressed'] = not user['courses'][course]['suppressed']
    set_user(uid, user, True)

@router.put("/updateCourseMark",
            responses={
        400: { "description": "if the mark is invalid or it isn't in the user's courses" },
        200: {
            "description": "on successful update",
        }
    }
)
def update_course_mark(courseMark: CourseMark, uid: Annotated[str, Security(require_uid)]):
    user = get_setup_user(uid)

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

    set_user(uid, user, True)


@router.put("/updateStartYear")
def update_start_year(startYear: int, uid: Annotated[str, Security(require_uid)]):
    """
        Update the start year the user is taking.
        The degree length stays the same and the contents are shifted to fit the new start year.
    """
    user = get_setup_user(uid)
    user['planner']['startYear'] = startYear
    set_user(uid, user, True)


@router.put("/updateDegreeLength")
def update_degree_length(numYears: int, uid: Annotated[str, Security(require_uid)]):
    user = get_setup_user(uid)
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
    set_user(uid, user, True)

@router.put("/setProgram")
def setProgram(programCode: str, uid: Annotated[str, Security(require_uid)]):
    user = get_setup_user(uid)
    user['degree']['programCode'] = programCode
    set_user(uid, user, True)

@router.put("/addSpecialisation")
def addSpecialisation(specialisation: str, uid: Annotated[str, Security(require_uid)]):
    user = get_setup_user(uid)
    user['degree']['specs'].append(specialisation)
    set_user(uid, user, True)

@router.put("/removeSpecialisation")
def removeSpecialisation(specialisation: str, uid: Annotated[str, Security(require_uid)]):
    user = get_setup_user(uid)
    specs = user['degree']['specs']
    if specialisation in specs:
        specs.remove(specialisation)
    set_user(uid, user, True)

@router.post("/reset")
def reset(uid: Annotated[str, Security(require_uid)]):
    """Resets user data of a parsed token"""
    assert udb.reset_user(uid)

@router.get("/isSetup")
def is_setup(uid: Annotated[str, Security(require_uid)]) -> bool:
    """Returns whether the user has been setup with a degree yet, replacing old `isComplete` field."""
    return udb.user_is_setup(uid)

@router.post("/setupDegreeWizard", response_model=Storage)
def setup_degree_wizard(wizard: DegreeWizardInfo, uid: Annotated[str, Security(require_uid)]):
    # TODO-OLLI: do we want to throw 403 if they are already setup???
    # validate
    num_years = wizard.endYear - wizard.startYear + 1
    if num_years < 1:
        raise HTTPException(status_code=400, detail="Invalid year range")

    # Ensure valid prog code - done by the specialisatoin check so this is
    # techincally redundant
    progs = get_programs()["programs"]
    if progs is None:
        raise HTTPException(status_code=400, detail="Invalid program code")

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
        },
        'planner': planner,
        'courses': {}
    }
    set_user(uid, user, True)
    return user
