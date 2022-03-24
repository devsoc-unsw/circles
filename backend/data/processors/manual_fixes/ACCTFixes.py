"""
https://github.com/csesoc/Circles/wiki/Manual-Fixes-to-Course-Prerequisites

Copy this into a new file for the relevant faculty's fixes:
e.g. COMPFixes.py, ACCTFixes.py, PSYCFixes.py

Apply manual ACCT fixes to processed conditions in conditionsProcessed.json so
that they can be fed into algorithms.

If you make a mistake and need to regenerate conditionsProcessed.json, then you
can run:
    python3 -m data.processors.conditionsPreprocessing

To then run this file:
    python3 -m data.processors.manualFixes.ACCTFixes
"""

from data.utility import data_helpers

# Reads conditionsProcessed dictionary into 'CONDITIONS'
CONDITIONS = data_helpers.read_data("data/final_data/conditionsProcessed.json")
PROCESSED = "processed"

# Reads coursesProcessed dictionary into 'COURSES' (for updating exclusions)
COURSES = data_helpers.read_data("data/final_data/coursesProcessed.json")


def fix_conditions():
    """ Functions to apply manual fixes """

    CONDITIONS["ACCT2101"][PROCESSED] = ACCT_2101_3202_3303()

    CONDITIONS["ACCT2672"][PROCESSED] = ACCT_2672()

    CONDITIONS["ACCT3202"][PROCESSED] = ACCT_2101_3202_3303()
    CONDITIONS["ACCT3303"][PROCESSED] = ACCT_2101_3202_3303()

    CONDITIONS["ACCT3708"] = ACCT_3708(CONDITIONS["ACCT3708"])

    codes = ["ACCT4797", "ACCT4809", "ACCT4851", "ACCT4852", "ACCT4897"]
    for code in codes:
        CONDITIONS[code][PROCESSED] = ACCT_4797_4809_4851_4852_4897()

    # Updates the files with the modified dictionaries
    data_helpers.write_data(
        CONDITIONS, "data/final_data/conditionsProcessed.json")
    data_helpers.write_data(COURSES, "data/final_data/coursesProcessed.json")


def ACCT_2101_3202_3303():
    """
    "original": "Prerequisite: Enrolment in Accounting Co-op Major (ACCTB13554)<br/><br/>",

    "processed": "ACCTB13554"
    """
    return "ACCTB13554"


def ACCT_2672():
    """
    "original": "Pre-requisite: ACCT1501 AND 65+ WAM or <br/>COMM1140  AND 65+ WAM<br/><br/>",

    "processed": "ACCT1501 && 65WAM || COMM1140 && 65WAM"
    """
    return "(ACCT1501 && 65WAM) || (COMM1140 && 65WAM)"


def ACCT_3708(condition):
    """
    "original": "Prerequisite: ACCT2542 or approval from the School<br/><br/>",

    "processed": "ACCT2542",

    "handbook_note": "You need approval from the School of Accounting, Auditing and Taxation to enrol in this course"
    """
    return {
        "original": condition["original"],
        "processed": "ACCT2542",
        "handbook_note": "You need approval from the School of Accounting, Auditing and Taxation to enrol in this course."
    }


def ACCT_4797_4809_4851_4852_4897():
    """
    "original": "Prerequisite: Must be enrolled in program 4501 (Accounting)<br/><br/>",

    "processed": "4501"
    """
    return "4501"


if __name__ == "__main__":
    fix_conditions()
