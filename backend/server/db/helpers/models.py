from typing import Dict, List, Literal, Union
from pydantic import BaseModel

class UserDegreeStorage(BaseModel):
    programCode: str
    specs: List[str]
    isComplete: bool


class UserCourseStorage(BaseModel):
    code: str
    suppressed: bool
    mark: Union[Literal['SY', 'FL', 'PS', 'CR', 'DN', 'HD'], int, None]
    uoc: int
    ignoreFromProgression: bool

# TODO: https://docs.pydantic.dev/latest/concepts/models/#rootmodel-and-custom-root-types
UserCoursesStorage = Dict[str, UserCourseStorage]

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
    uid: str
    guest: bool

class UserStorage(_BaseUserStorage):
    setup: Literal[True] = True
    degree: UserDegreeStorage
    courses: UserCoursesStorage
    planner: UserPlannerStorage

class NotSetupUserStorage(_BaseUserStorage):
    setup: Literal[False] = False
