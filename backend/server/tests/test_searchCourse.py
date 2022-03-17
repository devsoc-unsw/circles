import json 
import requests 


def test_search_course():
    x = requests.get('http://127.0.0.1:8000/courses/searchCourse/COMP1')
    assert x.status_code == 200
    assert x.json().get("COMP1521") != None
    assert x.json().get("COMP2521") == None
    

def test_invalid():
    x = requests.get('http://127.0.0.1:8000/courses/searchCourse/ABCD')
    assert x.status_code != 500
    assert x.json() == {}
