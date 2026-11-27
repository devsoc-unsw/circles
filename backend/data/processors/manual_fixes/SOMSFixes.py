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

    CONDITIONS["SOMS1912"][PROCESSED] = SOMS_1912()
    for course in ("SOMS4003", "SOMS4004"):
        CONDITIONS[course] = SOMS_4003_4004(CONDITIONS[course])

    # Updates the files with the modified dictionaries
    data_helpers.write_data(
        CONDITIONS, "data/final_data/conditionsProcessed.json")
    data_helpers.write_data(COURSES, "data/final_data/coursesProcessed.json")

def SOMS_1912():
    """
    "original": "Enrolment in:<br/>3894 Nutrition/Dietetics and Food Innovation <br/>or 3895 Pharmaceutical Medicine/Pharmacy <br/>or 3896 Exercise Science/Physiotherapy and Exercise Physiology <br/>or 3897 Applied Exercise Science/Clinical Exercise Physiology<br/>or 3181 Vision Science<br/>or 3182 Vision Science / Clinical Optometry<br/><br/>",
    "processed": ": (3894) || (3895) || (3896) || (3897) || 3181 Vision Science || 3182 Vision Science / Clinical Optometry"
    """
    return "3894 || 3895 || 3896 || 3897 || 3181 || 3182"

def SOMS_4003_4004(condition):
    """
    "original": "Enrolled in one of the SOMS honours specialisations (including BIOPAH)<br/><br/>",
    "processed": "one of the SOMS honours specialisations (&& BIOPAH)"
    """
    return {
        "original": condition["original"],
        "processed": "",
        "handbook_note": "Must be enrolled in one of the SOMS honours specialisations (including BIOPAH)."
    }


if __name__ == "__main__":
    fix_conditions()
