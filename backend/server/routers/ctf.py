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
    courses = set()
    for year in data.plan:
        for term in year:
            for course in term:
                courses.add(course)

    return courses


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
    return (
        data.program == "3778"
        and "COMPA1" in data.specialisations
        and "MATHC2" in data.specialisations
        and len(data.plan) == 3
        # NOTE: Can't check start year from this
    )


def extended_courses(data: PlannerData) -> bool:
    return {"COMP3821", "COMP3891", "COMP6841", "COMP6843"} - all_courses(data) == set()


def summer_course(data: PlannerData) -> bool:
    return any(course.startswith("COMP") for year in data.plan for course in year[0])


def term_sums(data: PlannerData) -> bool:
    for year in data.plan:
        for i, term in enumerate(year[1:], 1):  # Exclude summer term
            if sum(map(code, term.keys())) % 2 != i % 2:
                return False

    return True


def COMP1511_marks(data: PlannerData) -> bool:
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


@router.post("/validateCtf/")
def validate_ctf(data: PlannerData):
    print(data)
    print(f"{hard_requirements(data) = }")
    print(f"{extended_courses(data) = }")
    print(f"{summer_course(data) = }")
    print(f"{term_sums(data) = }")
    print(f"{COMP1511_marks(data) = }")
    print(f"{gen_ed_sum(data) = }")
    print(f"{gen_ed_faculty(data) = }")
    print(f"{same_code_diff_faculty(data) = }")
    print(f"{math_limit(data) = }")
