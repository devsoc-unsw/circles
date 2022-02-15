# assumes that getPrograms, getMajors, and getMinors isnt borked.
from random import choice
import requests
from hypothesis import given
from hypothesis.strategies import sampled_from, composite, DrawFn
programs = [*requests.get('http://127.0.0.1:8000/programs/getPrograms').json()['programs'].keys()]

@composite
def major_minor_for_program(draw: DrawFn):
    program = draw(sampled_from(programs))
    major = draw(sampled_from([*requests.get(f'http://127.0.0.1:8000/programs/getMajors/{program}').json()['majors'].keys()]))
    minor = draw(sampled_from([*requests.get(f'http://127.0.0.1:8000/programs/getMinors/{program}').json()['minors'].keys()]))
    return (program, major, minor)


@given(sampled_from(programs))
def test_all_programs_fetched(program):
    structure = requests.get(f'http://127.0.0.1:8000/programs/getStructure/{program}')
    assert structure != 500
    structure.json()['structure']['General'] != {}

@given(major_minor_for_program())
def test_all_majors_minors_fetched(specifics):
    structure = requests.get(f'http://127.0.0.1:8000/programs/getStructure/{specifics[0]}/{specifics[1]}/{specifics[2]}')

    assert structure.json()['structure']['General'] != {}
    assert structure.json()['structure']['Major'] != {}
    assert structure.json()['structure']['Minor'] != {}

@given(major_minor_for_program())
def test_all_majors_fetched(specifics):
    structure = requests.get(f'http://127.0.0.1:8000/programs/getStructure/{specifics[0]}/{specifics[1]}')

    assert structure.json()['structure']['General'] != {}
    assert structure.json()['structure']['Major'] != {}
    assert structure.json()['structure'].get('Minor') == None
