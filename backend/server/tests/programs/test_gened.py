"""
Testing functionality related to general education units.
"""

from typing import List
import requests

def test_get_gened_no_overlap():
    """
    Tests that the gened list returned for a given program has no over-lap with
    ... TODO:
    """

    no_geneds: List[str] = []

    # the intersection between the gened list for a given program and the
    # course list generated from getStructure should be empty
    program_res = requests.get('http://127.0.0.1:8000/programs/getAllPrograms')
    assert program_res.status_code == 200
    programs = program_res.json()['programs']
    for program_code, program_name in programs.items():
        # Ignore doubles
        if "/" in program_name:
            continue

        geneds_res = requests.get(f'http://127.0.0.1:8000/programs/getGenEds/{program_code}')
        if not geneds_res.status_code == 200:
            no_geneds.append((program_code, geneds_res.status_code))
            continue
        geneds = geneds_res.json()['courses']
        # courses = requests.get(f"http://programs/getStructureCourseList/{program}").json()["courses"]
        # assert not set(geneds).intersection(set(courses))

    print("No geneds len: ", len(no_geneds))
    print("has geneds len: ", len(programs) - len(no_geneds))
    assert no_geneds == []

    assert False
