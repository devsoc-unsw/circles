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

    for course in ("WADA3100", "WADA3102", "WADA3105", "WADA3106"):
        CONDITIONS[course][PROCESSED] = WADA_3100_3102_3105_3106()
    CONDITIONS["WADA3107"][PROCESSED] = WADA_3107()

    # Updates the files with the modified dictionaries
    data_helpers.write_data(
        CONDITIONS, "data/final_data/conditionsProcessed.json")
    data_helpers.write_data(COURSES, "data/final_data/coursesProcessed.json")

def WADA_3100_3102_3105_3106():
    """
    "original": "Prerequisite: 48 UOC overall, including 6 UOC from level 2 Public Relations and Advertising courses<br/><br/>",
    "processed": "48UOC && 6UOC from in L2 Public Relations && Advertising courses"
    """
    return "48UOC && 6UOC in L2 WADA"

def WADA_3107():
    """
    "original": "Prerequisite: 48 UOC overall, including 6 UOC from level 2<br/><br/>",
    "processed": "48UOC && 6UOC from in L2"
    """
    return "48UOC && 6UOC in L2"


if __name__ == "__main__":
    fix_conditions()
