"""
Apply manual fixes to processed conditions in conditionsProcessed.json so that
they can be fed into algorithms.

Run this code after running conditionsPreprocessing.py
"""

from data.utility import dataHelpers

CONDITIONS = dataHelpers.read_data("data/finalData/conditionsTokens.json")
PROCESSED = "processed"

COURSES = dataHelpers.read_data("data/finalData/coursesProcessed.json")

# TODO: create utility file with these mappings in future?
SPN_MAP = {
    "CSE_MAJORS": ["COMPA1", "COMPD1", "COMPD1", "COMPE1", "COMPI1", "COMPJ1",
                   "COMPN1", "COMPS1", "COMPY1", "COMPZ1", "BINFB1"],
    "COMP_MAJORS": ["COMPA1", "COMPD1", "COMPD1", "COMPE1", "COMPI1",
                    "COMPJ1", "COMPN1", "COMPS1", "COMPY1", "COMPZ1"],
}


def fix_conditions():
    """ Functions to apply manual fixes """

    CONDITIONS["COMP1400"][PROCESSED] = COMP_1400_1911("COMP1400")
    CONDITIONS["COMP1911"][PROCESSED] = COMP_1400_1911("COMP1911")

    CONDITIONS["COMP3900"][PROCESSED] = COMP_3900()

    CONDITIONS["COMP3901"] = COMP_3901_3902(CONDITIONS["COMP3901"])
    CONDITIONS["COMP3902"] = COMP_3901_3902(CONDITIONS["COMP3902"])

    CONDITIONS["COMP4920"][PROCESSED] = COMP_4920()

    CONDITIONS["COMP4951"] = COMP_4951(CONDITIONS["COMP4951"])

    CONDITIONS["COMP4952"][PROCESSED] = COMP_4952()
    CONDITIONS["COMP4953"][PROCESSED] = COMP_4953()

    CONDITIONS["COMP4961"][PROCESSED] = COMP_4961()

    CONDITIONS["COMP6721"][PROCESSED] = COMP_6721("COMP6721")

    CONDITIONS["COMP9301"] = COMP_9301(CONDITIONS["COMP9301"])
    CONDITIONS["COMP9302"] = COMP_9302(CONDITIONS["COMP9302"])

    CONDITIONS["COMP9491"][PROCESSED] = COMP_9491()

    dataHelpers.write_data(
        CONDITIONS, "data/finalData/conditionsProcessed.json")
    dataHelpers.write_data(COURSES, "data/finalData/coursesProcessed.json")


def COMP_1400_1911(code):
    """ 
    "original": "Prerequisite: Enrolment in a non-CSE major (no BINF, COMP, or SENG)<br/><br/>"

    "processed": ""
    """

    # Add exclusions to courseProcessed.json
    for spn in SPN_MAP["CSE_MAJORS"]:
        COURSES[code]["exclusions"][spn] = 1

    # Then delete
    return ""


def COMP_3900():
    """
    "original": "Prerequisite: COMP1531, and COMP2521 or COMP1927, and enrolled in a BSc Computer Science major with completion of 102 uoc.<br/><br/>"

    "processed": "COMP1531 && COMP2521 || COMP1927 && 102UOC in (COMPA1 || COMPD1 || COMPD1 || COMPE1 || COMPI1 || COMPJ1 || COMPN1 || COMPS1 || COMPY1 || COMPZ1)"
    """

    new_condition = "COMP1531 && COMP2521 || COMP1927 && 102UOC in ("
    added = False
    for spn in SPN_MAP["COMP_MAJORS"]:
        if not added:
            new_condition += spn
            added = True
        else:
            new_condition += f" || {spn}"
    new_condition += ")"
    return new_condition


def COMP_3901_3902(conditions):
    """
    "original": "Prerequisite: 80+ WAM in COMP, SENG or BINF courses, completion of all first and second year core requirements a CSE program, and agreement from a suitable CSE academic supervisor.<br/><br/>"

    "processed": "80WAM in COMP || SENG || BINF"

    "warning": "You must complete all first and second year core requirements of
    a CSE program and obtain agreement from a suitable CSE academic supervisor
    to enrol in this course."
    """

    return {
        "original": conditions["original"],
        "processed": "80WAM in COMP || SENG || BINF",
        "warning": "You must complete all first and second year core requirements of a CSE program and obtain agreement from a suitable CSE academic supervisor to enrol in this course."
    }


