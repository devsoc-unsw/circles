import re
import requests


def test_sanity():
    # this can break if 3778 disappears
    x = requests.get('http://127.0.0.1:8000/programs/getMajors/3778')
    assert x.status_code == 200
    majors = x.json()['majors']
    for subprogram in majors.values():
        assert subprogram['is_optional'] is not None
        assert subprogram['notes'] is not None
        del subprogram['notes']
        del subprogram['is_optional']
        for majors in subprogram.values():
            for key, value in majors.items():
                assert re.match(r"[A-Z]{5}[0-9]{1}", key)
                assert type(value) is str

def test_nonexistant():
    x = requests.get('http://127.0.0.1:8000/programs/getMajors/0000')
    assert x.status_code == 400
