import copy
from typing import Optional
from fastapi import HTTPException
from starlette.status import HTTP_403_FORBIDDEN

from algorithms.objects.user import UserJSON, User
from server.routers.utility.common import get_core_courses, get_course_details
from server.routers.model import CourseStorage, Mark, SettingsStorage, DegreeLocalStorage, PlannerLocalStorage, Storage, LoadoutStorage, DEFAULT_LOADOUT_NAME

import server.db.helpers.users as udb
from server.db.helpers.models import PartialUserStorage, UserStorage as NEWUserStorage, UserDegreeStorage as NEWUserDegreeStorage, UserPlannerStorage as NEWUserPlannerStorage, UserCoursesStorage as NEWUserCoursesStorage, UserCourseStorage as NEWUserCourseStorage, UserSettingsStorage as NEWUserSettingsStorage, UserLoadoutStorage as NEWUserLoadoutStorage


# TODO-OLLI(pm): remove these underwrite helpers once we get rid of the old TypedDicts
# nto and otn means new-to-old and old-to-new
def _otn_planner(s: PlannerLocalStorage) -> NEWUserPlannerStorage:
    return NEWUserPlannerStorage.model_validate(s)

def _otn_degree(s: DegreeLocalStorage) -> NEWUserDegreeStorage:
    return NEWUserDegreeStorage.model_validate(s)

def _otn_courses(s: dict[str, CourseStorage]) -> NEWUserCoursesStorage:
    return { code: NEWUserCourseStorage.model_validate(info) for code, info in s.items() }

def _otn_settings(s: SettingsStorage) -> NEWUserSettingsStorage:
    return NEWUserSettingsStorage.model_validate(s.model_dump())

def _otn_loadouts(s: list[LoadoutStorage]) -> list[NEWUserLoadoutStorage]:
    return [NEWUserLoadoutStorage.model_validate(l) for l in s]

def _nto_courses(s: NEWUserCoursesStorage) -> dict[str, CourseStorage]:
    return {
        code: {
            'code': info.code,
            'ignoreFromProgression': info.ignoreFromProgression,
            'mark': info.mark,
            'uoc': info.uoc,
        } for code, info in s.items()
    }

