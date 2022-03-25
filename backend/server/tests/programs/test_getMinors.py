import re
import requests


def test_sanity():
    x = requests.get('http://127.0.0.1:8000/programs/getMinors/3778')
    assert x.status_code == 200
    minors = x.json()['minors']
    for key, value in minors.items():
        assert re.match(r"[A-Z]{5}[0-9]{1}", key)
        assert type(value) is str

def test_nonexistant():
    x = requests.get('http://127.0.0.1:8000/programs/getMinors/0000')
    assert x.status_code == 400
