""" an autoplanning solver which takes in courses and spits a plan """
from typing import Tuple
from ortools.sat.python import cp_model # type: ignore
from algorithms.objects.course import Course
from algorithms.objects.user import User
from .validate_term_planner import validate_terms
from server.routers.model import CONDITIONS, ValidPlannerData


def terms_between(start: Tuple[int, int], end: Tuple[int, int]):
    return (end[1] - start[1]) * 4 + end[0] - start[0]

def map_var_to_course(courses: list[Course], var):
    return [course for course in courses if course.name == var.Name()][0]


def autoplan(courses: list[Course], user, start: Tuple[int, int], end: Tuple[int, int], uoc_max: list[int]):
    model = cp_model.CpModel()
    num_terms = terms_between(start, end)
    variables = [model.NewIntVar(0, num_terms, course.name) for course in courses]
    for index, m in enumerate(uoc_max):
        constant = model.NewConstant(index)
        model.AddAtMostOne(map_var_to_course(courses, variable).uoc / m for variable in variables if constant == variable)
    # model.Add(prereq_constraint(variables, courses, user, uoc_max) == True)

    solver = cp_model.CpSolver()
    status = solver.Solve(model)
    print(status == cp_model.INFEASIBLE)
    if (status == cp_model.OPTIMAL or status == cp_model.FEASIBLE):
        for v in variables:
            print(*f'{v.Name()}: {solver.Value(v)}')

if __name__ == '__main__':
    autoplan(
        [
            Course("COMP1511", CONDITIONS["COMP1511"], 65, 6, {2022: [1, 2, 3]}),
            Course("COMP1521", CONDITIONS["COMP1521"], 75, 6, {2022: [2, 3]})
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
