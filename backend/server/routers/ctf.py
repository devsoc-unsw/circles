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

def degree(data: PlannerData) -> bool:
    return data.program == "3778"


def all_courses(data: PlannerData) -> set[str]:
    return {
        course
        for year in data.plan
        for term in year
        for course in term
    }


def get_code(course: str) -> int:
    return int(course[4:])


def get_faculty(course: str) -> str:
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
        # and "COMPA1" in data.specialisations
        # and "MATHC2" in data.specialisations
        # and len(data.plan) == 3
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
    is_even: Callable[[int], bool] = lambda x: x % 2 == 0
    print("Checking even")
    for y, year in enumerate(data.plan):
        # Exclude summer term + odd terms
        for i, term in enumerate(year[2::2], 2):
            term_sum = sum(map(get_code, term.keys()))
            print(f"{y}T{i} sum: {term_sum}")
            if not is_even(term_sum):
                print("failed: ", term)
                return False

    return True

# TODO
def term_sums_odd(data: PlannerData) -> bool:
    is_odd: Callable[[int], bool] = lambda x: x % 2 == 1
    print("Checking odd")
    for y, year in enumerate(data.plan[::2]):
        # Exclude summer term + even terms
        for i, term in enumerate(year[1::2], 2):
            term_sum = sum(map(get_code, term.keys()))
            print(f"{y}T{i} sum: {sum(map(get_code, term.keys()))}")
            if not is_odd(sum(map(get_code, term.keys()))):
                print("failed: ", term)
                return False
    return True
 
def term_sums(data: PlannerData) -> bool:
    for year in data.plan:
        for i, term in enumerate(year[2::2], 1):
            if sum(map(get_code, term.keys())) % 2 != i % 2:
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
    return sum(map(get_code, gen_eds(all_courses(data)))) <= 2200


def gen_ed_faculty(data: PlannerData) -> bool:
    gen_eds_facs = list(map(get_faculty, gen_eds(all_courses(data))))
    return len(gen_eds_facs) == len(set(gen_eds_facs))


def same_code_diff_faculty(data: PlannerData) -> bool:
    codes = list(map(get_code, all_courses(data)))
    # Can't have duplicate of a course since it's a set
    return len(codes) != len(
        set(codes)
    )


def math_limit(data: PlannerData) -> bool:
    for i, year in enumerate(data.plan, 1):
        num_math = len(
            [course for term in year for course in term if course.startswith("MATH")]
        )
        if num_math > i + 1:
            return False

    return True

def six_threes_limit(data: PlannerData) -> bool:
    all_codes = "".join(str(get_code(course)) for course in all_courses(data))
    return all_codes.count("3") <= 6

def comp1531_third_year(data: PlannerData) -> bool:
    third_year = data.plan[2]
    for term in third_year:
        for course in term:
            if course == "COMP1531":
                return True

    return False

"""
1. Must take a summer COMP course
2. Must take every single comp course with extended in the name
3. For odd terms, the sum of your course codes must be odd. Summer terms are excluded from this.
4. In even terms, it must be even. Summer terms are excluded from this.
5. Must get full marks in COMP1511
6. The course codes of Gen-Eds can't sum to more than 2200.
7. Gen-Eds must be from different faculties.
8. Must take two courses from different faculties that have the same course code.
9. COMP1531 must be taken in your third year.
10. In your `N`-th year, you can only take `N + 1` math courses
11. There must not be more than `6` occurrences of the number 3 in the entire degree.
"""
requirements: list[tuple[Callable[[PlannerData], bool], str]] = [
    # The following are conditions placed on Ollie's enrolment by the university and
    # the providers of their scholarship.
    (hard_requirements, "Before you can submit, you must check that you are in a 3 year CS degree and have a math minor"),
    (summer_course, "Ollie must take one summer COMP course."),
    (comp1511_marks, "To keep their scholarship, Ollie must achieve a mark of 100 in COMP1511."),
    (extended_courses, "Ollie must complete ALL COMP courses with extended in the name that have not been discontinued. Hint: there are 4."),
    # The following reflect changes made to University Policy after Ollie's enrolment.
    (comp1531_third_year, "Unable to find a partner earlier, Ollie must take COMP1531 in their third year."),
    (gen_ed_faculty, "The university has decided that General Education must be very general. As such, each Gen-Ed unit that Ollie takes must be from a different faculty."),
    (math_limit, "The university has become a big believer in spaced repetition and want to prevent students from cramming subjects for their minors. Now, in their N-th year, Ollie can only take N + 1 math courses."),
    (gen_ed_sum, "Course codes now reflect the difficulty of a course. To avoid extremely stressful terms, the sum of Olli's Gen-Ed course codes must not exceed 2200."),
    # Ollie has joined the number theory club and has developed superstitions about
    # certain numbers
    (same_code_diff_faculty, "You must take two courses from different faculties that have the same course code."),
    (term_sums_even, "You must ensure that the sum of your course codes in even terms is even. Note that summer courses do not count towards this."),
    (term_sums_odd, "You must ensure that the sum of your course codes in odd terms is odd. Note that summer courses do not count towards this."),
    (six_threes_limit, "In all your course codes, there can be at most 6 occurrences of the number 3"),
]

@router.post("/validateCtf/")
def validate_ctf(data : PlannerData):
    passed: list[str] = []
    for req_num, (fn, msg) in enumerate(requirements):
        if not fn(data):
            return {
                "valid": False,
                "passed": passed,
                "failed": req_num,
                "message": msg
            }
        passed.append(msg)
        print("Ok: ", req_num)
    return {
        "valid": True,
        "failed": -1,
        "passed": passed,
        "message": "Congratulations! You have passed all the requirements for the CTF." 
    }

