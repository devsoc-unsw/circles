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

from data.utility import dataHelpers

# Reads conditionsProcessed dictionary into 'CONDITIONS'
CONDITIONS = dataHelpers.read_data("data/finalData/conditionsProcessed.json")
PROCESSED = "processed"

# Reads coursesProcessed dictionary into 'COURSES' (for updating exclusions)
COURSES = dataHelpers.read_data("data/finalData/coursesProcessed.json")

def fix_conditions():
    """ Functions to apply manual fixes """

    # TODO: call your functions here
    CONDITIONS["ECON1203"][PROCESSED] = ECON_1203()

    # Updates the files with the modified dictionaries
    dataHelpers.write_data(
        CONDITIONS, "data/finalData/conditionsProcessed.json")
    dataHelpers.write_data(COURSES, "data/finalData/coursesProcessed.json")

# TODO: implement your functions here
def ECON_1203():
    """
    "original": "Excluded: MATH2841, MATH2801, MATH2901, MATH2099, ACTL2002 & ACTL2131. <br/>Prerequisite: Must not be enrolled in Program 3715 or 3764<br/><br/>"
    
    "processed": "Must not be Program 3715 || 3764"
    """

    COURSES["ECON1203"]["exclusions"]["3715"] = 1
    COURSES["ECON1203"]["exclusions"]["3764"] = 1

    return ""

if __name__ == "__main__":
    fix_conditions()