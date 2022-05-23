# we want to assure that courses that may be accessed from a container are always accurately computed.
from contextlib import suppress
import requests

from server.tests.courses.test_getAllUnlocked import USERS

# TODO: Do we care if these courses are broken before deployment? they are the honours courses + some wierd courses
# main issues include CIRCLES-276
ignored = ['COMP4951', 'TABL2712', 'INFS3873', 'INFS3830', 'ECON2209', 'ECON2112', 'ECON2101', 'ECON2102']

def test_validation_majors():
    unlocked = requests.post('http://127.0.0.1:8000/courses/getAllUnlocked', json=USERS["user3"]).json()['courses_state']
    for program in requests.get('http://127.0.0.1:8000/programs/getPrograms').json()['programs']:
        majorsGroups = requests.get(f'http://127.0.0.1:8000/programs/getMajors/{program}').json()['majors']
        for group in majorsGroups.values():
            for major in group.keys():
                if major != "notes":
                    assert_possible_structure(unlocked, program, major)

# TODO: currently fails because of parsing errors with new course prereqs such as COMM1190
def test_validation_minors():
    unlocked = requests.post('http://127.0.0.1:8000/courses/getAllUnlocked', json=USERS["user3"]).json()['courses_state']
    for program in requests.get('http://127.0.0.1:8000/programs/getPrograms').json()['programs']:
        majorGroups = requests.get(f'http://127.0.0.1:8000/programs/getMajors/{program}').json()['majors']
        majors = list(majorGroups[list(majorGroups.keys())[0]].keys())
        minorGroups = requests.get(f'http://127.0.0.1:8000/programs/getMinors/{program}').json()['minors']
        for major in majors:
            for group in minorGroups.values():
                for minor in group.keys():
                    if "notes" not in [major, minor]:
                        assert_possible_structure(unlocked, program, major, minor)


def assert_possible_structure(unlocked, program, major, minor = ''):
    structure = requests.get(f'http://127.0.0.1:8000/programs/getStructure/{program}/{major}/{minor}').json()['structure']
    for container in structure:
        print(container)
        with suppress(KeyError):
            del structure[container]['name']
        with suppress(KeyError):
            del structure[container]['Flexible Education']
        with suppress(KeyError):
            del structure[container]['General Education']
        with suppress(KeyError):
            del structure[container]['Prescribed Work Integrated Learning (WIL) Course']
        with suppress(KeyError):
            del structure[container]['Integrated First Year Courses']
        with suppress(KeyError):
            del structure[container]['Final Year Synthesis']
        with suppress(KeyError):
            del structure[container]['myBCom']
        with suppress(KeyError):
            del structure[container]['Compulsory Core']

        for container2 in structure[container]:
            print(container2)
            print(structure[container][container2])
            with suppress(KeyError):
                del structure[container][container2]['name']
            for course in structure[container][container2]['courses']:
                for c in unlocked:
                    if course in c and c not in ignored:
                        assert unlocked[c]['is_accurate'], f"{c} is inaccurate"
