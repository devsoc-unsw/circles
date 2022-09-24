from contextlib import suppress
from typing import Dict
from algorithms.objects.user import User
from data.config import ARCHIVED_YEARS
from fastapi import APIRouter, HTTPException
from fuzzywuzzy import fuzz # type: ignore
from server.database import archivesDB, coursesCOL
from server.routers.model import (CACHED_HANDBOOK_NOTE, CONDITIONS,
                                  UserData)
from server.routers.utility import get_core_courses
import json 

router = APIRouter(
    prefix="/followups",
    tags=["followups"],
)

def fix_user_data(userData: dict):
    """ Updates and returns the userData with the UOC of a course """
    coursesWithoutUoc = [
        course
        for course in userData["courses"]
        if not isinstance(userData["courses"][course], list)
    ]
    filledInCourses = {
        course: [get_course(course)["UOC"], userData["courses"][course]]
        for course in coursesWithoutUoc
    }
    userData["courses"].update(filledInCourses)
    userData["core_courses"] = get_core_courses(userData["program"], list(userData["specialisations"].keys()))
    return userData

def get_course(courseCode: str) -> Dict:
    """
    Get info about a course given its courseCode
    - start with the current database
    - if not found, check the archives
    """
    result = coursesCOL.find_one({"code": courseCode})
    if not result:
        for year in sorted(ARCHIVED_YEARS, reverse=True):
            result = archivesDB[str(year)].find_one({"code": courseCode})
            if result is not None:
                result.setdefault("raw_requirements", "")
                result["is_legacy"] = True
                break
    else:
        result["is_legacy"] = False

    if not result:
        raise HTTPException(
            status_code=400, detail=f"Course code {courseCode} was not found"
        )
    result.setdefault("school", None)
    result['is_accurate'] = CONDITIONS.get(courseCode) is not None
    result['handbook_note'] = CACHED_HANDBOOK_NOTE.get(courseCode, "")
    del result["_id"]
    with suppress(KeyError):
        del result["exclusions"]["leftover_plaintext"]
    return result

@router.post(
    "/followups/{course}",
    responses={
        200: {
            "description": "Returns a list of the most popular followup courses",
            "content": {
                "example": {
                    "COMP1521",
                    "COMP2521",
                    "COMP1531",
                }
            }
        }
    },
)
def get_followups(userData: UserData, takenCourse: str) -> Dict[str, str]:
    """
    Rank courses in order of priority according to the sequences
    others have taken before.
    
    At this point, using only t2 -> t3 data (because that's all we have)

    Also I'm just using data[course] to represent the enrolment data cause i dont know exactly how to access it.
    """

    enrolmentDataFile = open('data/final_data/enrolmentData.json')
    enrolmentData = json.load(enrolmentDataFile)

    followups = {};

    takenCourseMembers = enrolmentData[takenCourse].t2

    user = User(fix_user_data(userData.dict()))
    
    for course, condition in CONDITIONS.items():
        result = condition.validate(user) if condition is not None else (True, [])
        if result:
            #if course is unlocked
            #count duplicates between people who took this course in t3 and people who took the initial course in t2
            followups[course].t3 = len([enrolmentData[course].t3.index(i) for i in takenCourseMembers])

    topFollowups = sorted(followups.items(), reverse=True, key=lambda course: course[1]['t3'])

    enrolmentDataFile.close();

    return topFollowups

    