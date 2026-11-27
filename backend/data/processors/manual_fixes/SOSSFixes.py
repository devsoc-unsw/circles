"""
https://github.com/devsoc-unsw/circles/wiki/Manual-Fixes-to-Course-Prerequisites

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
    # TODO: Fill in
    CONDITIONS["SOSS3025"] = SOSS_3025(CONDITIONS["SOSS3025"])

    # Updates the files with the modified dictionaries
    data_helpers.write_data(
        CONDITIONS, "data/final_data/conditionsProcessed.json")
    data_helpers.write_data(COURSES, "data/final_data/coursesProcessed.json")

def SOSS_3025(condition):
    """
    "original": "Prerequisite: 96 UOC overall. Students must have declared a major in Politics and International Relations, Global Development, or Sociology. <br/><br/>",
    "processed": "96UOC . must have declared a major in Politics && International Relations, Global Development || Sociology"
    """
    return {
        "original": condition["original"],
        "processed": "96UOC",
        "handbook_note": "Students must have declared a major in Politics and International Relations, Global Development, or Sociology."
    }


if __name__ == "__main__":
    fix_conditions()
