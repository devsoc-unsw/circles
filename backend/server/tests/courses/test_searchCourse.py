import requests
import json

with open("algorithms/exampleUsers.json") as f:
    USER = json.load(f)["user6"]
f.close()


def test_search_course():
    x = requests.post('http://127.0.0.1:8000/courses/searchCourse/COMP1', json=USER)
    assert x.status_code == 200
    assert x.json().get("COMP1521") is not None
    

def test_search_archives():
    x = requests.post('http://127.0.0.1:8000/courses/searchCourse/DESN1000', json=USER)
    assert x.status_code == 200
    assert x.json().get("DESN1000") is not None


def test_search_title():
    x = requests.post('http://127.0.0.1:8000/courses/searchCourse/Programming Fundamentals', json=USER)
    assert x.status_code == 200
    assert x.json().get("COMP1511") is not None


def test_search_minor():
    x = requests.post('http://127.0.0.1:8000/courses/searchCourse/Financial Fundamentals', json=USER)
    assert x.status_code == 200
    assert x.json().get("specs").get("ACCT2511") is not None
