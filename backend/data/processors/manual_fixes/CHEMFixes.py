"""
https://github.com/csesoc/Circles/wiki/Manual-Fixes-to-Course-Prerequisites

Apply manual [code] fixes to processed conditions in conditionsProcessed.json so
that they can be fed into algorithms.

If you make a mistake and need to regenerate conditionsProcessed.json, then you
can run:
    python3 -m data.processors.conditionsPreprocessing

To then run this file:
    python3 -m data.processors.manualFixes.CHEMFixes
"""

from data.utility import data_helpers

# Reads conditionsProcessed dictionary into 'CONDITIONS'
CONDITIONS = data_helpers.read_data("data/final_data/conditionsProcessed.json")
PROCESSED = "processed"

# Reads coursesProcessed dictionary into 'COURSES' (for updating exclusions)
COURSES = data_helpers.read_data("data/final_data/coursesProcessed.json")


def fix_conditions():
    """ Functions to apply manual fixes """

    CONDITIONS["CHEM1521"][PROCESSED] = CHEM_1521()
    CONDITIONS["CHEM1777"][PROCESSED] = CHEM_1777()

    # Updates the files with the modified dictionaries
    data_helpers.write_data(
        CONDITIONS, "data/final_data/conditionsProcessed.json")
    data_helpers.write_data(COURSES, "data/final_data/coursesProcessed.json")

def CHEM_1521():
    """
        "original": "Pre-req of Prerequisite: CHEM1011 Chemistry 1A or equivalent. Exclusion: CHEM1021<br/><br/>",
        "processed": "of CHEM1011 Chemistry 1A || equivalent"
    """
    return "CHEM1011"

def CHEM_1777():
    """
        "original": "Presumed knowledge is Year 10 General Science.<br/><br/>",
        "processed": "knowledge is Year 10 General Science"
    """
    return ""


if __name__ == "__main__":
    fix_conditions()
