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
    python3 -m data.processors.manualFixes.ECONFixes
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
    CONDITIONS["ECON1101"] = ECON_1101(CONDITIONS["ECON1101"])
    CONDITIONS["ECON1203"] = ECON_1203("ECON1203", CONDITIONS["ECON1203"])
    CONDITIONS["ECON2206"][PROCESSED] = ECON_2206()
    CONDITIONS["ECON2403"][PROCESSED] = ECON_2403()
    CONDITIONS["ECON3000"][PROCESSED] = ECON_3000()
    CONDITIONS["ECON3208"][PROCESSED] = ECON_3208()
    CONDITIONS["ECON4100"][PROCESSED] = ECON_4100_3_6_4202_5_8_4301_2_7_9_11_50()
    CONDITIONS["ECON4103"][PROCESSED] = ECON_4100_3_6_4202_5_8_4301_2_7_9_11_50()
    CONDITIONS["ECON4106"][PROCESSED] = ECON_4100_3_6_4202_5_8_4301_2_7_9_11_50()
    CONDITIONS["ECON4150"][PROCESSED] = ECON_4150_2()
    CONDITIONS["ECON4151"][PROCESSED] = ECON_4150_2()
    CONDITIONS["ECON4152"][PROCESSED] = ECON_4150_2()
    CONDITIONS["ECON4160"][PROCESSED] = ECON_4160_2()
    CONDITIONS["ECON4161"][PROCESSED] = ECON_4160_2()
    CONDITIONS["ECON4162"][PROCESSED] = ECON_4160_2()
    CONDITIONS["ECON4170"][PROCESSED] = ECON_4170_2()
    CONDITIONS["ECON4171"][PROCESSED] = ECON_4170_2()
    CONDITIONS["ECON4172"][PROCESSED] = ECON_4170_2()
    CONDITIONS["ECON4201"] = ECON_4201(CONDITIONS["ECON4201"])
    CONDITIONS["ECON4202"][PROCESSED] = ECON_4100_3_6_4202_5_8_4301_2_7_9_11_50()
    CONDITIONS["ECON4205"][PROCESSED] = ECON_4100_3_6_4202_5_8_4301_2_7_9_11_50()
    CONDITIONS["ECON4208"][PROCESSED] = ECON_4100_3_6_4202_5_8_4301_2_7_9_11_50()
    CONDITIONS["ECON4301"][PROCESSED] = ECON_4100_3_6_4202_5_8_4301_2_7_9_11_50()
    CONDITIONS["ECON4302"][PROCESSED] = ECON_4100_3_6_4202_5_8_4301_2_7_9_11_50()
    CONDITIONS["ECON4303"][PROCESSED] = ECON_4303()
    CONDITIONS["ECON4307"][PROCESSED] = ECON_4100_3_6_4202_5_8_4301_2_7_9_11_50()
    CONDITIONS["ECON4309"][PROCESSED] = ECON_4100_3_6_4202_5_8_4301_2_7_9_11_50()
    CONDITIONS["ECON4310"][PROCESSED] = ECON_4100_3_6_4202_5_8_4301_2_7_9_11_50()
    CONDITIONS["ECON4311"][PROCESSED] = ECON_4100_3_6_4202_5_8_4301_2_7_9_11_50()
    CONDITIONS["ECON4350"][PROCESSED] = ECON_4100_3_6_4202_5_8_4301_2_7_9_11_50()

    # Updates the files with the modified dictionaries
    dataHelpers.write_data(
        CONDITIONS, "data/finalData/conditionsProcessed.json")
    dataHelpers.write_data(COURSES, "data/finalData/coursesProcessed.json")

def ECON_1101(conditions):
    """
    "original": "Excluded: Students in BCom single or double-degree programs, except for 3155 Actl/Comm and 3521 Comm/Econ, are not allowed to enrol in this course. <br/><br/>"
    
    "processed": ""

    "handbook_note": Excluded: Students in BCom single or double-degree programs, except for 3155 Actl/Comm and 3521 Comm/Econ, are not allowed to enrol in this course.
    """
    
    return {
        "original": conditions["original"],
        "processed": "",
        "handbook_note": "Excluded: Students in BCom single or double-degree programs, except for 3155 Actl/Comm and 3521 Comm/Econ, are not allowed to enrol in this course."
    }

