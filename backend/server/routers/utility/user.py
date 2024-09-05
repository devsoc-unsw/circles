from typing import Optional
from fastapi import HTTPException
from starlette.status import HTTP_403_FORBIDDEN

from server.routers.model import CourseStorage, Mark, SettingsStorage, DegreeLocalStorage, PlannerLocalStorage, Storage, UserData

import server.db.helpers.users as udb
from server.db.helpers.models import PartialUserStorage, UserStorage as NEWUserStorage, UserDegreeStorage as NEWUserDegreeStorage, UserPlannerStorage as NEWUserPlannerStorage, UserCoursesStorage as NEWUserCoursesStorage, UserCourseStorage as NEWUserCourseStorage, UserSettingsStorage as NEWUserSettingsStorage


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

def _nto_storage(s: NEWUserStorage) -> Storage:
    return {
        'courses': _nto_courses(s.courses),
        'degree': _nto_degree(s.degree),
        'planner': _nto_planner(s.planner),
        'settings': _nto_settings(s.settings),
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
        # TODO-OLLI(pm): get rid of the overwrite field when we get rid of this function all together
        print("Tried to overwrite existing user. Use overwrite=True to overwrite.")
        print("++ ABOUT TO ASSERT FALSE:", uid)
        assert False  # want to remove these cases too

    res = udb.update_user(uid, PartialUserStorage(
        courses=_otn_courses(item['courses']),
        degree=_otn_degree(item['degree']),
        planner=_otn_planner(item['planner']),
        settings=_otn_settings(item['settings']),
    ))

    assert res


def parse_mark_to_int(mark: Mark) -> Optional[int]:
    '''Converts the stored mark into a number grade for validation'''
    # 'SY': null, 'FL': 25, 'PS': 60, 'CR': 70, 'DN': 80, 'HD': 90
    # TODO-OLLI: unify this with convert_to_planner_data
    match mark:
        case int() as n if 0 <= n <= 100:
            return n
        case 'SY':
            return None
        case 'FL':
            return 25
        case 'PS':
            return 60
        case 'CR':
            return 70
        case 'DN':
            return 80
        case 'HD':
            return 90
        case _:
            return None

def prepare_user_payload(user: Storage) -> UserData:
    '''
    Temporary helper, lifted directly from the frontend prepareUserPayload...
    '''

    courseMarks = {
        code: parse_mark_to_int(courseData['mark'])
        for code, courseData
        in user['courses'].items()
    }

    # TODO: was in the original prepareUserPayload, this should be an invariant though, thus unecessary
    for code in user['planner']['unplanned']:
        courseMarks[code] = None

    return UserData(
        program=user['degree']['programCode'],
        specialisations=user['degree']['specs'],
        courses=courseMarks,
    )
