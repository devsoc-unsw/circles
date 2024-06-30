""" model for interacting with the FE """
# pylint: disable=missing-class-docstring
import json
import pickle
from typing import Literal, Optional, TypedDict, Union

from algorithms.objects.conditions import CompositeCondition
from algorithms.objects.user import User
from pydantic import BaseModel, ConfigDict, with_config


class Programs(BaseModel):
    model_config = ConfigDict(extra='forbid')

    programs: dict

class DegreeWizardInfo(BaseModel):
    model_config = ConfigDict(extra='forbid')

    programCode: str
    startYear: int
    endYear: int
    specs: list[str]

class Specialisations(BaseModel):
    model_config = ConfigDict(extra='forbid')

    spec: dict[str, dict]  # cant do more specific because NotRequired doesnt work


class ProgramCourses(BaseModel):
    model_config = ConfigDict(extra='forbid')

    courses: dict[str, str]


class CourseDetails(BaseModel):
    model_config = ConfigDict(extra='forbid')

    title: str
    code: str
    UOC: int
    level: int
    description: str
    study_level: str
    faculty: Optional[str] = None
    school: Optional[str] = None
    campus: str
    equivalents: dict[str, Literal[1]]
    raw_requirements: str
    exclusions: dict[str, Literal[1]]
    handbook_note: str
    terms: list[str]
    gen_ed: bool
    is_legacy: bool
    is_accurate: bool
    is_multiterm: Optional[bool] = None

@with_config(ConfigDict(extra='forbid'))
class ContainerContent(TypedDict):
    UOC: int
    courses: dict[str, str | list[str]]
    type: str
    notes: str

@with_config(ConfigDict(extra='forbid'))
class StructureContainer(TypedDict):
    name: str
    content: dict[str, ContainerContent]

class Structure(BaseModel):
    model_config = ConfigDict(extra='forbid')

    structure: dict[str, StructureContainer]
    uoc: int


# TODO: This should just take a token now
class UserData(BaseModel):
    model_config = ConfigDict(extra='forbid')

    program: str
    specialisations: list[str]
    courses: dict


class CourseState(BaseModel):
    model_config = ConfigDict(extra='forbid')

    is_accurate: bool
    unlocked: bool
    handbook_note: str
    warnings: list


class ValidCourseState(BaseModel):
    model_config = ConfigDict(extra='forbid')

    is_accurate: bool
    unlocked: bool
    handbook_note: str
    warnings: list


class CoursesState(BaseModel):
    model_config = ConfigDict(extra='forbid')

    courses_state: dict[str, CourseState] = {}


class ValidCoursesState(BaseModel):
    model_config = ConfigDict(extra='forbid')

    courses_state: dict[str, ValidCourseState] = {}


class CoursesUnlockedWhenTaken (BaseModel):
    model_config = ConfigDict(extra='forbid')

    direct_unlock: list[str]
    indirect_unlock: list[str]


class CourseTypeState(BaseModel):
    model_config = ConfigDict(extra='forbid')

    is_accurate: bool
    unlocked: bool
    handbook_note: str
    warnings: list[str]
    course_type: list[str]


class CoursesTypeState(BaseModel):
    model_config = ConfigDict(extra='forbid')

    courses_state: dict[str, CourseTypeState] = {}


class ValidPlannerData(BaseModel):
    model_config = ConfigDict(extra='forbid')

    programCode: str
    specialisations: list[str]
    plan: list[list[dict[str, tuple[int, Optional[int]]]]]

class PlannerData(BaseModel):
    programCode: str
    specialisations: list[str]
    plan: list[list[dict[str, Optional[list[Optional[int]]]]]]
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "program": "3707",
            "specialisations": ["COMPA1"],
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
        }
    }, extra='forbid')

    def to_user(self) -> User:
        user = User()
        user.program = self.programCode
        user.specialisations = self.specialisations[:]

        # prevent circular import; TODO: There has to be a better way
        from server.routers.courses import get_course

        for year in self.plan:
            for term in year:
                cleaned_term = {}
                for course_name, course_value in term.items():
                    cleaned_term[course_name] = (
                        (course_value[0], course_value[1]) if course_value
                        else (get_course(course_name)["UOC"], None) # type: ignore
                    )
                user.add_courses(cleaned_term)
        return user


