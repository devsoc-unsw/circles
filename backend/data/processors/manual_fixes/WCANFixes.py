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

    CONDITIONS["WCAN2005"][PROCESSED] = WCAN_2005()
    CONDITIONS["WCAN3004"][PROCESSED] = WCAN_3004()

    # Updates the files with the modified dictionaries
    data_helpers.write_data(
        CONDITIONS, "data/final_data/conditionsProcessed.json")
    data_helpers.write_data(COURSES, "data/final_data/coursesProcessed.json")

def WCAN_2005():
    """
    "original": "Prerequisite: WCAN1000 Organisational Behaviour (Bengaluru)<br/><br/>",
    "processed": "WCAN1000 Organisational Behaviour (Bengaluru)"
    """
    return "WCAN1000"

def WCAN_3004():
    """
    "original": "Prerequisite: WCAN1002 Introduction to Accounting<br/><br/>",
    "processed": "WCAN1002 Introduction to Accounting"
    """
    return "WCAN1002"


if __name__ == "__main__":
    fix_conditions()
