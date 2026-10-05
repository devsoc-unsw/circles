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

    CONDITIONS["WCDV3002"][PROCESSED] = WCDV_3002()

    # Updates the files with the modified dictionaries
    data_helpers.write_data(
        CONDITIONS, "data/final_data/conditionsProcessed.json")
    data_helpers.write_data(COURSES, "data/final_data/coursesProcessed.json")

def WCDV_3002():
    """
    "original": "Students need to have completed a minimum of 96 UoC to undertake this course.<br/><br/>A WAM over 65 is required.<br/><br/>",
    "processed": "need to a 96UOC . 65WAM is required"
    """
    return "96UOC && 65WAM"


if __name__ == "__main__":
    fix_conditions()
