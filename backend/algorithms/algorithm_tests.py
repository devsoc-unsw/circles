import Enrolment
import pytest


def test_basic():
    # put selected Courses here
    selectedCourses = ['COMP1531', 'MATH1081']
    # Text is the enrolmentRules
    text = "( MATH1081 && ( COMP1531 || COMP2041 ) )"
    #Should return empty
    cond = Enrolment.Condition()
    cond.select(selectedCourses)

    data = text.split()
    data, errCode = Enrolment.parseRequirement(data)
    if errCode == -1:
        data.show()
    else:
        data.show()
        assert data.validate(cond) == True
        
