""" model for interacting with the FE """
# pylint: disable=missing-class-docstring
import json
from pickle import load
from typing import Optional

from algorithms.objects.conditions import CompositeCondition
from pydantic import BaseModel


class message(BaseModel):
    message: str


class programs(BaseModel):
    programs: dict


class Majors(BaseModel):
    majors: dict


class minors(BaseModel):
    minors: dict


class ProgramCourses(BaseModel):
    courses: dict


class CourseDetails(BaseModel):
    title: str
    code: str
    UOC: int
    level: int
    description: str
    study_level: str
    school: Optional[str]
    campus: str
    equivalents: dict
    raw_requirements: str
    exclusions: dict
    handbook_note: str
    terms: list
    gen_ed: int
    is_legacy: bool
    is_accurate: bool


class Structure(BaseModel):  # this is a copout - we should avoid this
    structure: dict


class UserData(BaseModel):
    program: str
    specialisations: dict
    courses: dict
    year: int


class CourseState(BaseModel):
    is_accurate: bool
    unlocked: bool
    handbook_note: str
    warnings: list

class ValidCourseState(BaseModel):
    is_accurate: bool
    unlocked: bool
    handbook_note: str
    warnings: list
    supressed: bool

class CoursesState(BaseModel):
    courses_state: dict[str, CourseState] = {}

class ValidCoursesState(BaseModel):
    courses_state: dict[str, ValidCourseState] = {}

class CoursesUnlockedWhenTaken (BaseModel):
    direct_unlock: list
    indirect_unlock: list

class CourseTypeState(BaseModel):
    is_accurate: bool
    unlocked: bool
    handbook_note: str
    warnings: list
    course_type: list[str]


class CoursesTypeState(BaseModel):
    courses_state: dict[str, CourseTypeState] = {}


class PlannerData(BaseModel):
    program: str
    specialisations: list[str]
    year: int
    plan: list[list[dict]]
    mostRecentPastTerm: dict

class Courses (BaseModel):
    courses: list[str]

class CoursesPath (BaseModel):
    original: str
    courses: list[str]

minorInFE = ["3778"]
minorInSpecialisation = ["3502", "3970"]


CONDITIONS_PATH = "algorithms/conditions.pkl"
with open(CONDITIONS_PATH, "rb") as file:
    CONDITIONS: dict[str, CompositeCondition] = load(file)

with open("algorithms/cache/handbook_note.json", "r", encoding="utf8") as file:
    CACHED_HANDBOOK_NOTE: dict[str, str] = json.load(file)

class description(BaseModel):
    description: str