def COMP_4920():
    """
    "original": "Prerequisite: (COMP2511 or COMP2911) and completion of 96 UOC in Computer Science.<br/><br/>",

    "processed": "(COMP2511 || COMP2911) && 96UOC in COMP"
    """

    return "(COMP2511 || COMP2911) && 96UOC in COMP"


def COMP_4951(conditions):
    """
    "original": "Prerequisite: Enrolled in a CSE BE (Hons) programs, completion of 126 UOC and completion of 3rd year core.<br/><br/>"

    "processed": "126UOC"

    "warning": "You must be enrolled in a CSE BE (Hons) program and complete all third year core requirements to enrol in this course."
    """
    # FIXME: What is included in CSE BE (Hons)?
    return {
        "original": conditions["original"],
        "processed": "126UOC",
        "warning": "You must be enrolled in a CSE BE (Hons) program and complete all third year core requirements to enrol in this course."
    }


def COMP_4952():
    """
    "original": "Prerequisite: Completion of Research Thesis A (4951)<br/><br/>"

    "processed": "COMP4951"
    """
    return "COMP4951"


def COMP_4953():
    """
    "original": "Prerequisite: Completion of Research Thesis B (4952)<br/><br/>"

    "processed": "COMP4952"
    """
    return "COMP4952"


def COMP_4961():
    """
    "original": "Prerequisite: Students enrolled in program 4515 Bachelor of Computer Science (Hons) or program 3648.<br/><br/>",

    "processed": "4515 Bachelor of Computer Science (Hons) || 3648"
    """
    return "4515 || 3648"


def COMP_6721(code):
    """
    "original": "Pre-requisite: MATH1081 AND COMP2521 AND (not enrolled in SENGAH)<br/><br/>"

    "processed": "MATH1081 && COMP2521"
    """
    COURSES[code]["exclusions"]["SENGAH"] = 1
    return "MATH1081 && COMP2521"


def COMP_9301(conditionss):
    """
    "original": "(COMP6441 OR COMP6841) AND (6 UOC from  (COMP6443, COMP6843, COMP6445, COMP6845, COMP6447)) AND enrolled in final term of program<br/><br/>",

    "processed": "(COMP6441 || COMP6841) && (6UOC from (COMP6443 && COMP6843 && COMP6445 && COMP6845 && COMP6447))",

    "warning": "This course can only be taken in the final term of your program."
    """
    return {
        "original": conditionss["original"],
        "processed": "(COMP6441 || COMP6841) && (6UOC from (COMP6443 && COMP6843 && COMP6445 && COMP6845 && COMP6447))",
        "warning": "This course can only be taken in the final term of your program."
    }


def COMP_9302(conditionss):
    """
    "original": "(COMP6441 OR COMP6841) AND (12 UOC from (COMP6443, COMP6843, COMP6445, COMP6845, COMP6447)) AND enrolled in final term of program<br/><br/>",

    "processed": "(COMP6441 || COMP6841) && (12UOC from (COMP6443 && COMP6843 && COMP6445 && COMP6845 && COMP6447))",

    "warning": "This course can only be taken in the final term of your program."
    """
    return {
        "original": conditionss["original"],
        "processed": "(COMP6441 || COMP6841) && (12UOC from (COMP6443 && COMP6843 && COMP6445 && COMP6845 && COMP6447))",
        "warning": "This course can only be taken in the final term of your program."
    }


def COMP_9491():
    """
    "original": "Two prerequisite conditions:<br/>1. Students have taken:<br/>6 UOC from the following: COMP3411; and<br/>12 UOC from the following: COMP9444/COMP9417/COMP9517/COMP4418<br/>2. Students must have a WAM of 70 or higher<br/><br/>",

    "processed": "Two conditions: 1. Students have taken: 6UOC from the following: COMP3411; && 12UOC from the following: (COMP9444 || COMP9417 || COMP9517 || COMP4418) 2. Students must have 70WAM"
    """
    return "COMP3411 && 70WAM && 12UOC from (COMP9444 || COMP9417 || COMP9517 || COMP4418)"


if __name__ == "__main__":
    fix_conditions()
