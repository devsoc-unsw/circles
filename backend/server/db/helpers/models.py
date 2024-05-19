from typing import Dict, List, Literal, NewType, Optional, Union
from uuid import UUID
from pydantic import BaseModel

#
# NewTypes
#
SessionID = NewType('SessionID', UUID)
SessionToken = NewType('SessionToken', str)
RefreshToken = NewType('RefreshToken', str)

#
# User Storage Models
#
class UserDegreeStorage(BaseModel):
    programCode: str
    specs: List[str]


class UserCourseStorage(BaseModel):
    code: str
    suppressed: bool
    mark: Union[Literal['SY', 'FL', 'PS', 'CR', 'DN', 'HD'], int, None]
    uoc: int
    ignoreFromProgression: bool

# TODO-OLLI: https://docs.pydantic.dev/latest/concepts/models/#rootmodel-and-custom-root-types
type UserCoursesStorage = Dict[str, UserCourseStorage]

class YearTerm(BaseModel):
    Y: int
    T: int

class PlannerYear(BaseModel):
    T0: List[str]
    T1: List[str]
    T2: List[str]
    T3: List[str]

class UserPlannerStorage(BaseModel):
    unplanned: List[str]
    startYear: int
    isSummerEnabled: bool
    mostRecentPastTerm: YearTerm
    years: List[PlannerYear]
    lockedTerms: Dict[str, bool]

class _BaseUserStorage(BaseModel):
    # uid: str  # TODO-OLLI: add aliases in new pydantic
    guest: bool

class UserStorage(_BaseUserStorage):
    setup: Literal[True] = True
    degree: UserDegreeStorage
    courses: UserCoursesStorage
    planner: UserPlannerStorage

class NotSetupUserStorage(_BaseUserStorage):
    setup: Literal[False] = False

# https://github.com/pydantic/pydantic/issues/1223#issuecomment-1152323275
class PartialUserStorage(BaseModel):
    # for batch user storage update
    # TODO-OLLI: remove this and use keyword args since they cannot be None
    degree: Optional[UserDegreeStorage] = None
    courses: Optional[UserCoursesStorage] = None
    planner: Optional[UserPlannerStorage] = None

#
# Session Token Models (redis)
#
class SessionTokenInfoModel(BaseModel):
    sid: SessionID              # id of the session behind this token
    uid: str                    # user who owns the session
    exp: int                    # time of expiry, will be replaced with a TTL on the cache

#
# Refresh Token Models (mongo)
#
class RefreshTokenInfoModel(BaseModel):
    # object stored against the refresh token
    sid: SessionID              # id of the session behind this token
    expires_at: int             # time of expiry, will be replaced with a TTL on the cache

#
# Session Models (mongo)
#
class SessionOIDCInfoModel(BaseModel):
    access_token: str           # most recent access token
    raw_id_token: str           # most recent id token string
    refresh_token: str          # most recent refresh token
    validated_id_token: dict    # most recent valid id token object

class NotSetupSessionModel(BaseModel):
    # object stored against the sid when session is not yet setup (brief time between during token generation)
    uid: str                    # for validation and back lookup
    type: Literal['notsetup']   # ensure that this can get parsed correctly
    expires_at: int             # time of expiry, will be replaced with a TTL on the cache

class SessionInfoModel(BaseModel):
    # object stored against the sid
    uid: str                      # for validation and back lookup
    oidc_info: SessionOIDCInfoModel
    curr_ref_token: RefreshToken  # the most recent refresh token, only one that should be accepted
    type: Literal['csesoc']       # ensure that this can get parsed correctly
    expires_at: int               # time of expiry, will be replaced with a TTL on the cache

class GuestSessionInfoModel(BaseModel):
    # object stored against the sid
    uid: str                      # for validation and back lookup
    curr_ref_token: RefreshToken  # the most recent refresh token, only one that should be accepted
    type: Literal['guest']        # ensure that this can get parsed correctly
    expires_at: int               # time of expiry, will be replaced with a TTL on the cache
