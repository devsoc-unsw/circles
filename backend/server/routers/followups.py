from typing import Dict
from fastapi import APIRouter
from server.database import coursesCOL
import json 

router = APIRouter(
    prefix="/followups",
    tags=["followups"],
)

def get_next_term(term: str) -> str:
    if term[0] == 'T':
        if int(term[-1]) < 3:
            return 'T' + str(int(term[-1]) + 1)
        return 'S'
    return 'T1'

@router.post(
    "/getFollowups/{origin_course}/{origin_term}",
    responses={
        200: {
            "description": "Returns a list of the most popular followup courses",
            "content": {
                "application/json": {
                    "example": {
                        "originCourse": "COMP1511",
                        "originTerm": "T2",
                        "followups": {
                            "COMP1521": {
                                "T3": 339,
                            },
                            "COMP1531": {
                                "T3": 200,
                            },
                            "COMP2521": {
                                "T3": 120,
                            },
                            "COMP1511": {
                                "T3": 45,
                            }
                        }
                    }
                }
            }
        }
    }
)
def get_followups(origin_course: str, origin_term: str) -> Dict[str, str]:
    # origin_term is the term that the original course was/would be taken in
 
    # we only have enrolment data from T2(2022) -> T3(2022) at this stage
    origin_term = "T2" # remove this line after we get more data
    next_term = get_next_term(origin_term)

    # get all comp courses
    all_comp_courses = []
    for course in coursesCOL.find():
        if course["code"].startswith("COMP"):
            all_comp_courses.append(course["code"])
    
    # get enrolment data
    enrolment_data_file = open("./data/final_data/enrolmentData.json")
    enrolment_data = json.load(enrolment_data_file)
    enrolment_data_file.close()
    origin_course_members = enrolment_data[origin_course][origin_term]
    
    # calculate followups
    followups = {}
    for course in all_comp_courses:
        # count duplicates between:
        #  people who took the origin_course in origin_term 
        #  people who took this course in the following term.
        num_followups = len(set(enrolment_data[course][next_term]) & set(origin_course_members))
        
        if num_followups != 0:
            followups.update({ course: { next_term: num_followups } })

    top_followups = sorted(followups.items(), reverse=True, key=lambda course: course[1][next_term])
 
    return {"originCourse": origin_course,
            "originTerm": origin_term,
            "followups": dict(top_followups),     
            }


    