# assumes that getPrograms, getMajors, and getMinors isnt borked.
from more_itertools import flatten
import requests
from hypothesis import given, settings
from hypothesis.strategies import DrawFn, composite, sampled_from

programs = [
    *requests.get("http://127.0.0.1:8000/programs/getPrograms")
    .json()["programs"]
    .keys()
]
# this is stupid - this is because canberra has seperate degrees for these, and these arent offered in KENS
fake_specs = ["NAVLAH", "GMATEH", "ARCYB2"]

@composite
def major_minor_for_program(draw: DrawFn):
    program = draw(sampled_from(programs))
    possible_specs = []
    for t in ["majors", "minors", "honours"]:
        majorsRequest = requests.get(f"http://127.0.0.1:8000/specialisations/getSpecialisations/{program}/{t}")
        majorsRequest = majorsRequest.json()['spec'] if majorsRequest.status_code == 200 else {}
        possible_specs.extend(flatten(prog['specs'].keys() for prog in majorsRequest.values()))


    # select doubles
    strat = sampled_from(possible_specs)
    spec1 = draw(strat)
    spec2 = draw(strat)
    while spec1 in fake_specs:
        spec1 = draw(strat)
    while spec2 in fake_specs:
        spec2 = draw(strat)

    return (program, spec1, spec2)


@given(sampled_from(programs))
@settings(deadline=500)
def test_all_programs_fetched(program):
    structure = requests.get(f"http://127.0.0.1:8000/programs/getStructure/{program}")
    assert structure != 500
    structure.json()["structure"]["General"] != {}

@given(major_minor_for_program())
@settings(deadline=500)
def test_all_specs_fetched(specifics):
    structure = requests.get(
        f"http://127.0.0.1:8000/programs/getStructure/{specifics[0]}/{specifics[1]}+{specifics[2]}"
    )
    structure.json()["structure"]["General"] != {}
    if specifics[1].endswith("1") or specifics[2].endswith("1"):
        key_to_fetch = next(k for k in structure.json()["structure"].keys() if "Major" in k)
        assert structure.json()["structure"][key_to_fetch] is not None
    if specifics[1].endswith("H") or specifics[2].endswith("H"):
        key_to_fetch = next(k for k in structure.json()["structure"].keys() if "Honours" in k)
        assert structure.json()["structure"][key_to_fetch] is not None
    if specifics[1].endswith("2") or specifics[2].endswith("2"):
        key_to_fetch = next(k for k in structure.json()["structure"].keys() if "Minor" in k)
        assert structure.json()["structure"][key_to_fetch] is not None
