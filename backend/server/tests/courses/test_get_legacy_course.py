import json
import requests

with open(
        "./server/tests/courses/test_objects.json", "r", encoding="utf-8"
    ) as f:
    TEST_OBJECTS = json.load(f)["legacy_courses"]


def get_legacy_course_wrapper(year: int, course: str):
    """
    Wrapper for `/courses/getLegacyCourse/{year}/{courseCode}` endpoint
    """
    return requests.get(
        f"http://127.80.0.1:8000/courses/getLegacyCourse/{year}/{course}"
    )

def test_legacy_comp1511():
    """
    Test for COMP1511
    """
    res_2019 = get_legacy_course_wrapper(2019, "COMP1511")
    assert res_2019.status_code == 200
    assert res_2019.json() == TEST_OBJECTS["legacy_comp1511_2019"]

