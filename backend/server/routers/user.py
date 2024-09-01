from typing import Annotated, Dict, Optional, cast
from fastapi import APIRouter, HTTPException, Security

from server.db.helpers.models import PartialUserStorage, UserCourseStorage, UserCoursesStorage, UserImport
from data.processors.models import SpecData
from server.routers.utility.common import get_all_specialisations, get_course_details
from server.routers.utility.sessions.middleware import HTTPBearerToUserID
from server.routers.utility.user import get_setup_user, set_user
from server.routers.model import CourseMark, DegreeLength, DegreeWizardInfo, HiddenYear, SettingsStorage, StartYear, CourseStorageWithExtra, DegreeLocalStorage, PlannerLocalStorage, Storage, SpecType

import server.db.helpers.users as udb

router = APIRouter(
    prefix="/user",
    tags=["user"],
)

require_uid = HTTPBearerToUserID()

@router.put("/import")
def import_user(data: UserImport, uid: Annotated[str, Security(require_uid)]):
    assert udb.reset_user(uid)

    if data.planner.startYear < 2019:
        raise HTTPException(status_code=400, detail="Invalid start year")
    if len(data.planner.years) > 10:
        raise HTTPException(status_code=400, detail="Too many years")
    if len(data.planner.years) < 1:
        raise HTTPException(status_code=400, detail="Not enough years")

    possible_specs = get_all_specialisations(data.degree.programCode)
    if possible_specs is None:
        raise HTTPException(status_code=400, detail="Invalid program code")

    flattened_containers: list[tuple[bool, list[str]]] = [
        (
            program_sub_container["is_optional"],
            list(program_sub_container["specs"].keys())
        )
        for spec_type_container in cast(dict[SpecType, dict[str, SpecData]], possible_specs).values()
        for program_sub_container in spec_type_container.values()
    ]

    invalid_lhs_specs = set(data.degree.specs).difference(
        spec_code
        for (_, spec_codes) in flattened_containers
        for spec_code in spec_codes
    )

    spec_reqs_not_met = any(
        (
            not is_optional
            and not set(spec_codes).intersection(data.degree.specs)
        )
        for (is_optional, spec_codes) in flattened_containers
    )

    if invalid_lhs_specs or spec_reqs_not_met:
        raise HTTPException(status_code=400, detail="Invalid specialisations")

    for term in data.planner.lockedTerms.keys():
        year, termIndex = term.split("T")
        if int(year) < data.planner.startYear or int(year) >= data.planner.startYear + len(data.planner.years):
            raise HTTPException(status_code=400, detail="Invalid locked term")
        if termIndex not in ["0", "1", "2", "3"]:
            raise HTTPException(status_code=400, detail="Invalid locked term")
    for year in data.settings.hiddenYears:
        if year < 0 or year >= len(data.planner.years):
            raise HTTPException(status_code=400, detail="Invalid hidden year")

    courses = []
    for course in data.planner.unplanned:
        if course not in data.courses.keys():
            raise HTTPException(status_code=400, detail="Unplanned course not in courses")
        courses.append(course)
    for year in data.planner.years:
        for term in [year.T0, year.T1, year.T2, year.T3]:
            for course in term:
                if course not in data.courses.keys():
                    raise HTTPException(status_code=400, detail="Planned course not in courses")
                courses.append(course)
    for course in data.courses.keys():
        if course not in courses:
            raise HTTPException(status_code=400, detail="Course in courses not in planner")
        mark = data.courses[course].mark
        if  isinstance(mark, int) and (mark < 0 or mark > 100):
            raise HTTPException(status_code=400, detail="Invalid mark")
    userCourses: UserCoursesStorage = {}
    for course in courses:
        # This raises an exception
        uoc = get_course_details(course)["UOC"]
        userCourses[course] = UserCourseStorage(code=course, mark=data.courses[course].mark, uoc=uoc, ignoreFromProgression=data.courses[course].ignoreFromProgression)

    user = PartialUserStorage(degree=data.degree, courses=userCourses, planner=data.planner, settings=data.settings)
    udb.reset_user(uid)
    udb.update_user(uid, user)


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
    # TODO-OLLI(pm): remove the additional data here and get frontend to request it itself
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
        course_info = get_course_details(raw_course['code'])

        with_extra_info: CourseStorageWithExtra = {
            'code': raw_course['code'],
            'ignoreFromProgression': raw_course['ignoreFromProgression'],
            'mark': raw_course['mark'],
            'uoc': raw_course['uoc'],
            'isMultiterm': course_info['is_multiterm'],
            'title': course_info['title'],
            'plannedFor': flattened.get(raw_course['code']),
        }
        assert raw_course['code'] in flattened, with_extra_info  # ensure it was somewhere

        res[raw_course['code']] = with_extra_info

    return res

