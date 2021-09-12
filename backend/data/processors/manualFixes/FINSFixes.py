"""
https://github.com/csesoc/Circles/wiki/Manual-Fixes-to-Course-Prerequisites

Copy this into a new file for the relevant faculty's fixes: 
e.g. COMPFixes.py, ACCTFixes.py, PSYCFixes.py

Apply manual FINS fixes to processed conditions in conditionsProcessed.json so 
that they can be fed into algorithms.

If you make a mistake and need to regenerate conditionsProcessed.json, then you
can run:
    python3 -m data.processors.conditionsPreprocessing

To then run this file:
    python3 -m data.processors.manualFixes.FINSFixes
"""

from data.utility import dataHelpers

# Reads conditionsProcessed dictionary into 'CONDITIONS'
CONDITIONS = dataHelpers.read_data("data/finalData/conditionsProcessed.json")
PROCESSED = "processed"

# Reads coursesProcessed dictionary into 'COURSES' (for updating exclusions)
COURSES = dataHelpers.read_data("data/finalData/coursesProcessed.json")


def fix_conditions():
    """ Functions to apply manual fixes """

    CONDITIONS["FINS2101"][PROCESSED] = FINS_2101()
    CONDITIONS["FINS2622"][PROCESSED] = FINS_2622()
    CONDITIONS["FINS3202"][PROCESSED] = FINS_3202_3()
    CONDITIONS["FINS3203"][PROCESSED] = FINS_3202_3()
    CONDITIONS["FINS3626"][PROCESSED] = FINS_3626()
    CONDITIONS["FINS3630"][PROCESSED] = FINS_3630()
    CONDITIONS["FINS3645"][PROCESSED] = FINS_3645_6()
    CONDITIONS["FINS3646"][PROCESSED] = FINS_3645_6()
    CONDITIONS["FINS4774"][PROCESSED] = FINS_4774()
    CONDITIONS["FINS4775"][PROCESSED] = FINS_4775()
    CONDITIONS["FINS4776"][PROCESSED] = FINS_4776_7_9()
    CONDITIONS["FINS4777"][PROCESSED] = FINS_4776_7_9()
    CONDITIONS["FINS4779"][PROCESSED] = FINS_4776_7_9()
    CONDITIONS["FINS4792"][PROCESSED] = FINS_4792()

    # Updates the files with the modified dictionaries
    dataHelpers.write_data(
        CONDITIONS, "data/finalData/conditionsProcessed.json")
    dataHelpers.write_data(COURSES, "data/finalData/coursesProcessed.json")


def FINS_2101():
    """ 
    "original": "Enrolled in plan FINSD13554 or in FINSBH3565<br/><br/>",

    "processed": "plan FINSD13554 || in FINSBH3565"
    """

    # Legacy Handbook
    return "FINSD13554 || FINSBH3565"


def FINS_2622():
    """
    "original": "Prerequisite or co-requisite:FINS1612 and FINS2624<br/><br/>",

    "processed": "|| [FINS1612 && FINS2624]"
    """

    # BOTH prerequisite and corequisite
    return "(FINS1612 && FINS2624) || [FINS1612 && FINS2625]"


def FINS_3202_3():
    """
    "original": "Prerequisite: FINS2101 and enrolled in plan FINSD13554 or FINSBH3565<br/><br/>",

    "processed": "FINS2101 && plan FINSD13554 || FINSBH3565"
    """

    # Legacy Handbook
    return "FINS2101 && (FINSD13554 || FINSBH3565)"


def FINS_3626():
    """
    NOTE: CHANGED IN 2022. The 2022 version can be parsed though.
    "original": "Prerequisite: ACCT1511, FINS1613<br/><br/>",

    "processed": "ACCT1511, FINS1613"
    """

    return "(COMM1140 || ACCT1511) && (COMM1180 || FINS1613)"


def FINS_3630():
    """
    NOTE: CHANGED IN 2022
    "original": "Prerequisite: ACCT1511, FINS1613<br/><br/>",

    "processed": "ACCT1511, FINS1613"
    """

    return "FINS1612 && COMM1180"


def FINS_3645_6():
    """
    NOTE: CHANGED IN 2022
    "original": "Pre-requisite: FINS1612 OR (Business Analytics Major (COMMJ1) and FINS1613)<br/><br/>",

    "processed": "FINS1612 || (Business Analytics Major (COMMJ1) && FINS1613)"
    """

    return "FINS1612 || FINS1613 || (COMMJ1 && COMM1180)"


def FINS_4774():
    """
    NOTE: CHANGED IN 2022
    "original": "Prerequisite or Corequisite: FINS3775 or FINS4775 or enrolled in stream FINSAH4501<br/><br/>",

    "processed": "|| [FINS3775 || FINS4775 || stream FINSAH4501]"
    """

    return "(FINSAH4501 || FINSBH3565 || 4520) && (FINS3775 || FINS4775 || FINS4779)"


def FINS_4775():
    """
    NOTE: CHANGED IN 2022
    "original": "Prerequisite:70% or greater in FINS2624 and ECON1203<br/><br/>",

    "processed": "70% || greater in FINS2624 && ECON1203"
    """

    return "(70GRADE in FINS2624 && 70GRADE in ECON1203) || (FINSAH4501 || FINSBH3565 || 4520)"


def FINS_4776_7_9():
    """
    NOTE: CHANGED IN 2022
    "original": "Corequisite: Must be enrolled in program 4501 (Finance) or FINS3775 or FINS4775<br/><br/>",

    "processed": "[Must be program 4501 (Finance) || FINS3775 || FINS4775]"
    """

    return "(FINSAH4501 || FINSBH3565 || 4520) && ([FINS3775] || [FINS4775] || [FINS4779])"


def FINS_4792():
    """
    NOTE: CHANGED IN 2022
    "original": "Corequisite: Must be enrolled in program 4501 (Finance) or FINS3775 or FINS4775<br/><br/>",

    "processed": "[Must be program 4501 (Finance) || FINS3775 || FINS4775]"
    """

    return "(FINSAH4501 || FINSBH3565 || 4520) && ([FINS3775] || [FINS4775])"


if __name__ == "__main__":
    fix_conditions()
