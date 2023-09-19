from typing import Callable
from pydantic import BaseModel

from fastapi import APIRouter, HTTPException
from server.routers.model import (
    ValidCoursesState,
    PlannerData,
    ValidPlannerData,
    ProgramTime,
)

router = APIRouter(
    prefix="/ctf", tags=["ctf"], responses={404: {"description": "Not found"}}
)
"""
# Hard Requirements for valid submission
- The Degree Plan Must be Valid and have 100% Progression
- Cannot take any discontinued courses
- 3 yr CS Degree - 3778
- Start at 2024
- Must pick a math minor
- There must be no warnings in the degree plan. This includes warnings for marks.

# Requirements
1. Must take a summer COMP course
2. Must take every single comp course with extended in the name
3. For odd terms, the sum of your course codes must be odd. Summer terms are excluded from this.
4. In even terms, it must be even. Summer terms are excluded from this.
5. Must get full marks in COMP1511
6. The course codes of Gen-Eds can't sum to more than 2200.
7. Gen-Eds must be from different faculties.
8. Must take two courses from different faculties that have the same course code.
10. In your `N`-th year, you can only take `N + 1` math courses
11. There must not be more than `6` occurrences of the number 3 in the entire degree.
"""

# Requirements
# - Complete your degree plan (I think this is in the frontend?)
# - Must take every single comp course with extended in the name (done)
# - Must take a summer COMP course (done)
# - For odd terms, the sum of your course codes must be odd. (done)
#   In even terms, it must be even.
#   Summer terms are excluded from this.
# - Must get full marks in COMP1511 (done)
# - Gen-Eds can't sum to more than 2200. (done)
# - Gen-Eds must be from different faculties. (done)
# - Must take two courses from different faculties that have the same course code. (done)
# - Must not have any warnings - including marks! (should probably do on frontend)
# - May take at most N + 1 math courses in the Nth year (done)

# Hard Requirements
# - Cannot take any discontinued courses (hard to check)
# - 3 yr CS Degree - 3778
# - Must pick a math minor
# - Start at 2024 (can't check)


def degree(data: PlannerData) -> bool:
    return data.program == "3778"


def all_courses(data: PlannerData) -> set[str]:
    return {
        course
        for year in data.plan
        for term in year
        for course in term
    }


def code(course: str) -> int:
    return int(course[4:])


def faculty(course: str) -> str:
    return course[:4]


def gen_eds(courses: set[str]) -> set[str]:
    return set(
        course
        for course in courses
        if not course.startswith("COMP") and not course.startswith("MATH")
    )


def hard_requirements(data: PlannerData) -> bool:
    # NOTE: Can't check start year from this
    # Frontend should handle most of this anyways
    # including validity of the program
    return (
        data.program == "3778"
        and "COMPA1" in data.specialisations
        and "MATHC2" in data.specialisations
        and len(data.plan) == 3
    )


def extended_courses(data: PlannerData) -> bool:
    return {
        "COMP3821",
        "COMP3891",
        "COMP6841",
        "COMP6843"
    }.issubset(all_courses(data))


def summer_course(data: PlannerData) -> bool:
    return any(
        course.startswith("COMP")
        for year in data.plan
        for course in year[0]
    )


def term_sums_even(data: PlannerData) -> bool:
    for year in data.plan:
        for i, term in enumerate(year[1:], 1):  # Exclude summer term
            if sum(map(code, term.keys())) % 2 != i % 2:
                return False

    return True

# TODO
def term_sums_odd(data: PlannerData) -> bool:
    for year in data.plan:
        for i, term in enumerate(year[1:], 1):  # Exclude summer term
            if sum(map(code, term.keys())) % 2 != i % 2:
                return False
    return True
 
def term_sums(data: PlannerData) -> bool:
    for year in data.plan:
        for i, term in enumerate(year[1:], 1):  # Exclude summer term
            if sum(map(code, term.keys())) % 2 != i % 2:
                return False

    return True


def comp1511_marks(data: PlannerData) -> bool:
    for year in data.plan:
        for term in year:
            for course in term:
                _, marks = term[course]  # type: ignore
                if course == "COMP1511":
                    return marks == 100

    return False


def gen_ed_sum(data: PlannerData) -> bool:
    return sum(map(code, gen_eds(all_courses(data)))) <= 2200


def gen_ed_faculty(data: PlannerData) -> bool:
    gen_eds_facs = list(map(faculty, gen_eds(all_courses(data))))
    return len(gen_eds_facs) == len(set(gen_eds_facs))


def same_code_diff_faculty(data: PlannerData) -> bool:
    codes = list(map(code, all_courses(data)))
    return len(codes) != len(
        set(codes)
    )  # Can't have duplicate of a course since it's a set


def math_limit(data: PlannerData) -> bool:
    for i, year in enumerate(data.plan, 1):
        num_math = len(
            [course for term in year for course in term if course.startswith("MATH")]
        )
        if num_math > i + 1:
            return False

    return True

"""
1. Must take a summer COMP course
2. Must take every single comp course with extended in the name
3. For odd terms, the sum of your course codes must be odd. Summer terms are excluded from this.
4. In even terms, it must be even. Summer terms are excluded from this.
5. Must get full marks in COMP1511
6. The course codes of Gen-Eds can't sum to more than 2200.
7. Gen-Eds must be from different faculties.
8. Must take two courses from different faculties that have the same course code.
9.
10. In your `N`-th year, you can only take `N + 1` math courses
11. There must not be more than `6` occurrences of the number 3 in the entire degree.

"""
requirements: dict[int, Callable[[PlannerData], bool]] = {
    0: hard_requirements,
    1: summer_course,
    2: extended_courses,
    3: term_sums_even, # check
    4: term_sums_odd, # check
    5: comp1511_marks,
    6: gen_ed_sum,
    7: gen_ed_faculty,
    8: same_code_diff_faculty,
    9: lambda _: True,
    10: math_limit,
    11: lambda _: True,
}

@router.post("/validateCtf/")
def validate_ctf(data : PlannerData):
    for req_num, fn in requirements.items():
        if not fn(data):
            return {"valid": False, "req_num": req_num}
    return {"valid": True, "req_num": -1}

@router.post("/test")
def test_do_validate(data: PlannerData):
    return {
        "valid": True,
        "req_num": -1,
    }
