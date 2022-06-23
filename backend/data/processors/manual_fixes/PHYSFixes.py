"""
https://github.com/csesoc/Circles/wiki/Manual-Fixes-to-Course-Prerequisites

Apply manual [code] fixes to processed conditions in conditionsProcessed.json so
that they can be fed into algorithms.

If you make a mistake and need to regenerate conditionsProcessed.json, then you
can run:
    python3 -m data.processors.conditionsPreprocessing

To then run this file:
    python3 -m data.processors.manualFixes.MUSCFixes
"""

from data.utility import data_helpers

# Reads conditionsProcessed dictionary into 'CONDITIONS'
CONDITIONS = data_helpers.read_data("data/final_data/conditionsProcessed.json")
PROCESSED = "processed"

# Reads coursesProcessed dictionary into 'COURSES' (for updating exclusions)
COURSES = data_helpers.read_data("data/final_data/coursesProcessed.json")


def fix_conditions():
    """ Functions to apply manual fixes """

    CONDITIONS["PHYS1116"][PROCESSED] = PHYS_1116()

    # Updates the files with the modified dictionaries
    data_helpers.write_data(
        CONDITIONS, "data/final_data/conditionsProcessed.json")
    data_helpers.write_data(COURSES, "data/final_data/coursesProcessed.json")

def PHYS_1116():
    """
        "original": "PHYS1121/1131/1141 Physics 1A as co-requisite or pre-requisite.<br/><br/>Exclusion - PHYS1160 Introduction to Astronomy<br/><br/>",
        "processed": "PHYS1121/1131/1141 Physics 1A as && [||]"
    """
    return "[ PHYS1121 || PHYS1131 || PHYS1141 ]"


if __name__ == "__main__":
    fix_conditions()
