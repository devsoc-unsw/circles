"""
https://github.com/devsoc-unsw/circles/wiki/Manual-Fixes-to-Course-Prerequisites

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

    CONDITIONS["LAWJ2021"][PROCESSED] = LAWJ_2021()
    for course in ("LAWJ3033", "LAWJ3062"):
        CONDITIONS[course][PROCESSED] = LAWJ_3033_3062()
    CONDITIONS["LAWJ3323"][PROCESSED] = LAWJ_3323()
    for course in ("LAWJ3250", "LAWJ3251", "LAWJ3252", "LAWJ3368"):
        CONDITIONS[course][PROCESSED] = LAWJ_3250_3251_3252_3368()

    # Updates the files with the modified dictionaries
    data_helpers.write_data(
        CONDITIONS, "data/final_data/conditionsProcessed.json")
    data_helpers.write_data(COURSES, "data/final_data/coursesProcessed.json")

def LAWJ_2021():
    """
    "original": "Restricted to students enrolled in B. Education Legal Studies LEGLC2 or LEGLB2<br/><br/>",
    "processed": "Restricted to B. Education Legal Studies LEGLC2 || LEGLB2"
    """
    return "LEGLC2 || LEGLB2"

def LAWJ_3033_3062():
    """
    "original": "Restricted to students enrolled in B. Education Legal Studies LEGLC2 or a Law exchange or study abroad program 6001 or 6021<br/><br/>",
    "processed": "Restricted to B. Education Legal Studies LEGLC2 || a Law exchange || study abroad program 6001 || 6021"
    """
    return "LEGLC2 || 6001 || 6021"

def LAWJ_3323():
    """
    "original": "Restricted to students enrolled in B. Education minor in Legal Studies LEGLC2, LEGLB2 or a Law exchange or study abroad program 6001 or 6021<br/><br/>",
    "processed": "Restricted to B. Education minor in Legal Studies LEGLC2, LEGLB2 || a Law exchange || study abroad program 6001 || 6021"
    """
    return "LEGLC2 || LEGLB2 || 6001 || 6021"

def LAWJ_3250_3251_3252_3368():
    """
    "original": "Enrolment restricted to students enrolled in Law exchange or study abroad program<br/><br/>",
    "processed": "Enrolment restricted to Law exchange || study abroad program"
    """
    return "6001 || 6021"


if __name__ == "__main__":
    fix_conditions()
