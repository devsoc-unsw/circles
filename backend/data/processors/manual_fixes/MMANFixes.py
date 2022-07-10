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

    CONDITIONS["MMAN3200"][PROCESSED] = MMAN_3200()

    # Updates the files with the modified dictionaries
    data_helpers.write_data(
        CONDITIONS, "data/final_data/conditionsProcessed.json")
    data_helpers.write_data(COURSES, "data/final_data/coursesProcessed.json")


def MMAN_3200():
    """
        "original": "Prerequisite: MATH2019 or MATH2018 AND (MMAN1300 or CVEN1300 or ENGG1300 or DPST1072) AND ELEC1111. Exclusion: MECH3211, MTRN3212<br/><br/>",
        "processed": "MATH2019 || MATH2018 && (MMAN1300 || CVEN1300 || ENGG1300 || DPST1072) && ELEC1111"
    """


    return "(MATH2019 || MATH2018) && (MMAN1300 || CVEN1300 || ENGG1300 || DPST1072) && ELEC1111"

if __name__ == "__main__":
    fix_conditions()
