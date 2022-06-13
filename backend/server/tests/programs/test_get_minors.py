import re
import requests
from hypothesis import given
from hypothesis.strategies import sampled_from

programs = [
    *requests.get("http://127.0.0.1:8000/programs/getPrograms")
    .json()["programs"]
    .keys()
]

@given(sampled_from(programs))
def test_sanity(program):
    x = requests.get(f'http://127.0.0.1:8000/programs/getMinors/{program}')
    assert x.status_code == 200
    minors = x.json()['minors']
    for minor in minors.values():
        for key, value in minor["specs"].items():
            assert re.match(r"[A-Z]{5}2", key)
            assert isinstance(value, str)

def test_nonexistant():
    x = requests.get('http://127.0.0.1:8000/programs/getMinors/0000')
    assert x.status_code == 400
