# assumes that getPrograms, getMajors, and getMinors isnt borked.
import requests
from hypothesis import given
from hypothesis.strategies import DrawFn, composite, sampled_from

programs = [
    *requests.get("http://127.0.0.1:8000/programs/getPrograms")
    .json()["programs"]
    .keys()
]


@composite
def major_minor_for_program(draw: DrawFn):
    program = draw(sampled_from(programs))
    majorRequest = requests.get(f"http://127.0.0.1:8000/programs/getMajors/{program}").json()
    majorGroup = draw(sampled_from([*majorRequest["majors"]]))
    major = draw(sampled_from([*majorRequest["majors"][majorGroup]["specs"].keys()]))


    minorRequest = requests.get(f"http://127.0.0.1:8000/programs/getMinors/{program}").json()
    minorGroup = draw(sampled_from([*minorRequest["minors"]]))
    minor = draw(sampled_from([*minorRequest["minors"][minorGroup]["specs"].keys()]))

    return (program, major, minor)


@given(sampled_from(programs))
def test_all_programs_fetched(program):
    structure = requests.get(f"http://127.0.0.1:8000/programs/getStructure/{program}")
    assert structure != 500
    structure.json()["structure"]["General"] != {}

@given(major_minor_for_program())
def test_all_majors_minors_fetched(specifics):
    structure = requests.get(
        f"http://127.0.0.1:8000/programs/getStructure/{specifics[0]}/{specifics[1]}/{specifics[2]}"
    )
    minorKey = next(k for k in structure.json()["structure"].keys() if "Minor" in k)

    assert structure.json()["structure"]["General"] != {}
    assert structure.json()["structure"][minorKey] != {}

    course_list = []
    for container_name, container in structure.json()["structure"][minorKey].items():
        if container_name == "Core Courses":
            course_list = container["courses"].keys()

    for container_name, container in structure.json()["structure"][minorKey].items():
        if "courses" in container and container_name != "Core Courses":
            assert all(course not in course_list for course in container["courses"])


@given(major_minor_for_program())
def test_all_majors_fetched(specifics):
    structure = requests.get(
        f"http://127.0.0.1:8000/programs/getStructure/{specifics[0]}/{specifics[1]}"
    )
    majorKey = next(k for k in structure.json()["structure"].keys() if "Major" in k)
    assert structure.json()["structure"]["General"] != {}
    assert structure.json()["structure"][majorKey] != {}

    # also assert that there are no duplicates
    course_list = []
    majorKey = next(k for k in structure.json()["structure"].keys() if "Major" in k)
    for container_name, container in structure.json()["structure"][majorKey].items():
        if container_name == "Core Courses":
            course_list = [*container["courses"].keys()]
    for container_name, container in structure.json()["structure"][majorKey].items():
        if "courses" in container and container_name != "Core Courses":
            assert all(course not in course_list for course in container["courses"])
