"""
Testing functionality related to general education units.
"""

import requests

def test_get_gened_no_overlap():
    """
    Tests that the gened list returned for a given program has no over-lap with
    ... TODO:
    """

    # the intersection between the gened list for a given program and the
    # course list generated from getStructure should be empty
    program_res = requests.get('http://127.0.0.1:8000/programs/getAllPrograms')
    assert program_res.status_code == 200
    program_list = program_res.json().keys()
    for program in program_list:
        geneds = requests.get(f'http://127.0.0.1:8000/program/getGeneds/{program}').json()["courses"]
        courses = requests.get(f"http://program/getStructureCourseList/{program}").json()["courses"]
        assert not set(geneds).intersection(set(courses))
    assert True
