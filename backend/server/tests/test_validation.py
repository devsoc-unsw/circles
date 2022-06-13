# we want to assure that courses that may be accessed from a container are always accurately computed.
from contextlib import suppress
from itertools import chain
import requests

from server.tests.courses.test_get_all_unlocked import USERS

ignored = ['ECON2209', 'ECON2112', 'ECON2101', 'ECON2102']

def test_validation():
    unlocked = requests.post('http://127.0.0.1:8000/courses/getAllUnlocked', json=USERS["user3"]).json()['courses_state']
    for program in requests.get('http://127.0.0.1:8000/programs/getPrograms').json()['programs']:
        majorsGroups = requests.get(f'http://127.0.0.1:8000/programs/getSpecialisations/{program}/majors')
        minorsGroups = requests.get(f'http://127.0.0.1:8000/programs/getSpecialisations/{program}/minors')
        honoursGroups = requests.get(f'http://127.0.0.1:8000/programs/getSpecialisations/{program}/honours')
        majorsGroups = majorsGroups.json()['spec'] if majorsGroups.status_code == 200 else {}
        minorsGroups = minorsGroups.json()['spec'] if minorsGroups.status_code == 200 else {}
        honoursGroups = honoursGroups.json()['spec'] if honoursGroups.status_code == 200 else {}

        for group in chain(majorsGroups.values(), minorsGroups.values(), honoursGroups.values()):
            for major in group["specs"].keys():
                assert_possible_structure(unlocked, program, major)


def assert_possible_structure(unlocked, program, spec):
    structure = requests.get(f'http://127.0.0.1:8000/programs/getStructure/{program}/{spec}').json()['structure']
    for container in structure:
        with suppress(KeyError):
            del structure[container]['name']
            del structure[container]['Flexible Education']
            del structure[container]['General Education']
            del structure[container]['Prescribed Work Integrated Learning (WIL) Course']
            del structure[container]['Integrated First Year Courses']
            del structure[container]['Final Year Synthesis']
            del structure[container]['myBCom']
            del structure[container]['Compulsory Core']

        for container2 in structure[container]:
            with suppress(KeyError):
                del structure[container][container2]['name']

                for course in structure[container][container2]['courses']:
                    for c in unlocked:
                        if course in c and c not in ignored:
                            assert unlocked[c]['is_accurate'], f"{c} is inaccurate"
