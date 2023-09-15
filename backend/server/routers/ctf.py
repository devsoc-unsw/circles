from pydantic import BaseModel

from fastapi import APIRouter, HTTPException
from server.routers.model import (ValidCoursesState, PlannerData,
                                ValidPlannerData, ProgramTime)

router = APIRouter(
    prefix="/planner", tags=["planner"], responses={404: {"description": "Not found"}}
)

# Requirements
# - Complete your degree plan (kinda hard to check from json)
# - Must take every single comp course with extended in the name (done)
# - Must take a summer COMP course (done)
# - For odd terms, the sum of your course codes must be odd. (done)
#   In even terms, it must be even.
#   Summer terms are excluded from this.
# - Must get full marks in COMP1511 (can't do with exported json)
# - Gen-Eds can't sum to more than 2200. (done)
# - Gen-Eds must be from different faculties. (done)
# - Must take two courses from different faculties that have the same course code. (done)
# - Must not have any warnings - including marks! (can't do with exported json)
# - May take at most N + 1 math courses in the Nth year

# Hard Requirements
# - Cannot take any discontinued courses (hard to check)
# - 3 yr CS Degree - 3778 (can't check)
# - Must pick a math minor (can't check)
# - Start at 2024 (done)

class ExportedData(BaseModel):
    startYear: str
    numYears: int
    isSummerEnabled: bool
    years: list[dict[str, list[str]]]
    version: int  # unused


def all_courses(data: ExportedData) -> set[str]:
    return set(course for year in data.years for term in year.values() for course in term)


def code(course: str) -> int:
    return int(course[4:])


def faculty(course: str) -> str:
    return course[:4]


def gen_eds(courses: set[str]) -> set[str]:
    return set(course for course in courses if not course.startswith("COMP") and not course.startswith("MATH"))


def hard_requirements(data: ExportedData) -> bool:
    return data.startYear == "2024" and data.numYears == 3


def extended_courses(data: ExportedData) -> bool:
    return {"COMP3821", "COMP3891", "COMP6841", "COMP6843"} - all_courses(data) == set()


def summer_course(data: ExportedData) -> bool:
    return data.isSummerEnabled and any(course.startswith("COMP") for year in data.years for course in year["T0"])


def term_sums(data: ExportedData) -> bool:
    for year in data.years:
        for term, courses in year.items():
            if term != "T0":
                if sum(map(code, courses)) % 2 != (term in {"T1", "T3"}):
                    return False

    return True


def gen_ed_sum(data: ExportedData) -> bool:
    return sum(map(code, gen_eds(all_courses(data)))) <= 2200


def gen_ed_faculty(data: ExportedData) -> bool:
    gen_eds_facs = list(map(faculty, gen_eds(all_courses(data))))
    return len(gen_eds_facs) == len(set(gen_eds_facs))


def same_code_diff_faculty(data: ExportedData) -> bool:
    codes = list(map(code, all_courses(data)))
    return len(codes) == len(set(codes))  # Can't have duplicate of a course since it's a set


def math_limit(data: ExportedData) -> bool:
    for i, year in enumerate(data.years, 1):
        num_math = len([course for term in year.values() for course in term if course.startswith("MATH")])
        if num_math > i + 1:
            return False
    
    return True


@router.post("/validateCtf/")
def validate_ctf(data: ExportedData):
    pass
