import re
import requests


def test_sanity():
    x = requests.get('http://127.0.0.1:8000/programs/getPrograms')
    assert x.status_code == 200
    programs = x.json()['programs']
    for key, value in programs.items():
        assert re.match(r"[0-9]{4}", key)
        assert type(value) is str
