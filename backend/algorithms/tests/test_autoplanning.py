from algorithms.autoplanning import autoplan, terms_between
from algorithms.objects.course import Course
from algorithms.objects.user import User
from server.routers.model import CONDITIONS, ValidPlannerData

def get_uoc(course_name: str, courses: list[Course]):
    return [course.uoc for course in courses if course_name == course.name][0]

def test_basic_CS_autoplanning():
    uoc_max = [12, 20, 20, 20, 12, 20, 20, 20, 10, 20, 20, 20]
    courses = [
            Course("MATH1141", CONDITIONS["MATH1141"], 65, 6, {2020: [1, 3], 2021: [1, 3], 2022: [1, 3]}),
            Course("MATH1081", CONDITIONS["MATH1081"], 65, 6, {2020: [1, 2, 3], 2021: [1, 2, 3], 2022: [1, 2, 3]}),
            Course("COMP1511", CONDITIONS["COMP1511"], 65, 6, {2020: [1, 2, 3], 2021: [1, 2, 3], 2022: [1, 2, 3]}),
            Course("COMP2521", CONDITIONS["COMP2521"], 65, 6, {2020: [2, 3], 2021: [2, 3], 2022: [2, 3]}),
            Course("COMP2041", CONDITIONS["COMP2041"], 65, 6, {2020: [2], 2021: [2], 2022: [2]}),
            Course("COMP1531", CONDITIONS["COMP1531"], 65, 6, {2020: [1, 3], 2021: [1, 3], 2022: [1, 3]}),
            Course("COMP1521", CONDITIONS["COMP1521"], 65, 6, {2020: [1, 2], 2021: [1, 2], 2022: [1, 2]}),
            Course("ENGG2600", CONDITIONS["ENGG2600"], 65, 2, {2020: [1, 2, 3], 2021: [1, 2, 3], 2022: [1, 2, 3]}),
            Course("ENGG2600", CONDITIONS["ENGG2600"], 65, 2, {2020: [1, 2, 3], 2021: [1, 2, 3], 2022: [1, 2, 3]}),
            Course("ENGG2600", CONDITIONS["ENGG2600"], 65, 2, {2020: [1, 2, 3], 2021: [1, 2, 3], 2022: [1, 2, 3]}),
            Course("COMP2511", CONDITIONS["COMP2511"], 65, 6, {2020: [2, 3], 2021: [2, 3], 2022: [2, 3]}),
            Course("MATH1241", CONDITIONS["MATH1141"], 65, 6, {2020: [2, 3], 2021: [2, 3], 2022: [2, 3]}),
            Course("MATH3411", CONDITIONS["MATH3411"], 65, 6, {2020: [3], 2021: [3], 2022: [3]}),
            Course("COMP3411", CONDITIONS["COMP3411"], 65, 6, {2020: [3], 2021: [0], 2022: [0]}),
            Course("COMP6841", CONDITIONS["COMP6841"], 65, 6, {2020: [1], 2021: [1], 2022: [1]}),
            Course("COMP3231", CONDITIONS["COMP3231"], 65, 6, {2020: [1], 2021: [1], 2022: [1]}),
            Course("COMP3141", CONDITIONS["COMP3141"], 65, 6, {2020: [2], 2021: [2], 2022: [2]}),
            Course("COMP3121", CONDITIONS["COMP3121"], 65, 6, {2020: [2, 3], 2021: [2, 3], 2022: [2, 3]}),
            Course("COMP3131", CONDITIONS["COMP3131"], 65, 6, {2020: [1], 2021: [1], 2022: [1]}),
            Course("COMP4141", CONDITIONS["COMP4141"], 65, 6, {2020: [1], 2021: [1], 2022: [1]}),
            Course("COMP3311", CONDITIONS["COMP3311"], 65, 6, {2020: [1, 2, 3], 2021: [1, 2, 3], 2022: [1, 2, 3]}),
            Course("ARTS1360", CONDITIONS["ARTS1360"], 65, 6, {2020: [2], 2021: [2], 2022: [2]}),
        ]
    res = autoplan(
        courses,
        User({
            "program": "3778",
            "specialisations" : ["COMPA1"],
            "courses": {}
        }),
        (2020, 0),
        (2023, 3),
        uoc_max
    )

    assert isinstance(res, list) # is feasible
    assert len(courses) == len(res) # all courses listed
    # never breach UOC
    for index, number in enumerate(uoc_max):
        course_names = [course[0] for course in res if terms_between((2020, 0), course[1]) == index]
        assert number >= sum(get_uoc(course_name, courses) for course_name in course_names)
    # all courses valid
    ValidPlannerData(
        program="3778",
        specialisations=["COMPA1"],
        mostRecentPastTerm={
            "Y": 1,
            "T": 0
        },
        plan={

        }
    )