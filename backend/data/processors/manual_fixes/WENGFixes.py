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

    CONDITIONS["WENG3005"] = WENG_3005(CONDITIONS["WENG3005"])

    # Updates the files with the modified dictionaries
    data_helpers.write_data(
        CONDITIONS, "data/final_data/conditionsProcessed.json")
    data_helpers.write_data(COURSES, "data/final_data/coursesProcessed.json")

def WENG_3005(condition):
    """
    "original": "Prerequisite: WENG1002 and WENG2002 and enrolled in a BSc Computer Science major with completion of 102 UOC.<br/><br/>",
    "processed": "WENG1002 && WENG2002 && a BSc Computer Science major && 102UOC"
    """
    return {
        "original": condition["original"],
        "processed": "WENG1002 && WENG2002 && 102UOC",
        "handbook_note": "Must be enrolled in a BSc Computer Science major."
    }


if __name__ == "__main__":
    fix_conditions()
