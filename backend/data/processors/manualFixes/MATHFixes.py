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
    python3 -m data.processors.manualFixes.MATHFixes
"""

from data.utility import dataHelpers

# Reads conditionsProcessed dictionary into 'CONDITIONS'
CONDITIONS = dataHelpers.read_data("data/finalData/conditionsProcessed.json")
PROCESSED = "processed"

# Reads coursesProcessed dictionary into 'COURSES' (for updating exclusions)
COURSES = dataHelpers.read_data("data/finalData/coursesProcessed.json")

def fix_conditions():
    """ Functions to apply manual fixes """
    CONDITIONS["MATH1011"][PROCESSED] = MATH_1011("MATH1011")
    CONDITIONS["MATH1041"][PROCESSED] = MATH_1041("MATH1041")
    CONDITIONS["MATH1099"] = MATH_1099(CONDITIONS["MATH1099"])

    codes = ["MATH3000", "MATH3001", "MATH3002","MATH3041","MATH3511","MATH3521","MATH3560","MATH3570"]
    for code in codes:
        CONDITIONS[code][PROCESSED] = MATH_3000_8()    
    
    CONDITIONS["MATH3051"][PROCESSED] = MATH_3051()
    CONDITIONS["MATH3101"][PROCESSED] = MATH_3101_3121()
    CONDITIONS["MATH3121"][PROCESSED] = MATH_3101_3121()
    CONDITIONS["MATH3161"][PROCESSED] = MATH_3161()
    CONDITIONS["MATH3171"][PROCESSED] = MATH_3171()
    CONDITIONS["MATH3261"][PROCESSED] = MATH_3261()
    CONDITIONS["MATH3361"][PROCESSED] = MATH_3361()
    CONDITIONS["MATH3531"][PROCESSED] = MATH_3531()
    CONDITIONS["MATH3611"] = MATH_3611_3701(CONDITIONS["MATH3611"])
    CONDITIONS["MATH3701"] = MATH_3611_3701(CONDITIONS["MATH3701"])
    CONDITIONS["MATH3711"] = MATH_3711(CONDITIONS["MATH3711"])
    CONDITIONS["MATH3801"][PROCESSED] = MATH_3801()
    CONDITIONS["MATH3851"][PROCESSED] = MATH_3851()
    CONDITIONS["MATH3901"][PROCESSED] = MATH_3901()
    CONDITIONS["MATH4001"][PROCESSED] = MATH_4001()
    CONDITIONS["MATH6781"][PROCESSED] = MATH_6781()

    # Updates the files with the modified dictionaries
    dataHelpers.write_data(
        CONDITIONS, "data/finalData/conditionsProcessed.json")
    dataHelpers.write_data(COURSES, "data/finalData/coursesProcessed.json")

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

def MATH_1099(condition):
    """
    "original": Co-Op Scholar enrolled in 3956 or 3959<br/><br/>

    "processed": 3956 || 3959

    "warning": Must be a Co-Op Scholar
    """
    
    return {
        "original": condition["original"],
        "processed": "3956 || 3959",
        "warning": "Must be a Co-Op Scholar"
    }

def MATH_3000_8():
    """
    "original": "Prerequisite: 12 units of credit in Level 2 Maths courses.<br/><br/>",
    "processed": "12UOC in L2 MATH"
    """
    return "12UOC in L2 MATH"

def MATH_3051():
    """
    "original": "Prerequisite: 12UOC of second year mathematics courses, including MATH2011 or MATH2111 or MATH2069(DN).<br/><br/>",
    
    "processed": "12UOC in L2 MATHS && (MATH2011 || MATH2111 || 75GRADE in MATH2069)"
    """
    return "12UOC in L2 MATH && (MATH2011 || MATH2111 || 75GRADE in MATH2069)"

def MATH_3101_3121():
    """
    "original": "Prerequisite: 12 units of credit in Level 2 Math courses including (MATH2011 or MATH2111 and MATH2120 or MATH2130 or MATH2121 or MATH2221), or (both MATH2019 (DN) and MATH2089), or (both MATH2069 (CR) and MATH2099)<br/><br/>",
    
    "processed": "12UOC in L2 MATHS && ((MATH2011 || MATH2111) && (MATH2120 || MATH2130 || MATH2121 || MATH2221) || (75GRADE in MATH2019 && MATH2089) || (65GRADE in MATH2069 && MATH2099))"
    """
    return "12UOC in L2 MATH && ((MATH2011 || MATH2111) && (MATH2120 || MATH2130 || MATH2121 || MATH2221) || (75GRADE in MATH2019 && MATH2089) || (65GRADE in MATH2069 && MATH2099))"

def MATH_3161():
    """
    "original": "Prerequisite: 12 units of credit in Level 2 Mathematics courses including MATH2011 or MATH2111 or MATH2510, and MATH2501 or MATH2601, or both MATH2019(DN) and MATH2089, or both MATH2069(CR) and MATH2099.<br/><br/>",
   
    "processed": "12UOC in L2 MATH && ((MATH2011 || MATH2111 || MATH2510) && (MATH2501 || MATH2601) || (75GRADE in MATH2019 && MATH2089) || (65GRADE in MATH2069 && MATH2099))"
    """
    return "12UOC in L2 MATH && ((MATH2011 || MATH2111 || MATH2510) && (MATH2501 || MATH2601) || (75GRADE in MATH2019 && MATH2089) || (65GRADE in MATH2069 && MATH2099))"

def MATH_3171():
    """
    "original": "(1) [MATH2011 or MATH2111] and [MATH2501 or MATH2601]; or (2) both MATH2069 (CR) and MATH2099 ; or (3) both [MATH2018 or MATH2019] (DN) and MATH2089 .<br/><br/>",
    "processed": "((MATH2011 || MATH2111) && (MATH2501 || MATH2601)) || ((65GRADE in MATH2069) && MATH2099) || ((MATH2018 || 75GRADE in MATH2019) && MATH2089)"
    """

    return "((MATH2011 || MATH2111) && (MATH2501 || MATH2601)) || (65GRADE in MATH2069 && MATH2099) || ((75GRADE in MATH2018 || 75GRADE in MATH2019) && MATH2089)"

def MATH_3261():
    """
    "original": "Prerequisite: 12 units of credit in Level 2 Math courses including (MATH2011 or MATH2111) and (MATH2120 or MATH2130 or MATH2121 or MATH2221), or (both MATH2019 (DN) and MATH2089), or (both MATH2069 (DN) and MATH2099)<br/><br/>",
    
    "processed": "12UOC in L2 MATH && ((MATH2011 || MATH2111) && (MATH2120 || MATH2130 || MATH2121 || MATH2221)) || (75GRADE in MATH2019 && MATH2089) || (75GRADE in MATH2069 && MATH2099)"
    """

    return "12UOC in L2 MATH && ((MATH2011 || MATH2111) && (MATH2120 || MATH2130 || MATH2121 || MATH2221)) || (75GRADE in MATH2019 && MATH2089) || (75GRADE in MATH2069 && MATH2099)"

def MATH_3361():
    """
    "original": "Prerequisite: MATH2011 or MATH2111 or MATH2018 (DN) or MATH2019(DN) or MATH2069(DN) and MATH2801 or MATH2901 or MATH2089(DN) or MATH2099(DN)<br/><br/>",

    "processed": "(MATH2011 || MATH2111 || 75GRADE in MATH2018 || 75GRADE in MATH2019 || 75GRADE in MATH2069) && (MATH2801 || MATH2901 || 75GRADE in MATH2089 || 75GRADE in MATH2099)"
    """

    return "(MATH2011 || MATH2111 || 75GRADE in MATH2018 || 75GRADE in MATH2019 || 75GRADE in MATH2069) && (MATH2801 || MATH2901 || 75GRADE in MATH2089 || 75GRADE in MATH2099)"

def MATH_3531():
    """
    "original": "Prerequisite: 12 units of credit in Level 2 Math courses including MATH2011 or MATH2111 or MATH2069.<br/><br/>",
    
    "processed": "12UOC in L2 MATH && (MATH2011 || MATH2111 || MATH2069)"
    """

    return "12UOC in L2 MATH && (MATH2011 || MATH2111 || MATH2069)"

def MATH_3611_3701(condition):
    """
    "original": "Prerequisite: 12 UOC of Level 2 Mathematics with an average mark of at least 70, including MATH2111 or MATH2011 (CR) or MATH2510 (CR), or permission from the Head of Department.<br/><br/>",

    "processed": "12UOC in L2 Mathematics with an average 70GRADE && MATH2111 || 65GRADE in MATH2011 || 65GRADE in MATH2510 || permission from the Head of Department" 
    
    "warning": "Can circumvent prerequisites with permission from Head of Department"
    """
    return {
        "original": condition["original"],
        "processed": "12UOC in L2 MATH && 70GRADE in L2 MATH && (MATH2111 || 65GRADE in MATH2011 || 65GRADE in MATH2510)",
        "warning": "Can circumvent prerequisites with permission from Head of Department"
    }

def MATH_3711(condition):
    """
    "original": "Prerequisite: 12 UOC of Level 2 Mathematics with an average mark of at least 70, including MATH2601 or MATH2501 (CR), or permission from the Head of Department.<br/><br/>",

    "processed": "12UOC in L2 MATH && 70GRADE in L2 MATH && (MATH2601 || 65GRADE in MATH2501)"
    """
    return {
        "original": condition["original"],
        "processed": "12UOC in L2 MATH && 70GRADE in L2 MATH && (MATH2601 || 65GRADE in MATH2501)",
        "warning": "Can circumvent prerequisites with permission from Head of Department"
    }

def MATH_3801():
    """
    "original": "Prerequisite: MATH2501 or MATH2601 and MATH2011 or MATH2111 or MATH2510 or MATH2610 and MATH2801 or MATH2901.<br/><br/>",

    "processed": "(MATH2501 || MATH2601) && (MATH2011 || MATH2111 || MATH2510 || MATH2610) && (MATH2801 || MATH2901)"
    """
    return "(MATH2501 || MATH2601) && (MATH2011 || MATH2111 || MATH2510 || MATH2610) && (MATH2801 || MATH2901)"

def MATH_3851():
    """
    "original": "Prerequisite: MATH2801 OR MATH2901 AND MATH2831 OR MATH2931.<br/><br/>",

    "processed": "(MATH2801 || MATH2901) && (MATH2831 || MATH2931)"
    """
    return "(MATH2801 || MATH2901) && (MATH2831 || MATH2931)"

def MATH_3901():
    """
    "original": "Prerequisite: MATH2901 or MATH2801(DN) and MATH2501 or MATH2601 and MATH2011 or MATH2111 or MATH2510 or MATH2610.<br/><br/>",

    "processed": "(MATH2901 || 75GRADE in MATH2801) && (MATH2501 || MATH2601) && (MATH2011 || MATH2111 || MATH2510 || MATH2610)"
    """
    return "(MATH2901 || 75GRADE in MATH2801) && (MATH2501 || MATH2601) && (MATH2011 || MATH2111 || MATH2510 || MATH2610)"

def MATH_4001():
    """
    "original": "Prerequisite: Enrolled in MATH Honours stream<br/><br/>",

    "processed": "MATH?H"
    """
    return "MATH?H"

def MATH_6781():
    """
    "original": "12 units of credit in Level 2 Mathematics courses including (MATH2120 or MATH2130 or MATH2121 or MATH2221), or both MATH2019 and MATH2089, or both MATH2069 and MATH2099<br/><br/>",
    
    "processed": "12UOC in L2 MATH && ((MATH2120 || MATH2130 || MATH2121 || MATH2221) || (MATH2019 && MATH2089) || (MATH2069 && MATH2099))"
    """
    return "12UOC in L2 MATH && ((MATH2120 || MATH2130 || MATH2121 || MATH2221) || (MATH2019 && MATH2089) || (MATH2069 && MATH2099))"

if __name__ == "__main__":
    fix_conditions()
