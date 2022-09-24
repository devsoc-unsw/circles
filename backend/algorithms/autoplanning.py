""" an autoplanning solver which takes in courses and spits a plan """
from typing import Tuple
from ortools.sat.python import cp_model # type: ignore
from algorithms.objects.course import Course
from algorithms.objects.user import User
from algorithms.objects.conditions import CompositeCondition, ProgramCondition, SpecialisationCondition, UOCCondition
from algorithms.objects.helper import Logic
from .validate_term_planner import validate_terms
from server.routers.model import CONDITIONS
# Inspired by AbdallahS's code here: https://github.com/AbdallahS/planner
# with help from Martin and MJ :)

def terms_between(start: Tuple[int, int], end: Tuple[int, int]):
    return (end[0] - start[0]) * 4 + end[1] - start[1]

def map_var_to_course(courses: list[Course], var: cp_model.IntVar):
    return [course for course in courses if course.name == var.Name()][0]

def map_course_to_var(course: Course, variables: list[cp_model.IntVar]):
    return [variable for variable in variables if course.name == variable.Name()][0]

def convert_to_term_year(number: int, start: Tuple[int, int]):
    return (number // 4 + start[0], number % 4 + start[1])

def autoplan(courses: list[Course], user: User, start: Tuple[int, int], end: Tuple[int, int], uoc_max: list[int]):
    # TODO: add a way to lock in courses
    model = cp_model.CpModel()
    # enforces terms
    variables = [model.NewIntVarFromDomain(cp_model.Domain.FromIntervals(course.term_domain(start, end)), course.name) for course in courses]
    # if any courses are named the same, then they must be taken consecutively
    course_names = [course.name for course in courses]
    duplicate_courses = set(c for c in course_names if course_names.count(c) > 1)
    for dupe in duplicate_courses:
        matched_courses = [variable for variable in variables if variable.Name() == dupe]
        for match, next_match in zip(matched_courses, matched_courses[1:]):
            model.Add(match + 1 == next_match)

    # set max UOC for a term
    for index, m in enumerate(uoc_max):
        boolean_indexes = []
        for v in variables:
            b = model.NewBoolVar('hi')
            model.Add(v == index).OnlyEnforceIf(b)
            model.Add(v != index).OnlyEnforceIf(b.Not())
            boolean_indexes.append(b)
        model.AddReservoirConstraintWithActive(variables, list(map_var_to_course(courses, var).uoc for var in variables), boolean_indexes, 0, m)

    # enforce prereqs
    for course in courses:
        course.condition.condition_to_model(model, user, list((variable, map_var_to_course(courses, variable)) for variable in variables), map_course_to_var(course, variables))

    solver = cp_model.CpSolver()
    status = solver.Solve(model)
    if status not in [cp_model.INFEASIBLE, cp_model.MODEL_INVALID]:
        for v in variables:
            print(f'{v.Name()}: {convert_to_term_year(solver.Value(v), start)}')
    else:
        # 1 is invalid
        # 3 is infeasible
        print(status)

if __name__ == '__main__':
    autoplan(
        [
            Course("MATH1141", CONDITIONS["MATH1141"], 65, 6, {2020: [1, 3]}),
            Course("MATH1081", CONDITIONS["MATH1081"], 65, 6, {2020: [1, 2, 3]}),
            Course("COMP1511", CONDITIONS["COMP1511"], 65, 6, {2020: [1, 2, 3]}),
            Course("COMP2521", CONDITIONS["COMP2521"], 65, 6, {2020: [2, 3]}),
            Course("COMP2041", CONDITIONS["COMP2041"], 65, 6, {2020: [2]}),
            Course("COMP1531", CONDITIONS["COMP1531"], 65, 6, {2020: [1, 3]}),
            Course("COMP1521", CONDITIONS["COMP1521"], 65, 6, {2020: [1, 2]}),
            Course("ENGG2600", CONDITIONS["ENGG2600"], 65, 2, {2021: [1, 2, 3]}),
            Course("ENGG2600", CONDITIONS["ENGG2600"], 65, 2, {2021: [1, 2, 3]}),
            Course("ENGG2600", CONDITIONS["ENGG2600"], 65, 2, {2021: [1, 2, 3]}),
            Course("COMP2511", CONDITIONS["COMP2511"], 65, 6, {2020: [2, 3], 2021: [2, 3]}),
            Course("MATH1241", CONDITIONS["MATH1141"], 65, 6, {2020: [2, 3]}),
            Course("MATH3411", CONDITIONS["MATH3411"], 65, 6, {2020: [3]}),
            Course("COMP3411", CONDITIONS["COMP3411"], 65, 6, {2021: [0]}),
            Course("COMP6841", CONDITIONS["COMP6841"], 65, 6, {2021: [1]}),
            Course("COMP3231", CONDITIONS["COMP3231"], 65, 6, {2021: [1]}),
            Course("COMP3141", CONDITIONS["COMP3141"], 65, 6, {2021: [2]}),
            Course("COMP3121", CONDITIONS["COMP3121"], 65, 6, {2021: [2, 3]}),
            Course("COMP3131", CONDITIONS["COMP3131"], 65, 6, {2022: [1]}),
            Course("COMP4141", CONDITIONS["COMP4141"], 65, 6, {2022: [1]}),
            Course("COMP3311", CONDITIONS["COMP3311"], 65, 6, {2022: [1, 2, 3]}),
            Course("ARTS1360", CONDITIONS["ARTS1360"], 65, 6, {2022: [2]}),
        ],
        User({
            "program": "3778",
            "specialisations" : ["COMPA1"],
            "courses": {}
        }),
        (2020, 0),
        (2023, 3),
        [12, 20, 20, 20, 12, 20, 20, 20, 10, 20, 20, 20]
    )
