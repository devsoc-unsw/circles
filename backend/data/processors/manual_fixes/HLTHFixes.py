"""
https://github.com/csesoc/Circles/wiki/Manual-Fixes-to-Course-Prerequisites

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

    # TODO: call your functions here
    CONDITIONS['HLTH1001'][PROCESSED] = HLTH_1001()
    # Updates the files with the modified dictionaries
    data_helpers.write_data(
        CONDITIONS, "data/final_data/conditionsProcessed.json")
    data_helpers.write_data(COURSES, "data/final_data/coursesProcessed.json")

def HLTH_1001():
    """
        "original": "Co-requisite: DIET1001 or PHRM1011 or EXPT1182<br/><br/>Prerequisite: Enrolment in 3894 Nutrition/Dietetics and Food Innovation<br/>OR 3895 Pharmaceutical Medicine/Pharmacy<br/>OR 3896 Exercise Science/Physiotherapy and Exercise Physiology<br/>OR 3897 Applied Exercise Science/Clinical Exercise Physiology<br/><br/>",
        "processed": "[DIET1001 || PHRM1011 || EXPT1182 (3894) || (3895) || (3896) || (3897)]"

    """
    return "[DIET1001 || PHRM1011 || EXPT1182] && ((3894) || (3895) || (3896) || (3897))"

if __name__ == "__main__":
    fix_conditions()
