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

    CONDITIONS["ARTS3250"] = ARTS_3250(CONDITIONS["ARTS3250"])
    CONDITIONS["ARTS3298"] = ARTS_3298(CONDITIONS["ARTS3298"])
    CONDITIONS["ARTS3876"] = ARTS_3876(CONDITIONS["ARTS3876"])

    # Updates the files with the modified dictionaries
    data_helpers.write_data(
        CONDITIONS, "data/final_data/conditionsProcessed.json")
    data_helpers.write_data(COURSES, "data/final_data/coursesProcessed.json")

def ARTS_3250(condition):
    """
    "original": "48 UOC overall, including 6 UOC at Level 1 and 6 UOC at Level 2 in the Geographical Studies specialisation OR completion of IEST5001 in a postgraduate Environmental Management program.<br/><br/>",
    "processed": "48UOC && 6UOC in L1 && 6UOC in L2 in the Geographical Studies specialisation || IEST5001 in a postgraduate Environmental Management program"
    """
    return {
        "original": condition["original"],
        "processed": "48UOC || IEST5001",
        "handbook_note": "Must include 6 UOC at Level 1 and 6 UOC at Level 2 in the Geographical Studies specialisation, or completion of IEST5001 in a postgraduate Environmental Management program."
    }

def ARTS_3298(condition):
    """
    "original": "Prerequisite: 48 UOC overall, including 6 UOC at Level 1 and 6 UOC at Level 2 in History.<br/><br/>",
    "processed": "48UOC && 6UOC in L1 && 6UOC in L2 in History"
    """
    return {
        "original": condition["original"],
        "processed": "48UOC",
        "handbook_note": "Must include 6 UOC at Level 1 and 6 UOC at Level 2 in History."
    }

def ARTS_3876(condition):
    """
    "original": "Prerequisite: 48 UOC overall, including 6 UOC at level 1 and 6 UOC at level 2 in the following specialisations: Sociology, Policy, Power and Government, Global Development, and Working with Communities<br/><br/>",
    "processed": "48UOC && 6UOC in L1 && 6UOC in L2 in the following specialisations: Sociology, Policy, Power && Government, Global Development && Working && Communities"
    """
    return {
        "original": condition["original"],
        "processed": "48UOC",
        "handbook_note": "Must include 6 UOC at Level 1 and 6 UOC at Level 2 in the following specialisations: Sociology, Policy, Power and Government, Global Development, and Working with Communities."
    }


if __name__ == "__main__":
    fix_conditions()
