import requests


def test_search_course():
    x = requests.get('http://127.0.0.1:8000/courses/searchCourse/COMP1')
    assert x.status_code == 200
    assert x.json().get("COMP1521") is not None
    

def test_search_archives():
    x = requests.get('http://127.0.0.1:8000/courses/searchCourse/DESN1000')
    assert x.status_code == 200
    assert x.json().get("DESN1000") is not None

def test_search_title():
    x = requests.get('http://127.0.0.1:8000/courses/searchCourse/Programming Fundamentals')
    assert x.status_code == 200
    assert x.json().get("COMP1511") is not None
