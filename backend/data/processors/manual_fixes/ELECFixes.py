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
    CONDITIONS["ELEC2911"][PROCESSED] = ELEC_2911()
    CONDITIONS["ELEC3115"][PROCESSED] = ELEC_3115()
    CONDITIONS["ELEC3705"][PROCESSED] = ELEC_3705()
    CONDITIONS["ELEC4605"][PROCESSED] = ELEC_4605()
    CONDITIONS["ELEC4952"][PROCESSED] = ELEC_4952()
    CONDITIONS["ELEC4953"][PROCESSED] = ELEC_4953()

    CONDITIONS["ELEC4951"] = ELEC_4951(CONDITIONS["ELEC4951"])

    # Updates the files with the modified dictionaries
    data_helpers.write_data(
        CONDITIONS, "data/final_data/conditionsProcessed.json")
    data_helpers.write_data(COURSES, "data/final_data/coursesProcessed.json")


def ELEC_2911():
    """
    "original": "Prerequisite: ELEC1111 and 48 UoC. Students should have a good working knowledge of university level physics, circuit theory and mathematics.<br/><br/>",
    "processed": "ELEC1111 && 48UOC. should have a good working knowledge of university level physics && circuit theory && mathematics"
    """

    return "ELEC1111 && 48UOC"

def ELEC_3115():
    """
    "original": "Pre-requisite: MATH2069 AND (PHY1231 OR DPST1024)<br/><br/>",
    "processed": "MATH2069 && (PHY1231 || DPST1024)"
    """

    return "MATH2069 && (PHYS1231 || DPST1024)"

def ELEC_3705():
    """
    "original": "Pre-requisite : MATH2099 AND (PHYS1231 OR DPST1024 OR PHYS1221)<br/><br/>",
    "processed": ": MATH2099 && (PHYS1231 || DPST1024 || PHYS1221)"
    """

    return "MATH2099 && (PHYS1231 || DPST1024 || PHYS1221)"

def ELEC_4951(conditions):
    """
    "original": "Prerequisite: Completion of 126 UOC and completion of 3rd year core<br/><br/>",
    "processed": "126UOC && 3rd year core"
    """

    return {
        "original": conditions["original"],
        "processed": "126UOC",
        "warning": "Completion of ELEC 3rd year core is required"
    }

def ELEC_4605():
    """
    "original": "Pre-Requisite: Elec3705<br/><br/>",
    "processed": "Elec3705"
    """

    return "ELEC3705"

def ELEC_4952():
    """
    "original": "Prerequisite: Completion of Research Thesis A (4951)<br/><br/>",
    "processed": "Research Thesis A (4951)"
    """

    return "ELEC4951"

def ELEC_4953():
    """
    "original": "Prerequisite: Completion of Research Thesis B (4952)<br/><br/>",
    "processed": "Research Thesis B (4952)"
    """

    return "ELEC4952"

if __name__ == "__main__":
    fix_conditions()
