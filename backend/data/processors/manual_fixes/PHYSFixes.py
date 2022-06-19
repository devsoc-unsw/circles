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
    CONDITIONS["PHYS1221"][PROCESSED] = PHYS_1221()

    # Updates the files with the modified dictionaries
    data_helpers.write_data(
        CONDITIONS, "data/final_data/conditionsProcessed.json")
    data_helpers.write_data(COURSES, "data/final_data/coursesProcessed.json")

def PHYS_1221():
    """
        "original": "Prerequisite: PHYS1121 or PHYS1131 or DPST1023 or PHYS1141; Corequisite: MATH1231 or DPST1014 or MATH1241 or MATH1251<br/><br/>",
        "processed": "PHYS1121 || PHYS1131 || DPST1023 || PHYS1141 && [MATH1231 || DPST1014 || MATH1241 || MATH1251]"
    """
    return "(PHYS1121 || PHYS1131 || DPST1023 || PHYS1141) && [MATH1231 || DPST1014 || MATH1241 || MATH1251]"

def PHYS_1231():
    """
        "original": "Prerequisite: PHYS1121 or PHYS1131 or DPST1023 or PHYS1141; Corequisite: MATH1231 or DPST1014 or MATH1241 or MATH1251<br/><br/>",
        "processed": "65GRADE in PHYS1121 || PHYS1131 || DPST1023 || PHYS1141 && [MATH1231 || DPST1014 || MATH1241 || MATH1251]"
    """
    return "(65GRADE in PHYS1121 || PHYS1131 || DPST1023 || PHYS1141) && [MATH1231 || DPST1014 || MATH1241 || MATH1251]"

if __name__ == "__main__":
    fix_conditions()
