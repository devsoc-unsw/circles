import requests 



# def test_basic_get_legacy_courses():
#     x = requests.get('http://127.0.0.1:8000/courses/getLegacyCourses/2021/T1')
#
#     assert x.status_code == 200
#     assert x.json()["courses"].get("COMP1531") is not None
#     assert x.json().get("courses").get("COMP6771") is None
#

def test_error():
    x = requests.get('http://127.0.0.1:8000/courses/getLegacyCourses/1923/T4')
    assert x.status_code == 400

# def test_get_legacy_course_comp1511():
#     res_2019 = requests.get("http://127.0.0.1:8000/courses/getLegacyCourse/2019/COMP1511")
#     assert res_2019.status_code == 200
#     data_2019 = res_2019.json()
#     assert data_2019.get("UOC", 0) == 6

