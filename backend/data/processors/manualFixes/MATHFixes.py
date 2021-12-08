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

from data.utility import dataHelpers

# Reads conditionsProcessed dictionary into 'CONDITIONS'
CONDITIONS = dataHelpers.read_data("data/finalData/conditionsProcessed.json")
PROCESSED = "processed"

# Reads coursesProcessed dictionary into 'COURSES' (for updating exclusions)
COURSES = dataHelpers.read_data("data/finalData/coursesProcessed.json")

def fix_conditions():
    """ Functions to apply manual fixes """
    # TODO: call your functions here
    CONDITIONS["MATH1011"][PROCESSED] = MATH_1011()
    CONDITIONS["MATH1041"][PROCESSED] = MATH_1041()

    codes = ["MATH3000", "MATH3001", "MATH3002","MATH3041","AMTH3511","MATH3521","MATH3560","MATH3570"]
    for code in codes:
        CONDITIONS[code][PROCESSED] = MATH_3000_8()    

    CONDITIONS["MATH3101"][PROCESSED] = MATH_3101()
    CONDITIONS["MATH3121"][PROCESSED] = MATH_3121()
    CONDITIONS["MATH3161"][PROCESSED] = MATH_3161()
    CONDITIONS["MATH3171"][PROCESSED] = MATH_3171()
    CONDITIONS["MATH3261"][PROCESSED] = MATH_3261()
    CONDITIONS["MATH3531"][PROCESSED] = MATH_3531()
    CONDITIONS["MATH3611"][PROCESSED] = MATH_3611()
    CONDITIONS["MATH3701"][PROCESSED] = MATH_3701()
    CONDITIONS["MATH3711"][PROCESSED] = MATH_3711()
    CONDITIONS["MATH4001"][PROCESSED] = MATH_4001()
    CONDITIONS["MATH6781"][PROCESSED] = MATH_6781()

    # Updates the files with the modified dictionaries
    dataHelpers.write_data(
        CONDITIONS, "data/finalData/conditionsProcessed.json")
    dataHelpers.write_data(COURSES, "data/finalData/coursesProcessed.json")

# TODO: implement your functions here
def MATH_1011(code):
    """
    "original": "Exclusion: Not enrolled in 3991 or any UNSW Business Program and must not have completed MATH1031, 1131, 1141, 1151, ECON1202 or DPST1013<br/><br/>",
    "processed": ""
    """
    COURSES[code]["exclusions"]["3991"] = 1
    COURSES[code]["exclusions"]["BUSN#"] = 1
    COURSES[code]["exclusions"]["MATH1031"] = 1
    COURSES[code]["exclusions"]["MATH1131"] = 1
    COURSES[code]["exclusions"]["MATH1141"] = 1
    COURSES[code]["exclusions"]["MATH1151"] = 1
    COURSES[code]["exclusions"]["MATH1031"] = 1
    COURSES[code]["exclusions"]["ECON1202"] = 1
    COURSES[code]["exclusions"]["DPST1013"] = 1
    return ""

def MATH_1041(code):
    """
    "original": "Excluded: MATH2841<br/><br/>",
    "processed": ""
    """
    COURSES[code]["exclusions"]["MATH2841"] = 1
    return ""

def MATH_3000_8():
    """
    "original": "Prerequisite: 12 units of credit in Level 2 Maths courses.<br/><br/>",
    "processed": "12UOC in L2 MATH"
    """
    return "12UOC in L2 MATH"

def MATH_3171():
    """
    "original": "(1) [MATH2011 or MATH2111] and [MATH2501 or MATH2601]; or (2) both MATH2069 (CR) and MATH2099 ; or (3) both [MATH2018 or MATH2019] (DN) and MATH2089 .<br/><br/>",
    "processed": "((MATH2011 || MATH2111) && (MATH2501 || MATH2601)) || ((65GRADE in MATH2069) && MATH2099) || ((MATH2018 || 75GRADE in MATH2019) && MATH2089)"
    """
    return "((MATH2011 || MATH2111) && (MATH2501 || MATH2601)) || (65GRADE in MATH2069 && MATH2099) || ((75GRADE in MATH2018 || 75GRADE in MATH2019) && MATH2089)"


if __name__ == "__main__":
    fix_conditions()
