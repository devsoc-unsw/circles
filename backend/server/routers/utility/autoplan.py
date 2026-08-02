"""Helper utilities for planner autoplan routing."""

from dataclasses import dataclass
from typing import Optional

from fastapi import HTTPException

from algorithms.autoplanning import autoplan
from algorithms.objects.user import User
from server.routers.model import ProgramTime, Storage
from server.routers.utility.common import get_course_details, get_course_object, get_multiterm_instance_count
from server.routers.utility.planner_terms import build_autoplan_uoc_max, validate_term_exists
from server.routers.utility.user import iter_storage_planned_course_placements, user_storage_to_algo_user


@dataclass
class AutoplanSolveResult:
    """Container for solver output and normalized plan shape."""
    solved_courses: list[tuple[str, tuple[int, int]]]
    plan: list[dict[str, list[str]]]


def build_program_time(
    user: Storage,
    end_time: tuple[int, int],
    uoc_max_override: Optional[list[int]] = None,
) -> ProgramTime:
    start_year = user['planner']['startYear']
    start_time = (start_year, 0)

    # Reject end terms that don't exist in the end year, e.g. T3 from 2028
    validate_term_exists(end_time[0], f'T{end_time[1]}', is_summer_enabled=True)

    uoc_max = uoc_max_override if uoc_max_override is not None else build_autoplan_uoc_max(
        start_year,
        end_time,
        user['planner']['isSummerEnabled'],
    )

    return ProgramTime(startTime=start_time, endTime=end_time, uocMax=uoc_max)


def _build_solver_courses(
    user: Storage,
    algo_user: User,
    program_time: ProgramTime,
    unplanned_courses: list[str],
):
    """Build solver courses from unplanned targets plus locked planned placements."""

    def expanded_target_codes() -> list[str]:
        # Unplanned codes are unique. Expand multiterm courses into required instances.
        expanded: list[str] = []
        for code in unplanned_courses:
            expanded.extend([code] * get_multiterm_instance_count(
                get_course_details(code),
                user['planner']['isSummerEnabled'],
            ))

        return expanded

    solver_courses = [
        get_course_object(code, program_time, mark=algo_user.get_grade(code))
        for code in expanded_target_codes()
    ]

    # Include existing planned courses as locked constraints.
    solver_courses.extend(
        get_course_object(code, program_time, placement, algo_user.get_grade(code))
        for code, placement in iter_storage_planned_course_placements(user)
    )

    return solver_courses


def apply_autoplan_to_storage(
    user: Storage,
    solved_courses: list[tuple[str, tuple[int, int]]],
) -> None:
    """Overwrite planner terms from solver output and clear unplanned courses."""
    term_count = len(user['planner']['years'])
    rebuilt_years: list[dict[str, list[str]]] = [
        {
            'T0': [],
            'T1': [],
            'T2': [],
            'T3': [],
        }
        for _ in range(term_count)
    ]

    for course, (year, term) in solved_courses:
        year_index = year - user['planner']['startYear']
        term_name = f'T{term}'
        rebuilt_years[year_index][term_name].append(course)

    user['planner']['years'] = rebuilt_years
    user['planner']['unplanned'] = []


def solve_and_apply_autoplan(
    user: Storage,
    unplanned_courses: list[str],
    end_time: tuple[int, int],
) -> AutoplanSolveResult:
    """Solve autoplan request and apply to user storage."""

    algo_user = user_storage_to_algo_user(user)
    program_time = build_program_time(user, end_time)

    solver_courses = _build_solver_courses(
        user,
        algo_user,
        program_time,
        unplanned_courses,
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

    apply_autoplan_to_storage(user, solved)

    plan_years = program_time.endTime[0] - program_time.startTime[0] + 1
    plan: list[dict[str, list[str]]] = [{} for _ in range(plan_years)]
    for course, (year_autoplanned, term_autoplanned) in solved:
        plan[year_autoplanned - program_time.startTime[0]].setdefault(
            f'T{term_autoplanned}',
            [],
        ).append(course)

    return AutoplanSolveResult(solved_courses=solved, plan=plan)