def ECON_1203(code, conditions):
    """
    "original": "Excluded: MATH2841, MATH2801, MATH2901, MATH2099, ACTL2002 & ACTL2131. <br/>Also, must not be enrolled in a BCom single or double degree (except 3155 Actl/Comm or 3521 Comm/Econ), or program 3715 or 3764<br/><br/>"
    
    "processed": ""

    "handbook_note": "Also, must not be enrolled in a BCom single or double degree (except 3155 Actl/Comm or 3521 Comm/Econ)"
    """
    
    COURSES[code]["exclusions"]["MATH2841"] = 1
    COURSES[code]["exclusions"]["MATH2801"] = 1
    COURSES[code]["exclusions"]["MATH2901"] = 1
    COURSES[code]["exclusions"]["MATH2099"] = 1
    COURSES[code]["exclusions"]["ACTL2002"] = 1
    COURSES[code]["exclusions"]["ACTL2131"] = 1
    COURSES[code]["exclusions"]["3715"] = 1
    COURSES[code]["exclusions"]["3764"] = 1

    return {
        "original": conditions["original"],
        "processed": "",
        "handbook_note": "Also, must not be enrolled in a BCom single or double degree (except 3155 Actl/Comm or 3521 Comm/Econ)"
    }

def ECON_2206():
    """
    "original": "Pre-requisite conditions: ECON1203 or COMM1190 or ECON2403 or MATH1041 or MATH1231 or MATH1241 or MATH1251<br/><br/>"

    "processed": "conditions: ECON1203 || COMM1190 || ECON2403 || MATH1041 || MATH1231 || MATH1241 || MATH1251"
    """

    return "ECON1203 || COMM1190 || ECON2403 || MATH1041 || MATH1231 || MATH1241 || MATH1251"

def ECON_2403():
    """
    "original": "Prerequisites: PPEC1001 AND ECON1202 AND in program 3478 or 4797<br/><br/>"
    "processed": "PPEC1001 && ECON1202 && in program 3478 || 4797"
    """

    return "PPEC1001 && ECON1202 && (3478 || 4797)"

def ECON_3000():
    """
    "original": "Prerequisite: Completion of at least one of the following: ECON2112, ECON2206, ECON2209, FINS2624, RISK2002, MARK3087, MARK3054, MARK3088, MARK3089<br/><br/>"
    
    "processed": "at least one of the following: ECON2112, ECON2206, ECON2209, FINS2624, RISK2002, MARK3087, MARK3054, MARK3088, MARK3089"
    """

    return "ECON2112 || ECON2206 || ECON2209 || FINS2624 || RISK2002 || MARK3087 || MARK3054 || MARK3088 || MARK3089"

def ECON_3208():
    """
    "original": "Pre-requisite: ECON2206 OR (In Data Sciences and Decisions AND (MATH2831 or MATH2931))<br/><br/>"

    "processed": "ECON2206 || (In Data Sciences && Decisions && (MATH2831 || MATH2931))"
    """

    return "ECON2206 || (DATA# && (MATH2831 || MATH2931))"

def ECON_4100_3_6_4202_5_8_4301_2_7_9_11_50():
    """
    "original": "Admission to Economics Honours (program 4502 or stream ECONFH4501) or Actuarial Honours (program 4520)<br/><br/>"

    "processed": "Admission to Economics Honours (program 4502 || stream ECONFH4501) || Actuarial Honours (program 4520)"
    """

    return "(4502 || ECONFH4501) || 4520"

def ECON_4150_2():
    """
    "original": "Currently enrolled in program 4501 Commerce (Honours)<br/><br/>"
    
    "processed": "Currently program 4501 Commerce (Honours)"
    """

    return "4501"

def ECON_4160_2():
    """
    "original": "Admission to Economics Honours stream (ECONAH4502)<br/><br/>"
    
    "processed": "Admission to Economics Honours stream (ECONAH4502)"
    """

    return "ECONAH4502"

def ECON_4170_2():
    """
    "original": "Admission to Econometrics Honours stream (ECONEH4502)<br/><br/>"
    
    "processed": "Admission to Econometrics Honours stream (ECONEH4502)"
    """

    return "ECONEH4502"

def ECON_4201(conditions):
    """
    "original": "Pre-requisite: ECON4103<br/>Assumed knowledge: Familiarity with matrix algebra, introductory statistics and econometrics. Prior Knowledge in Statistical software or programming languages will be useful.<br/><br/>"
    
    "processed": "ECON4103"

    "handbook_note": "Assumed knowledge: Familiarity with matrix algebra && introductory statistics && econometrics. Prior Knowledge in Statistical software || programming languages will be useful"    
    """

    return {
        "original": conditions["original"],
        "processed": "ECON4103",
        "handbook_note": "Assumed knowledge: Familiarity with matrix algebra && introductory statistics && econometrics. Prior Knowledge in Statistical software || programming languages will be useful"
    }

def ECON_4303():
    """
    "original": "Pre-requisite: ECON4100 AND (in Economics Honours (4502) or in stream ECONFH4501)<br/><br/>"

    "processed": "ECON4100 && (in Economics Honours (4502) || in stream ECONFH4501)"
    """

    return "ECON4100 && (4502 || ECONFH4501)"


if __name__ == "__main__":
    fix_conditions()