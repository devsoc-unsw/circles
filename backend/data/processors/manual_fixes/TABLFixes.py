"""
https://github.com/csesoc/Circles/wiki/Manual-Fixes-to-Course-Prerequisites

Copy this into a new file for the relevant faculty's fixes:
e.g. COMPFixes.py, ACCTFixes.py, PSYCFixes.py

Apply manual TABL fixes to processed conditions in conditionsProcessed.json so
that they can be fed into algorithms.

If you make a mistake and need to regenerate conditionsProcessed.json, then you
can run:
    python3 -m data.processors.conditionsPreprocessing

To then run this file:
    python3 -m data.processors.manualFixes.TABLFixes
"""

from data.utility import data_helpers

# Reads conditionsProcessed dictionary into 'CONDITIONS'
CONDITIONS = data_helpers.read_data("data/final_data/conditionsProcessed.json")
PROCESSED = "processed"

# Reads coursesProcessed dictionary into 'COURSES' (for updating exclusions)
COURSES = data_helpers.read_data("data/final_data/coursesProcessed.json")


def fix_conditions():
    """ Functions to apply manual fixes """

    CONDITIONS["TABL2710"][PROCESSED] = TABL_2710()
    CONDITIONS["TABL2712"][PROCESSED] = TABL_2712()
    CONDITIONS["TABL2741"][PROCESSED] = TABL_2741()
    CONDITIONS["TABL3755"][PROCESSED] = TABL_3755()
    CONDITIONS["TABL5805"][PROCESSED] = TABL_5805()

    # Updates the files with the modified dictionaries
    data_helpers.write_data(
        CONDITIONS, "data/final_data/conditionsProcessed.json")
    data_helpers.write_data(COURSES, "data/final_data/coursesProcessed.json")


def TABL_2710():
    """
    "original": "Prerequisite: Must not be enrolled in Law single and dual programs and completion of 18UOC<br/><br/>",

    "processed": "Must not be Law single && dual programs && 18UOC"
    """

    COURSES["TABL2710"]["exclusions"] = {"LAWS#": 1}

    return "18UOC"


def TABL_2741():
    """
    "original": "Prerequisite: Not enrolled in Law single and dual programs, and completion of LEGT1710 or TABL1710 or TABL2710 or (COMM1100 and COMM1150) or COMM1900<br/><br/>",

    "processed": "Not Law single && dual programs && LEGT1710 || TABL1710 || TABL2710 || (COMM1100 && COMM1150) || COMM1900"
    """

    COURSES["TABL2741"]["exclusions"] = {"LAWS#": 1}

    return "LEGT1710 || TABL1710 || TABL2710 || (COMM1100 && COMM1150) || COMM1900"


def TABL_3755():
    """
    "original": "Prerequisite: LEGT2751 or TABL2751 and LAWS3147<br/><br/>",

    "processed": "LEGT2751 || TABL2751 && LAWS3147"
    """

    # Seems to be a mistake. It should be || (checking 2019, 2020, 2021 handbook)
    # On top of this, LAWS3147 is an exclusion of TABL2751 in the 2022 handbook
    return "LEGT2751 || TABL2751 || LAWS3147"


def TABL_5805():
    """
    "original": "Restricted to students enrolled in Program 9245, 9255, 9257 or Stream TABLBS9250, TABLDS9250, TABLAH4501<br/><br/>",

    "processed": "Restricted to Program 9245 || 9255 || 9257 || Stream TABLBS9250, TABLDS9250, TABLAH4501"
    """

    return "9245 || 9255 || 9257 || TABLBS9250 || TABLDS9250 || TABLAH4501"

def TABL_2712():
    """
        "original": "Prerequisite:LEGT1710 or TABL1710 or TABL 2710 or 12 UOC offered by the UNSW Business School.<br/><br/>",
        "processed": "LEGT1710 || TABL1710 || TABL 2710 || 12UOC in F Business"
    """
    return "LEGT1710 || TABL1710 || TABL2710 || 12UOC in F Business"
if __name__ == "__main__":
    fix_conditions()
