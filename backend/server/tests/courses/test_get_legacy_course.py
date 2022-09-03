import json
from typing import Optional
import requests

from server.routers.model import CourseDetails

with open(
    "./server/tests/courses/test_objects.json", "r", encoding="utf-8"
) as f:
    TEST_OBJECTS = json.load(f)["legacy_courses"]


def get_legacy_course_wrapper(year: int, course: str):
    """
    Wrapper for `/courses/getLegacyCourse/{year}/{courseCode}` endpoint
    """
    return requests.get(
        f"http://127.0.0.1:8000/courses/getLegacyCourse/{year}/{course}"
    )

def compare_course_details(output: CourseDetails, expected: CourseDetails, compare_desc: bool=False) -> Optional[str]:
    """
    Used to compare two course-detail objects.
    Returns the key (str) that had a differing value, otherwise None.
    By default, this skips the description value. Add the `compare_desc` flag
    to toggle this behaviour.
    """
    assert set(output.keys()) == set(expected.keys())
    if compare_desc:
        if output["description"] != expected["description"]:
            return "description"

    del output["description"]
    del expected["description"]
    for key, val in expected.items():
        if output[key] != val:
            return key
    return None
    

def test_legacy_comp1511():
    """
    Test for COMP1511
    """
    res_2019 = get_legacy_course_wrapper(2019, "COMP1511")
    assert res_2019.status_code == 200
    data_2019 = res_2019.json()
    assert not compare_course_details(data_2019, TEST_OBJECTS["comp1511_2019"])

