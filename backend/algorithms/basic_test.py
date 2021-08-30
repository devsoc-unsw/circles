'''Testing very basic algorithms logic including:
- No prerequisites
- And/Or conditions
'''

import Enrolment
import pytest


# def test_basic():
#     # put selected Courses here
#     selectedCourses = ['COMP1531', 'MATH1081']
#     # Text is the enrolmentRules
#     text = "( MATH1081 && ( COMP1531 || COMP2041 ) )"
#     #Should return empty
#     cond = Enrolment.Condition()
#     cond.select(selectedCourses)

#     data = text.split()
#     data, errCode = Enrolment.parseRequirement(data)
#     if errCode == -1:
#         data.show()
#     else:
#         data.show()
#         assert data.validate(cond) == True
        
def create_student_3707_COMPA1():
    user = User()
    user.addProgram("3707")
    user.addSpecialisation("COMPA1")
    return user

def test_no_req_simple():
    '''No Prerequisite. Anyone in all of UNSW should be able to take'''
    user = create_student_3707_COMPA1()

    comp1511Req = createRequirement("COMP1511")
    assert comp1511Req.validate(user) == True

    math1131Req = createRequirement("MATH1131")
    assert math1131Req.validate(user) == True

    math1141Req = createRequirement("MATH1141")
    assert math1141Req.validate(user) == True

def test_no_req_existing_courses():
    '''Even if the student has taken existing courses, they should be able to enrol'''
    user = create_student_3707_COMPA1()
    user.addCourses(["ENGG1000"])

    comp1511Req = createRequirement("COMP1511")
    assert comp1511Req.validate(user) == True

    math1131Req = createRequirement("MATH1131")
    assert math1131Req.validate(user) == True

    math1141Req = createRequirement("MATH1141")
    assert math1141Req.validate(user) == True

def test_no_req_duplicates():
    '''Cannot retake a course'''
    user = create_student_3707_COMPA1()
    user.addCourses(["COMP1511", "MATH1131"])

    comp1511Req = createRequirement("COMP1511")
    assert comp1511Req.validate(user) == False

    math1131Req = createRequirement("MATH1131")
    assert math1131Req.validate(user) == False

    # Cannot take exclusion
    math1141Req = createRequirement("MATH1141")
    assert math1141Req.validate(user) == True

def test_and_or_courses():
    '''Simple and/or conditions involving only courses'''
    user1 = create_student_3707_COMPA1()
    user1.addCourses(["COMP1911"])
    comp1521Req = createRequirement("COMP1521")
    assert comp1521Req.validate(user1) == True

    user2 = create_student_3707_COMPA1()
    user2.addCourses(["COMP1531"])
    comp6080Req = createRequirement("COMP2521")
    assert comp6080Req.validate(user2) == False

    user2.addCourses(["COMP2521"])
    assert comp6080Req.validate(user2) == True

    user3 = create_student_3707_COMPA1()
    user3.addCourses(["COMP1927"])
    comp9318Req = createRequirement("COMP9318")
    assert comp9318Req.validate(user3) == False

    user3.addCourses(["MATH1081"])
    assert comp9318Req.validate(user3) == True
