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
    python3 -m data.processors.manualFixes.MARKFixes
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
    CONDITIONS["MARK2101"][PROCESSED] = MARK_2101()
    CONDITIONS["MARK3054"] = MARK_3054(CONDITIONS["MARK3054"])
    CONDITIONS["MARK3085"] = MARK_3085(CONDITIONS["MARK3085"])
    CONDITIONS["MARK3087"] = MARK_3087_3088_3089(CONDITIONS["MARK3087"])
    CONDITIONS["MARK3088"] = MARK_3087_3088_3089(CONDITIONS["MARK3088"])
    CONDITIONS["MARK3089"] = MARK_3087_3088_3089(CONDITIONS["MARK3089"])
    CONDITIONS["MARK3202"][PROCESSED] = MARK_3202_3303()
    CONDITIONS["MARK3303"][PROCESSED] = MARK_3202_3303()
    CONDITIONS["MARK4210"] = MARK_4210_4211_4212_4213(CONDITIONS["MARK4210"])
    CONDITIONS["MARK4211"] = MARK_4210_4211_4212_4213(CONDITIONS["MARK4211"])
    CONDITIONS["MARK4212"] = MARK_4210_4211_4212_4213(CONDITIONS["MARK4212"])
    CONDITIONS["MARK4213"] = MARK_4210_4211_4212_4213(CONDITIONS["MARK4213"])







    # Updates the files with the modified dictionaries
    dataHelpers.write_data(
        CONDITIONS, "data/finalData/conditionsProcessed.json")
    dataHelpers.write_data(COURSES, "data/finalData/coursesProcessed.json")

# TODO: implement your functions here

def MARK_2101():
    """
    "original": "Enrolled in plan MARKB13554<br/><br/>",

    "processed": "MARKB13554"
    """
    return "MARKB13554"

def MARK_3054(conditions):
    """
    "original": "Pre-requisite: ECON1203 or MARK2052. If students can demonstrate they have equivalent statistics knowledge, but haven't completed any of the listed pre-requisite courses, they can seek permission from Program Coordinator by submitting an online form.<br/><br/>",

    "processed": "ECON1203 || MARK2052",

    "handbook_note": "If students can demonstrate they have equivalent statistics knowledge, but haven't completed any of the listed pre-requisite courses, 
    they can seek permission from Program Coordinator by submitting an online form.<br/><br/>"
    """
    return {
        "original": conditions["original"],
        "processed": "ECON1203 || MARK2052",
        "handbook_note": "If students can demonstrate they have equivalent statistics knowledge, but haven't completed any of the listed pre-requisite courses, they can seek permission from Program Coordinator by submitting an online form"
    }

def MARK_3085(conditions):
    """
    "original": "Pre-requisite: (MARK1012 OR MARK2012) or (ECON1203 OR COMM1110). If students can demonstrate they have equivalent statistics knowledge, but haven't completed any of the listed pre-requisite courses, they can seek permission from Program Coordinator by submitting an online form.<br/><br/>",

    "processed": "(MARK1012 || MARK2012) || (ECON1203 || COMM1110). 

    "handbook_note": "If students can demonstrate they have equivalent statistics knowledge, but haven't completed any of the listed pre-requisite courses, they can seek permission from Program Coordinator by submitting an online form"
    """
    
    return {
        "original": conditions["original"],
        "processed": "(MARK1012 || MARK2012) || (ECON1203 || COMM1110)",
        "handbook_note": "If students can demonstrate they have equivalent statistics knowledge, but haven't completed any of the listed pre-requisite courses, they can seek permission from Program Coordinator by submitting an online form"
    }

def MARK_3087_3088_3089(conditions):

    """
    "original": "Pre-requisite: ECON1203 or INFS1609 or MATH1041 or MATH1231 or MATH1241 or MATH1251 or MARK2052 or COMM2050 or COMM2501 or INFS2605 or INFS2609.<br/>Students with equivalent Statistics knowledge can seek pre-requisite waiver via webforms<br/><br/>",

    "processed": "ECON1203 || INFS1609 || MATH1041 || MATH1231 || MATH1241 || MATH1251 || MARK2052 || COMM2050 || COMM2501 || INFS2605 || INFS2609."

    "handbook_note": <br/>Students with equivalent Statistics knowledge can seek pre-requisite waiver via webforms<br/><br/>",
    """
    return {
        "original": conditions["original"],
        "processed": "ECON1203 || INFS1609 || MATH1041 || MATH1231 || MATH1241 || MATH1251 || MARK2052 || COMM2050 || COMM2501 || INFS2605 || INFS2609",
        "handbook_note": "Students with equivalent Statistics knowledge can seek pre-requisite waiver via webforms"
    }


def MARK_3202_3303():
    """
    "original": "Prerequisite: MARK2101 and enrolled in plan MARKB13554<br/><br/>",

    "processed": "MARK2101 && MARKB13554"
    """
    return "MARK2101 && MARKB13554"


def MARK_4210_4211_4212_4213(conditions):
    """
    "original": conditions["original"],

    "processed": ""

    "handbook_note": "Admission to Honours in Marketing",
    """


    return {
        "original": conditions["original"],
        "processed": "",
        "handbook_note": "Requires Admission to Honours in Marketing"
    }

if __name__ == "__main__":
    fix_conditions()