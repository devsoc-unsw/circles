from pydantic import BaseModel
from pickle import load

from algorithms.objects.conditions import FirstCompositeCondition 

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
    school: str
    campus: str
    equivalents: dict
    exclusions: dict
    path_to: dict
    terms: list
    gen_ed: int
    path_from: dict

class Structure (BaseModel): # this is a copout - we should avoid this
    structure: dict

class UserData (BaseModel):
    program: str 
    specialisations: list
    courses: dict
    year: int

class CourseState (BaseModel):
    is_accurate: bool 
    unlocked: bool
    handbook_note: str 
    warnings: list

class CoursesState (BaseModel):
    courses_state: dict[str, CourseState] = {}

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


minorInFE = ['3778']
minorInSpecialisation = ['3502', '3970']


CONDITIONS_PATH = "algorithms/conditions.pkl"
with open(CONDITIONS_PATH, "rb") as file:
    CONDITIONS: dict[str, FirstCompositeCondition] = load(file)

flexEd = ['3778']

class description(BaseModel):
    description: str
