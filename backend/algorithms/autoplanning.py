""" an autoplanning solver which takes in courses and spits a plan """
from typing import Tuple
from ortools.sat.python import cp_model # type: ignore
from algorithms.objects.course import Course
from algorithms.objects.user import User
from algorithms.objects.conditions import CompositeCondition, ProgramCondition, SpecialisationCondition
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

def autoplan(courses: list[Course], user: User, start: Tuple[int, int], end: Tuple[int, int], uoc_max: list[int]):
    model = cp_model.CpModel()
    # enforces terms
    variables = [model.NewIntVarFromDomain(cp_model.Domain.FromIntervals(course.term_domain(start, end)), course.name) for course in courses]
    # set max UOC for a term
    for index, m in enumerate(uoc_max):
        booleanIndexes = []
        for v in variables:
            b = model.NewBoolVar('hi')
            model.Add(v == index).OnlyEnforceIf(b)
            model.Add(v != index).OnlyEnforceIf(b.Not())
            booleanIndexes.append(b)
        model.AddReservoirConstraintWithActive(variables, list(map_var_to_course(courses, var).uoc for var in variables), booleanIndexes, 0, m)

    # enforce prereqs
    for course in courses:
        course.condition.condition_to_model(model, user, variables, map_course_to_var(course, variables))

    solver = cp_model.CpSolver()
    status = solver.Solve(model)
    if status not in [cp_model.INFEASIBLE, cp_model.MODEL_INVALID]:
        for v in variables:
            print(f'{v.Name()}: {solver.Value(v)}')
    else:
        # 1 is invalid
        # 3 is infeasible
        print(status)

if __name__ == '__main__':
    test_cond = CompositeCondition(Logic.AND)
    test_cond.add_condition(ProgramCondition("3707"))
    test_cond.add_condition(SpecialisationCondition("COMPA1"))
    autoplan(
        [
            Course("COMP1511", CONDITIONS["COMP1511"], 65, 6, {2022: [1, 2, 3]}),
            Course("COMP1521", CONDITIONS["COMP1521"], 65, 6, {2022: [1, 2, 3]}),
        ],
        User({
            "program": "3778",
            "specialisations" : ["COMPA1"],
            "courses": {}
        }),
        (2022, 0),
        (2022, 3),
        [10, 20, 20, 20]
    )