@with_config(ConfigDict(extra='forbid'))
class DegreeLocalStorage(TypedDict):
    programCode: str
    specs: list[str]
    isComplete: bool

@with_config(ConfigDict(extra='forbid'))
class PlannerLocalStorage(TypedDict):
    unplanned: list[str]
    startYear: int
    isSummerEnabled: bool
    lockedTerms: dict[str, bool]
    years: list[dict[str, list[str]]]

LetterGrade = Literal['SY', 'FL', 'PS', 'CR', 'DN', 'HD']
Mark = Optional[int | LetterGrade]

markMap = {
    "SY": 50,
    "FL": 25,
    "PS": 50,
    "CR": 65,
    "DN": 75,
    "HD": 85,
}

@with_config(ConfigDict(extra='forbid'))
class CourseStorage(TypedDict):
    code: str
    mark: Mark
    uoc: int
    title: str
    plannedFor: str | None
    isMultiterm: bool
    ignoreFromProgression: bool

@with_config(ConfigDict(extra='forbid'))
class Storage(TypedDict):
    degree: DegreeLocalStorage
    planner: PlannerLocalStorage
    courses: dict[str, CourseStorage]

class LocalStorage(BaseModel):
    model_config = ConfigDict(extra='forbid')

    degree: DegreeLocalStorage
    planner: PlannerLocalStorage

class CourseMark(BaseModel):
    model_config = ConfigDict(extra='forbid')

    course: str
    mark: Mark

class CourseCodes(BaseModel):
    model_config = ConfigDict(extra='forbid')

    courses: list[str]

class Courses(BaseModel):
    model_config = ConfigDict(extra='forbid')

    courses: dict[str, str] = {}

class CoursesPath(BaseModel):
    model_config = ConfigDict(extra='forbid')

    original: str
    courses: list[str]

class CoursesPathDict(TypedDict):
    original: str
    courses: list[str]

class Description(BaseModel):
    model_config = ConfigDict(extra='forbid')

    description: str

SpecType = Union[Literal["majors"], Literal["minors"], Literal["honours"]]
class SpecialisationTypes(BaseModel):
    model_config = ConfigDict(extra='forbid')

    types: list[SpecType]

class Graph(BaseModel):
    model_config = ConfigDict(extra='forbid')

    edges: list[dict[str, str]]
    courses: list[str]

class TermsList(BaseModel):
    model_config = ConfigDict(extra='forbid')

    terms: Optional[dict[str, Optional[list[str]]]] = None
    # Actually tuple(str, fastapi.exceptions.HTTPException)
    fails: Optional[list[tuple]] = None

@with_config(ConfigDict(extra='forbid'))
class StructureDict(TypedDict):
    structure: dict[str, StructureContainer]
    uoc: int

# Used in addToUnplanned, removeCourse and unscheduleCourse routes
class CourseCode(BaseModel):
    model_config = ConfigDict(extra='forbid')

    courseCode: str

# Used in unPlannedToTerm route
class UnPlannedToTerm(BaseModel):
    model_config = ConfigDict(extra='forbid')

    destRow: int
    destTerm: str
    destIndex: int
    courseCode: str

# used in PlannedToTerm route
class PlannedToTerm(BaseModel):
    model_config = ConfigDict(extra='forbid')

    srcRow: int
    srcTerm: str
    destRow: int
    destTerm: str
    destIndex: int
    courseCode: str

class ProgramTime(BaseModel):
    model_config = ConfigDict(extra='forbid')

    startTime: tuple[int, int]  # (Year, Term) start of program
    endTime: tuple[int, int]
    uocMax: list[int]  # list of maximum uocs per term e.g. [12, 20, 20, 20] as in 12 in first term, 20 in each of the next 3 terms

@with_config(ConfigDict(extra='forbid'))
class TermsOffered(TypedDict):
    terms: dict[str, list[str]]
    fails: list[tuple]

CONDITIONS_PATH = "data/final_data/conditions.pkl"
with open(CONDITIONS_PATH, "rb") as file:
    CONDITIONS: dict[str, CompositeCondition] = pickle.load(file)

with open("algorithms/cache/handbook_note.json", "r", encoding="utf8") as handbook_file:
    CACHED_HANDBOOK_NOTE: dict[str, str] = json.load(handbook_file)
