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
<<<<<<< HEAD
        for group in majorsGroups.keys():
            for major in majorsGroups[group].keys():
=======
        for group in majorsGroups.values():
            for major in group["specs"].keys():
>>>>>>> dev
                assert_possible_structure(unlocked, program, major)

# TODO: currently fails because of parsing errors with new course prereqs such as COMM1190
def test_validation_minors():
    unlocked = requests.post('http://127.0.0.1:8000/courses/getAllUnlocked', json=USERS["user3"]).json()['courses_state']
    for program in requests.get('http://127.0.0.1:8000/programs/getPrograms').json()['programs']:
        majorGroups = requests.get(f'http://127.0.0.1:8000/programs/getMajors/{program}').json()['majors']
<<<<<<< HEAD
        major = list(majorGroups[list(majorGroups.keys())[0]].keys())[0]
        for minor in requests.get(f'http://127.0.0.1:8000/programs/getMinors/{program}').json()['minors']:
            assert_possible_structure(unlocked, program, major, minor)
=======
        minorGroups = requests.get(f'http://127.0.0.1:8000/programs/getMinors/{program}').json()['minors']
        for majGroup in majorGroups.values():
            for major in majGroup["specs"].keys():
                for group in minorGroups.values():
                    for minor in group["specs"].keys():
                        assert_possible_structure(unlocked, program, major, minor)
>>>>>>> dev


def assert_possible_structure(unlocked, program, major, minor = ''):
    structure = requests.get(f'http://127.0.0.1:8000/programs/getStructure/{program}/{major}/{minor}').json()['structure']
    for container in structure:
        print(container)
        with suppress(KeyError):
            del structure[container]['name']
            del structure[container]['Flexible Education']
            del structure[container]['General Education']
<<<<<<< HEAD
        with suppress(KeyError):
            del structure[container]['Prescribed Work Integrated Learning (WIL) Course']
        with suppress(KeyError):
            del structure[container]['Integrated First Year Courses']
        with suppress(KeyError):
            del structure[container]['Final Year Synthesis']
        with suppress(KeyError):
            del structure[container]['myBCom']
        with suppress(KeyError):
=======
            del structure[container]['Prescribed Work Integrated Learning (WIL) Course']
            del structure[container]['Integrated First Year Courses']
            del structure[container]['Final Year Synthesis']
            del structure[container]['myBCom']
>>>>>>> dev
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
