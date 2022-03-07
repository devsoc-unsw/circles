# we want to assure that courses that may be accessed from a container are always accurately computed.
import requests

from server.tests.test_getAllUnlocked import USERS

def test_validation_majors():
    unlocked = requests.post('http://127.0.0.1:8000/courses/getAllUnlocked', json=USERS["user3"]).json()['courses_state']
    
    programs = [*requests.get('http://127.0.0.1:8000/programs/getPrograms').json()['programs'].keys()]
    for program in programs:
        majors = [*requests.get(f'http://127.0.0.1:8000/programs/getMajors/{program}').json()['majors'].keys()]
        for major in majors:
            structure = requests.get(f'http://127.0.0.1:8000/programs/getStructure/{program}/{major}/').json()['structure']
            for container in structure:
                del structure[container]['name']
                for container2 in structure[container]:
                    for course in structure[container][container2]['courses']:
                        for c in unlocked:
                            if course in c:
                                assert unlocked[c]['is_accurate'], f"{c} is inaccurate"
