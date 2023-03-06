"""
https://github.com/csesoc/Circles/wiki/Manual-Fixes-to-Course-Prerequisites

Copy this into a new file for the relevant faculty's fixes:
e.g. COMPFixes.py, ACCTFixes.py, PSYCFixes.py

Apply manual DESN fixes to processed conditions in conditionsProcessed.json so
that they can be fed into algorithms.

If you make a mistake and need to regenerate conditionsProcessed.json, then you
can run:
    python3 -m data.processors.conditionsPreprocessing

To then run this file:
    python3 -m data.processors.manualFixes.DESNFixes
"""

from data.utility import data_helpers

# Reads conditionsProcessed dictionary into 'CONDITIONS'
CONDITIONS = data_helpers.read_data("data/final_data/conditionsProcessed.json")
PROCESSED = "processed"

# Reads coursesProcessed dictionary into 'COURSES' (for updating exclusions)
COURSES = data_helpers.read_data("data/final_data/coursesProcessed.json")


def fix_conditions():
    """ Functions to apply manual fixes """

    CONDITIONS["CDEV3500"] = CDEV_3500(CONDITIONS["CDEV3500"])
    CONDITIONS["CDEV3200"][PROCESSED] = CDEV_3200()

    # Updates the files with the modified dictionaries
    data_helpers.write_data(
        CONDITIONS, "data/final_data/conditionsProcessed.json")
    data_helpers.write_data(COURSES, "data/final_data/coursesProcessed.json")

def CDEV_3500(condition):
    """
        "original": "Enrolment is selective based on academic performance, co-curricular experience, and interview.<br/><br/>",
        "processed": "Enrolment is selective based on academic performance, co-curricular experience, and interview."
    """
    return {
        "original": condition["original"],
        "processed": "",
        "handbook_note": "Enrolment is selective based on academic performance, co-curricular experience, and interview."
    }

def CDEV_3200():
    """
        "original": "Prerequisite: Enrolment in 3959 Data Science program<br/><br/>",
        "processed": "Enrolment in 3959 Data Science program"
    """
    return "30UOC"


if __name__ == "__main__":
    fix_conditions()
