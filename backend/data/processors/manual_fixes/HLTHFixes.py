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

    CONDITIONS["HLTH1000"][PROCESSED] = HLTH_1000()
    for course in ("HLTH4009", "HLTH4010", "HLTH4017", "HLTH4018"):
        CONDITIONS[course][PROCESSED] = HLTH_4009_4010_4017_4018()

    # Updates the files with the modified dictionaries
    data_helpers.write_data(
        CONDITIONS, "data/final_data/conditionsProcessed.json")
    data_helpers.write_data(COURSES, "data/final_data/coursesProcessed.json")

def HLTH_1000():
    """
    "original": "Prerequisite:  Enrolment in 3894 Nutrition/Dietetics and Food Innovation <br/>OR 3895 Pharmaceutical Medicine/Pharmacy<br/>OR 3896 Exercise Science/Physiotherapy and Exercise Physiology<br/>OR 3897 Applied Exercise Science/Clinical Exercise Physiology<br/>OR 3181 Vision Science<br/>OR 3182 Vision Science/ Clinical Optometry<br/><br/>",
    "processed": "(3894) || (3895) || (3896) || (3897) || 3181 Vision Science || 3182 Vision Science/ Clinical Optometry"
    """
    return "3894 || 3895 || 3896 || 3897 || 3181 || 3182"

def HLTH_4009_4010_4017_4018():
    """
    "original": "Enrolled in HLTHAH Health Sciences specialisation<br/><br/>",
    "processed": "HLTHAH Health Sciences specialisation"
    """
    return "HLTHAH"


if __name__ == "__main__":
    fix_conditions()
