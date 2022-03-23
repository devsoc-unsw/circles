# we want to assure that courses that may be accessed from a container are always accurately computed.
from contextlib import suppress
import requests

from server.tests.test_getAllUnlocked import USERS

ignored = ['COMP3901', 'COMP3902', 'COMP4951', 'COMP9302', 'COMP9491']

def test_validation_majors():
    unlocked = requests.post('http://127.0.0.1:8000/courses/getAllUnlocked', json=USERS["user3"]).json()['courses_state']
    for program in requests.get('http://127.0.0.1:8000/programs/getPrograms').json()['programs']:
        for major in requests.get(f'http://127.0.0.1:8000/programs/getMajors/{program}').json()['majors']:
                assert_possible_structure(unlocked, program, major)

def test_validation_minors():
    unlocked = requests.post('http://127.0.0.1:8000/courses/getAllUnlocked', json=USERS["user3"]).json()['courses_state']
    for program in requests.get('http://127.0.0.1:8000/programs/getPrograms').json()['programs']:
        major = [*requests.get(f'http://127.0.0.1:8000/programs/getMajors/{program}').json()['majors']][0]
        for minor in requests.get(f'http://127.0.0.1:8000/programs/getMinors/{program}').json()['minors']:
            assert_possible_structure(unlocked, program, major, minor)


def assert_possible_structure(unlocked, program, major, minor = ''):
    structure = requests.get(f'http://127.0.0.1:8000/programs/getStructure/{program}/{major}/{minor}').json()['structure']
    for container in structure:
        for container2 in structure[container]:
            del structure[container]['name']
            for course in structure[container][container2]['courses']:
                for c in unlocked:
                    if course in c and c not in ignored:
                        assert unlocked[c]['is_accurate'], f"{c} is inaccurate"
