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

    CONDITIONS["OPTM6411"][PROCESSED] = OPTM_6411()

    # Updates the files with the modified dictionaries
    data_helpers.write_data(
        CONDITIONS, "data/final_data/conditionsProcessed.json")
    data_helpers.write_data(COURSES, "data/final_data/coursesProcessed.json")


def OPTM_6411():
    """
        "original": "Prerequisite: ANAT2241 plus any one of ANAT2111, ANAT1521, PHSL2101, BIOC2101, BIOC2181.<br/><br/>",
        "processed": "ANAT2241 && any one of ANAT2111, ANAT1521, PHSL2101, BIOC2101, BIOC2181"
    """


    return  "ANAT2241 && (ANAT2111 || ANAT1521 || PHSL2101 || BIOC2101 || BIOC2181)"

if __name__ == "__main__":
    fix_conditions()
