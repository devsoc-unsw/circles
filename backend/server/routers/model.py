from typing import Optional
from pydantic import BaseModel
from pickle import load
import json

from algorithms.objects.conditions import CompositeCondition 

class message (BaseModel):
    message: str

class programs (BaseModel):
    programs: dict

class majors (BaseModel):
    majors: dict

class minors (BaseModel):
    minors: dict

class programCourses (BaseModel):
    courses: dict

class courseDetails (BaseModel):
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
    path_to: dict
    terms: list
    gen_ed: int
    path_from: dict

class Structure (BaseModel): # this is a copout - we should avoid this
    structure: dict

class UserData (BaseModel):
    program: str 
    specialisations: dict
    courses: dict
    year: int

class CourseState (BaseModel):
    is_accurate: bool 
    unlocked: bool
    handbook_note: str 
    warnings: list

class CoursesState (BaseModel):
    courses_state: dict[str, CourseState] = {}

class CoursesUnlockedWhenTaken (BaseModel):
    courses_unlocked_when_taken: list

class CourseTypeState (BaseModel):
    is_accurate: bool 
    unlocked: bool
    handbook_note: str 
    warnings: list
    course_type: list[str]

class CoursesTypeState (BaseModel):
    courses_state: dict[str, CourseTypeState] = {}

class PlannerData (BaseModel):
    program: str
    specialisations: list[str]
    year: int
    plan: list[list[dict]]

class AffectedCourses (BaseModel):
    affected_courses: list[str]

minorInFE = ['3778']
minorInSpecialisation = ['3502', '3970']


CONDITIONS_PATH = "algorithms/conditions.pkl"
with open(CONDITIONS_PATH, "rb") as file:
    CONDITIONS: dict[str, CompositeCondition] = load(file)

with open("algorithms/cache/handbook_note.json", "r") as file:
    CACHED_HANDBOOK_NOTE: dict[str, str] = json.load(file)

flexEd = ['3778']

class description(BaseModel):
    description: str


