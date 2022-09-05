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
    python3 -m data.processors.manualFixes.[CODE]Fixes
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
    for course in ("CVEN2303", "CVEN3303", "CVEN3304"):
        CONDITIONS[course] = CVEN_2303_3303_3304()

    CONDITIONS["CVEN4050"][PROCESSED] = CVEN_4050()
    CONDITIONS["CVEN4106"][PROCESSED] = CVEN_4106()

    for course in ("CVEN4201", "CVEN4202", "CVEN4204"):
        CONDITIONS[course][PROCESSED] = CVEN_4201_4202_4204()

    CONDITIONS["CVEN4300"][PROCESSED] = CVEN_4300()
    CONDITIONS["CVEN4308"][PROCESSED] = CVEN_4308()
    CONDITIONS["CVEN4309"][PROCESSED] = CVEN_4309()
    CONDITIONS["CVEN4507"][PROCESSED] = CVEN_4507()
    CONDITIONS["CVEN4951"] = CVEN_4951()
    CONDITIONS["CVEN9826"] = CVEN_9826()

    # Updates the files with the modified dictionaries
    data_helpers.write_data(
        CONDITIONS, "data/final_data/conditionsProcessed.json")
    data_helpers.write_data(COURSES, "data/final_data/coursesProcessed.json")

# TODO: implement your functions here
def CVEN_2303_3303_3304():
    """
    "original": "Prerequisites: (ENGG1300 AND ENGG2400) OR (CVEN1300 AND CVEN2301)<br/>(Pre-requisite only applicable to UG cohort taking this course).<br/><br/>",
    "processed": "(ENGG1300 && ENGG2400) || (CVEN1300 && CVEN2301) (only applicable to UG cohort taking this course)"
    """

    return {
        "original": "Prerequisites: (ENGG1300 AND ENGG2400) OR (CVEN1300 AND CVEN2301)<br/>(Pre-requisite only applicable to UG cohort taking this course).<br/><br/>",
        "processed": "(ENGG1300 && ENGG2400) || (CVEN1300 && CVEN2301)",
        "warning": "Requirements only applicable to undergrads"
    }

def CVEN_4050():
    """
    "original": "Prerequisite: 120 UOCs needed to enrol into this course and BE Hons Programs only<br/><br/>",
    "processed": "132UOCs needed to enrol into this course && BE Hons Programs only"
    """

    return "120UOC && ENGG# && ?????H"

def CVEN_4106():
    """
    "original": "Prerequisite: CVEN2101 & CVEN3101<br/><br/>",
    "processed": "CVEN2101 & CVEN3101"
    """

    return "CVEN2101 && CVEN3101"

def CVEN_4201_4202_4204():
    """
    "original": "Prerequisite/s: CVEN2201 OR CVEN3202 & CVEN3201 OR CVEN3203<br/><br/>",
    "processed": "CVEN2201 || CVEN3202 & CVEN3201 || CVEN3203"
    """

    return "(CVEN2201 || CVEN3202) && (CVEN3201 || CVEN3203)"

def CVEN_4300():
    """
    "original": "Pre-requisite: 2303, 3303 & 3304<br/><br/>",
    "processed": "2303, 3303 & 3304"
    """

    return "CVEN2303 && CVEN3303 && CVEN3304"

def CVEN_4308():
    """
    "original": "Prerequisites: CVEN3301 OR CVEN2303 and CVEN2002 (or equivalent).<br/><br/>",
    "processed": "CVEN3301 || CVEN2303 && CVEN2002 (or equivalent)"
    """

    return "(CVEN3301 || CVEN2303) && CVEN2002"

def CVEN_4309():
    """
    "original": "Pre: CVEN2301 & CVEN2303<br/><br/>",
    "processed": "CVEN2301 & CVEN2303"
    """

    return "CVEN2301 && CVEN2303"


def CVEN_4507():
    """
    "original": "Prerequisites: CVEN2501, CVEN3501, CVEN3502<br/><br/>",
    "processed": "CVEN2501, CVEN3501, CVEN3502"
    """

    return "CVEN2501 && CVEN3501 && CVEN3502"

def CVEN_4951():
    """
    "original": "Prerequisite: completion of 126 UOC and 70WAM and completion of 3rd year core<br/><br/>",
    "processed": "126UOC && 70WAM && 3rd year core"
    """

    return {
        "original": "Prerequisite: completion of 126 UOC and 70WAM and completion of 3rd year core<br/><br/>",
        "processed": "126UOC && 70WAM",
        "warning": "Must have completed 3rd year core"
    }

def CVEN_9826():
    """
    "original": ">74 WAM UG students<br/><br/>",
    "processed": "74WAM UG"
    """
    # TODO: JOEL: This one is very strange, it's a PG course so the requirements are wack,
    # so I went to the handbook page and don't see the prerequsites quoted here?
    # Link: https://www.handbook.unsw.edu.au/research/courses/2022/CVEN9826?year=2022
    return {
        "original": "Prerequisite: completion of 126 UOC and 70WAM and completion of 3rd year core<br/><br/>",
        "processed": "",
        "warning": "Undergraduate students must have a 74 WAM or higher"
    }

if __name__ == "__main__":
    fix_conditions()
