"""
https://github.com/csesoc/Circles/wiki/Manual-Fixes-to-Course-Prerequisites

Copy this into a new file for the relevant faculty's fixes:
e.g. COMPFixes.py, ACCTFixes.py, PSYCFixes.py

Apply manual [code] fixes to processed conditions in conditionsProcessed.json so
that they can be fed into algorithms.

If you make a mistake and need to regenerate conditionsProcessed.json, then you
can run:
    python3 -m data.processors.conditionsPreprocessing

To then run this file:
    python3 -m data.processors.manualFixes.ENGGFixes
"""

from data.utility import data_helpers

# Reads conditionsProcessed dictionary into 'CONDITIONS'
CONDITIONS = data_helpers.read_data("data/final_data/conditionsProcessed.json")
PROCESSED = "processed"

# Reads coursesProcessed dictionary into 'COURSES' (for updating exclusions)
COURSES = data_helpers.read_data("data/final_data/coursesProcessed.json")


def fix_conditions():
    """ Functions to apply manual fixes """

    # TODO: call your functions here
    CONDITIONS["ENGG1811"][PROCESSED] = ENGG_1811()
    CONDITIONS["ENGG2997"][PROCESSED] = ENGG_2997()
    CONDITIONS["ENGG4103"][PROCESSED] = ENGG_4103()

    for course in ("ENGG2600", "ENGG3600", "ENGG4600"):
        CONDITIONS[course] = ENGG_2_4600(CONDITIONS[course])

    # Updates the files with the modified dictionaries
    data_helpers.write_data(
        CONDITIONS, "data/final_data/conditionsProcessed.json")
    data_helpers.write_data(COURSES, "data/final_data/coursesProcessed.json")

# TODO: implement your functions here


def ENGG_1811():
    """
    "original": "Prerequisite: Enrolment in a non-CSE major (no BINF, COMP, or SENG)<br/><br/>"

    "processed": "Enrolment in a non-CSE major (no BINF || COMP || SENG)"
    """

    COURSES["ENGG1811"]["exclusions"]["COMP?1"] = 1
    COURSES["ENGG1811"]["exclusions"]["COMP?H"] = 1
    COURSES["ENGG1811"]["exclusions"]["BINF?1"] = 1
    COURSES["ENGG1811"]["exclusions"]["BINF?H"] = 1
    COURSES["ENGG1811"]["exclusions"]["SENGAH"] = 1

    return ""


def ENGG_2_4600(conditions):
    """
    "original": "Please refer to the course overview section for information on prerequisite requirements.<br/><br/>"

    "processed": ""

    "handbookNote": "Please refer to the course overview section for information on requirements"
    """

    return {
        "original": conditions["original"],
        "processed": "",
        "handbookNote": "Please refer to the course overview section for information on requirements"
    }


def ENGG_2997():
    """
    "original": "Successful completion of 72 UOC and enrolled in program 3778 or 3061<br/><br/>"

    "processed": "Successful 72UOC && program 3778 || 3061"
    """

    return "72UOC && (3778 || 3061)"


def ENGG_4103():
    """
    "original": "ENGG3001 - Fundamentals of Humanitarian Engineering (UG)\t<br/><br/>"

    "processed": "ENGG3001 - Fundamentals of Humanitarian Engineering (UG)"
    """

    return "ENGG3001"


if __name__ == "__main__":
    fix_conditions()