def _nto_planner(s: NEWUserPlannerStorage) -> PlannerLocalStorage:
    return {
        'isSummerEnabled': s.isSummerEnabled,
        'lockedTerms': s.lockedTerms,
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

def _nto_settings(s: NEWUserSettingsStorage) -> SettingsStorage:
    return SettingsStorage(showMarks=s.showMarks, hiddenYears=s.hiddenYears)

def _nto_loadouts(s: list[NEWUserLoadoutStorage]) -> list[LoadoutStorage]:
    result = []
    for l in s:
        # handle both old (TypedDict) and new (Pydantic model) formats
        if hasattr(l.planner, 'model_dump'):
            # Old format - Pydantic model
            planner_dict = l.planner.model_dump()
            courses_dict = {code: info.model_dump() for code, info in l.courses.items()}
        else:
            # new format - already converted to Pydantic model
            planner_dict = _nto_planner(l.planner)
            courses_dict = _nto_courses(l.courses)
        
        result.append(LoadoutStorage(
            loadoutName=l.loadoutName,
            planner=planner_dict,
            courses=courses_dict
        ))
    return result

def _nto_storage(s: NEWUserStorage) -> Storage:
    # handle migration for users without loadouts to new setup with loadouts
    needs_migration = s.loadouts is None or s.activeLoadout is None
    
    if needs_migration:
        # create default loadout for existing users that don't have loadouts
        default_loadout = LoadoutStorage(
            loadoutName=DEFAULT_LOADOUT_NAME,
            planner=_nto_planner(s.planner),
            courses=_nto_courses(s.courses)
        )
        loadouts = [default_loadout]
        active_loadout = DEFAULT_LOADOUT_NAME
    else:
        loadouts = _nto_loadouts(s.loadouts)
        active_loadout = s.activeLoadout
    
    result = {
        'courses': _nto_courses(s.courses),
        'degree': _nto_degree(s.degree),
        'planner': _nto_planner(s.planner),
        'settings': _nto_settings(s.settings),
        'loadouts': loadouts,
        'activeLoadout': active_loadout
    }
    
    return result


def get_setup_user(uid: str) -> Storage:
    data = udb.get_user(uid)
    assert data is not None  # this uid should only come from a token exchange, and we only delete users after logout
    if data.setup is False:
        raise HTTPException(
            status_code=HTTP_403_FORBIDDEN,
            detail="User must be setup to access this resource.",
        )

    # check if user needs migration (i.e. they don't have loadouts)
    needs_migration = data.loadouts is None or data.activeLoadout is None
    
    result = _nto_storage(data)
    
    # persist the migration to database
    if needs_migration:
        # save the migrated loadouts back to the database
        udb.update_user(uid, PartialUserStorage(
            loadouts=_otn_loadouts(result['loadouts']),
            activeLoadout=result['activeLoadout']
        ))
    
    return result

# keep this private
def set_user(uid: str, item: Storage, overwrite: bool = False):
    if not overwrite and udb.user_is_setup(uid):
        # TODO-OLLI(pm): get rid of the overwrite field when we get rid of this function all together
        print("Tried to overwrite existing user. Use overwrite=True to overwrite.")
        print("++ ABOUT TO ASSERT FALSE:", uid)
        assert False  # want to remove these cases too
    
    # sync any potential changes to courses or planners to active loadout
    if 'loadouts' in item and 'activeLoadout' in item:
        for loadout in item['loadouts']:
            if loadout['loadoutName'] == item['activeLoadout']:
                loadout['courses'] = copy.deepcopy(item['courses'])
                loadout['planner'] = copy.deepcopy(item['planner'])

    res = udb.update_user(uid, PartialUserStorage(
        courses=_otn_courses(item['courses']),
        degree=_otn_degree(item['degree']),
        planner=_otn_planner(item['planner']),
        settings=_otn_settings(item['settings']),
        loadouts=_otn_loadouts(item['loadouts']),
        activeLoadout=item['activeLoadout']
    ))

    assert res


def parse_mark_to_int(mark: Mark) -> Optional[int]:
    '''Converts the stored mark into a number grade for validation'''
    # https://www.student.unsw.edu.au/wam
    match mark:
        case int() as n if 0 <= n <= 100:
            return n
        case 'SY':
            return None
        case 'FL':
            return 25
        case 'PS':
            return 55
        case 'CR':
            return 70
        case 'DN':
            return 80
        case 'HD':
            return 90
        case _:
            return None

def user_storage_to_algo_user(user: Storage) -> User:
    '''Convert the database user into the algorithm object user.'''
    courses_with_uoc: dict[str, tuple[int, Optional[int]]] = {
        code: (
            get_course_details(code)['UOC'],
            parse_mark_to_int(courseData['mark']) if code not in user['planner']['unplanned'] else None
        )
        for code, courseData
        in user['courses'].items()
    }

    user_data: UserJSON = {
        'specialisations': user['degree']['specs'],
        'program': user['degree']['programCode'],
        'core_courses': get_core_courses(user['degree']['programCode'], list(user['degree']['specs'])),
        'courses': courses_with_uoc
    }

    algo_user = User()
    algo_user.load_json(user_data)
    return algo_user

def user_storage_to_raw_plan(user: Storage) -> list[list[dict[str, tuple[int, Optional[int]]]]]:
    '''Attaches UOC and marks to the user's planner'''
    return [
        [
            {
                courseCode: (
                    user['courses'][courseCode]['uoc'],
                    parse_mark_to_int(user['courses'][courseCode]['mark'])
                )
                for courseCode in year[term]
            }
            for term in ['T0', 'T1', 'T2', 'T3']
        ]
        for year in user['planner']['years']
    ]
