"""Helper utilities for planner autoplan routing."""

from collections import Counter
from typing import Optional

from fastapi import HTTPException

from algorithms.autoplanning import autoplan, terms_between
from algorithms.objects.user import User
from server.routers.model import ProgramTime, Storage
from server.routers.utility.common import get_course_object
from server.routers.utility.user import user_storage_to_algo_user

DEFAULT_TERM_UOC_LIMITS = {
    0: 12,
    1: 20,
    2: 20,
    3: 20,
}


class AutoplanSolveResult:
    """Container for solver output and normalized plan shape."""

    def __init__(self, solved_courses: list[tuple[str, tuple[int, int]]], plan: list[dict[str, list[str]]]):
        self.solved_courses = solved_courses
        self.plan = plan


def build_program_time(
    user: Storage,
    end_time: tuple[int, int],
    uoc_max_override: Optional[list[int]] = None,
) -> ProgramTime:
    start_year = user['planner']['startYear']
    start_time = (start_year, 0)

    # Validate end_time
    term_count = terms_between(start_time, end_time) + 1

    if uoc_max_override is not None:
        uoc_max = uoc_max_override
    else:
        uoc_max = [
            DEFAULT_TERM_UOC_LIMITS[(start_time[1] + index) % 4]
            for index in range(term_count)
        ]

    if not user['planner']['isSummerEnabled']:
        for index in range(term_count):
            term_index = (start_time[1] + index) % 4
            if term_index == 0:
                uoc_max[index] = 0

    return ProgramTime(startTime=start_time, endTime=end_time, uocMax=uoc_max)


def _build_solver_courses(
    user: Storage,
    algo_user: User,
    program_time: ProgramTime,
    course_codes: list[str],
    lock_existing_planned: bool,
):
    """Build list of Course objects for solver, respecting lock_existing_planned flag."""
    solver_courses = [
        get_course_object(code, program_time, mark=algo_user.get_grade(code))
        for code in course_codes
    ]

    if not lock_existing_planned:
        return solver_courses

    # Include existing planned courses as locked constraints
    selected_codes = Counter(course_codes)
    for row_index, year in enumerate(user['planner']['years']):
        absolute_year = user['planner']['startYear'] + row_index
        for term_index in range(4):
            term_name = f'T{term_index}'
            for code in year[term_name]:
                if selected_codes[code] > 0:
                    selected_codes[code] -= 1
                    continue
                # Lock this course to its current placement
                locked_course = get_course_object(code, program_time, (absolute_year, term_index), algo_user.get_grade(code))
                solver_courses.append(locked_course)

    return solver_courses


def _remove_selected_courses(user: Storage, selected_codes: list[str]) -> None:
    """Remove selected codes from unplanned list."""
    selected_counter = Counter(selected_codes)
    for code, count in selected_counter.items():
        if code in user['planner']['unplanned']:
            removed = 0
            next_unplanned: list[str] = []
            for unplanned_code in user['planner']['unplanned']:
                if unplanned_code == code and removed < count:
                    removed += 1
                    continue
                next_unplanned.append(unplanned_code)
            user['planner']['unplanned'] = next_unplanned


def _remove_existing_placements(user: Storage, solved_courses: list[tuple[str, tuple[int, int]]]) -> None:
    """Remove existing placements of solved courses from planner."""
    placements = Counter(course for course, _ in solved_courses)
    for code, placement_count in placements.items():
        remaining = placement_count
        for planned_year in user['planner']['years']:
            if remaining == 0:
                break
            for term_name in ('T0', 'T1', 'T2', 'T3'):
                if remaining == 0:
                    break
                new_term_courses: list[str] = []
                for planned_code in planned_year[term_name]:
                    if planned_code == code and remaining > 0:
                        remaining -= 1
                        continue
                    new_term_courses.append(planned_code)
                planned_year[term_name] = new_term_courses


def _add_solved_courses(user: Storage, solved_courses: list[tuple[str, tuple[int, int]]]) -> None:
    """Add solved courses to their assigned placements in planner."""
    for course, (year, term) in solved_courses:
        year_index = year - user['planner']['startYear']
        term_name = f'T{term}'
        user['planner']['years'][year_index][term_name].append(course)


def apply_autoplan_to_storage(
    user: Storage,
    solved_courses: list[tuple[str, tuple[int, int]]],
    selected_codes: list[str],
) -> None:
    """Apply autoplan solution to user storage by removing and adding courses."""
    _remove_selected_courses(user, selected_codes)
    _remove_existing_placements(user, solved_courses)
    _add_solved_courses(user, solved_courses)


def solve_and_apply_autoplan(
    user: Storage,
    course_codes: list[str],
    end_time: tuple[int, int],
    lock_existing_planned: bool,
) -> AutoplanSolveResult:
    """Solve autoplan request and apply to user storage."""

    algo_user = user_storage_to_algo_user(user)
    program_time = build_program_time(user, end_time)

    solver_courses = _build_solver_courses(
        user,
        algo_user,
        program_time,
        course_codes,
        lock_existing_planned,
    )
    try:
        solved = autoplan(
            solver_courses,
            algo_user,
            program_time.startTime,
            program_time.endTime,
            program_time.uocMax,
        )
    except ValueError as err:
        raise HTTPException(status_code=400, detail=str(err)) from err

    apply_autoplan_to_storage(user, solved, course_codes)

    plan_years = program_time.endTime[0] - program_time.startTime[0] + 1
    plan: list[dict[str, list[str]]] = [{} for _ in range(plan_years)]
    for course, (year_autoplanned, term_autoplanned) in solved:
        plan[year_autoplanned - program_time.startTime[0]].setdefault(
            f'T{term_autoplanned}',
            [],
        ).append(course)

    return AutoplanSolveResult(solved_courses=solved, plan=plan)