@router.get("/data/settings")
def get_user_settings(uid: Annotated[str, Security(require_uid)]) -> SettingsStorage:
    return get_setup_user(uid)['settings']

@router.post("/settings/toggleShowMarks")
def toggle_show_marks(uid: Annotated[str, Security(require_uid)]):
    user = get_setup_user(uid)
    user['settings'].showMarks = not user['settings'].showMarks
    set_user(uid, user, True)

@router.post("/settings/hideYear")
def hide_year(hidden: HiddenYear, uid: Annotated[str, Security(require_uid)]):
    user = get_setup_user(uid)
    if hidden.yearIndex < 0 or hidden.yearIndex >= len(user['planner']['years']):
        raise HTTPException(
            status_code=400, detail=f"Invalid year index '{hidden.yearIndex}'"
        )
    user['settings'].hiddenYears.add(hidden.yearIndex)
    set_user(uid, user, True)

@router.post("/settings/showYears")
def show_years(uid: Annotated[str, Security(require_uid)]):
    user = get_setup_user(uid)
    user['settings'].hiddenYears = set()
    set_user(uid, user, True)

@router.post("/toggleSummerTerm")
def toggle_summer_term(uid: Annotated[str, Security(require_uid)]):
    user = get_setup_user(uid)
    user['planner']['isSummerEnabled'] = not user['planner']['isSummerEnabled']
    if not user['planner']['isSummerEnabled']:
        for year in user['planner']['years']:
            user['planner']['unplanned'].extend(year['T0'])
            year['T0'] = []
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
def update_start_year(startYear: StartYear, uid: Annotated[str, Security(require_uid)]):
    """
        Update the start year the user is taking.
        The degree length stays the same and the contents are shifted to fit the new start year.
    """
    user = get_setup_user(uid)
    user['planner']['startYear'] = startYear.startYear
    set_user(uid, user, True)

@router.put("/updateDegreeLength")
def update_degree_length(degreeLength: DegreeLength, uid: Annotated[str, Security(require_uid)]):
    user = get_setup_user(uid)
    if len(user['planner']['years']) == degreeLength.numYears:
        return
    diff = degreeLength.numYears - len(user['planner']['years'])
    if diff > 0:
        user['planner']['years'] += ([{"T0": [],
                                     "T1": [], "T2": [], "T3": []}] * diff)
    else:
        for year in user['planner']['years'][diff:]:
            for term in year.values():
                user['planner']['unplanned'].extend(term)
        user['planner']['years'] = user['planner']['years'][:diff]

        user['settings'].hiddenYears = set(
            yearIndex
            for yearIndex in user['settings'].hiddenYears
            if yearIndex < degreeLength.numYears
        )
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
    # NOTE: is allowed to be called on a already setup user
    # validate
    num_years = wizard.endYear - wizard.startYear + 1
    if num_years < 1:
        raise HTTPException(status_code=400, detail="Invalid year range")

    # Ensure that all specialisations are valid
    # Need a bidirectoinal validate
    # All specs in wizard (lhs) must be in the RHS
    # All specs in the RHS that are "required" must have an associated LHS selection

    # Keys in the specInfo
    # - 'specs': List[str] - name of the specialisations - thing that matters
    # - 'notes': str - dw abt this (Fe's prob tbh)
    # - 'is_optional': bool - if true then u need to validate associated elem in LHS

    avail_specs = get_all_specialisations(wizard.programCode)
    if avail_specs is None:
        raise HTTPException(status_code=400, detail="Invalid program code")

    # list[(is_optional, spec_codes)]
    flattened_containers: list[tuple[bool, list[str]]] = [
        (
            program_sub_container["is_optional"],
            list(program_sub_container["specs"].keys())
        )
        for spec_type_container in cast(dict[SpecType, dict[str, SpecData]], avail_specs).values()
        for program_sub_container in spec_type_container.values()
    ]

    invalid_lhs_specs = set(wizard.specs).difference(
        spec_code
        for (_, spec_codes) in flattened_containers
        for spec_code in spec_codes
    )

    spec_reqs_not_met = any(
        (
            not is_optional
            and not set(spec_codes).intersection(wizard.specs)
        )
        for (is_optional, spec_codes) in flattened_containers
    )

    # ceebs returning the bad data because FE should be valid anyways
    if invalid_lhs_specs or spec_reqs_not_met:
        raise HTTPException(status_code=400, detail="Invalid specialisations")
    print("Valid specs")

    planner: PlannerLocalStorage = {
        'unplanned': [],
        'isSummerEnabled': False,
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
        'courses': {},
        'settings': SettingsStorage(showMarks=False, hiddenYears=set()),
    }
    set_user(uid, user, True)
    return user
