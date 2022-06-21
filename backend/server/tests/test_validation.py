# we want to assure that courses that may be accessed from a container are always accurately computed.
from contextlib import suppress
from itertools import chain
import requests

from server.tests.courses.test_get_all_unlocked import USERS
from server.tests.programs.test_get_structure import fake_specs

# some of these should probs not be ignored
ignored = [
    'ARCH1101', 'ECON2209', 'ECON2112', 'ECON2101',
    'ECON2102', 'ADAD4100', 'ARTS3', 'AVIA2117', 'BABS3021',
    'BEES', 'BEIL6', 'BENV6713', 'BIOC3', 'BIOM4951',
    'BIOS3161', 'BLDG', 'CDEV3101', 'CODE3100', 'CEIC',
    'CHEM', 'CRIM2021', 'CRIM3', 'CVEN4701', 'DART2151',
    'DATA3001', 'DP', 'EDST6716', 'EDST6761', 'EDST6771',
    'GMAT4061', 'HESC3541', 'HUMS1007', 'LAWS', 'MATS3', 'MDIA',
    'MICR3621', 'MMAN49', 'MUSC', 'NEUR2201', 'PHAR2011',
    'PHAR3102', 'PHAR3251', 'PHCM1001', 'PHSL', 'PHYS1116',
    '3199', '3299', 'SDES', 'SOCW', 'SOLA49', 'SOSS',
    'SRAP', 'ZHSS3501', 'FOOD6804', 'SCIF', 'PATH3209'
]

def test_validation():
    unlocked = requests.post('http://127.0.0.1:8000/courses/getAllUnlocked', json=USERS['user3']).json()['courses_state']
    for program in requests.get('http://127.0.0.1:8000/programs/getPrograms').json()['programs']:
        majorsGroups = requests.get(f'http://127.0.0.1:8000/specialisations/getSpecialisations/{program}/majors')
        minorsGroups = requests.get(f'http://127.0.0.1:8000/specialisations/getSpecialisations/{program}/minors')
        honoursGroups = requests.get(f'http://127.0.0.1:8000/specialisations/getSpecialisations/{program}/honours')
        majorsGroups = majorsGroups.json()['spec'] if majorsGroups.status_code == 200 else {}
        minorsGroups = minorsGroups.json()['spec'] if minorsGroups.status_code == 200 else {}
        honoursGroups = honoursGroups.json()['spec'] if honoursGroups.status_code == 200 else {}
        print(majorsGroups)
        for group in chain(majorsGroups.values(), minorsGroups.values(), honoursGroups.values()):
            print(group)
            for spec in group['specs'].keys():
                if spec not in fake_specs:
                    print(spec)
                    assert_possible_structure(unlocked, program, spec)


def assert_possible_structure(unlocked, program, spec):
    structure = requests.get(f'http://127.0.0.1:8000/programs/getStructure/{program}/{spec}').json()['structure']
    for container in structure:
        with suppress(KeyError):
            del structure[container]['name']
            del structure[container]['Flexible Education']
            del structure[container]['General Education']

        for container2 in structure[container]:
            with suppress(KeyError):
                del structure[container][container2]['name']

            for course in structure[container][container2]['courses']:
                for c in unlocked:
                    if course in c and all(ignore not in c for ignore in ignored):
                        assert unlocked[c]['is_accurate'], f'{c} is inaccurate'
