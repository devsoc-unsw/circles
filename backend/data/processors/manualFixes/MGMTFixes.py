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
    python3 -m data.processors.manualFixes.MGMTFixes
"""
from data.utility import dataHelpers

# Reads conditionsProcessed dictionary into 'CONDITIONS'
CONDITIONS = dataHelpers.read_data("data/finalData/conditionsProcessed.json")
PROCESSED = "processed"

# Reads coursesProcessed dictionary into 'COURSES' (for updating exclusions)
COURSES = dataHelpers.read_data("data/finalData/coursesProcessed.json")

def fix_conditions():
    """ Functions to apply manual fixes """

    CONDITIONS["MGMT2101"][PROCESSED] = MGMT_2101()
    CONDITIONS["MGMT2718"][PROCESSED] = MGMT_2718()
    CONDITIONS["MGMT3001"][PROCESSED] = MGMT_3001()
    CONDITIONS["MGMT3004"] = MGMT_3004()
    CONDITIONS["MGMT3102"][PROCESSED] = MGMT_3102()
    CONDITIONS["MGMT3110"] = MGMT_3110()
    CONDITIONS["MGMT3728"][PROCESSED] = MGMT_3728()
    CONDITIONS["MGMT3730"][PROCESSED] = MGMT_3730()

    ibusHonours = ["MGMT4101", "MGMT4500", "MGMT4501"]
    for course in ibusHonours:
        CONDITIONS[course] = MGMT_4101_4500_4501()

    hrmHonours = ["MGMT4104", "MGMT4738", "MGMT4739"]
    for course in hrmHonours:
        CONDITIONS[course] = MGMT_4104_4738_4739()
    
    # Updates the files with the modified dictionaries
    dataHelpers.write_data(
        CONDITIONS, "data/finalData/conditionsProcessed.json")
    dataHelpers.write_data(COURSES, "data/finalData/coursesProcessed.json")

# TODO: implement your functions here

def MGMT_2101():
    """
    "original": "Prerequisite or corequisite:MGMT1101or COMM1150  Excluded: IBUS2107<br/><br/>",
    "processed": "|| [MGMT1101or COMM1150]"
    """
    COURSES["MGMT2101"]["exclusions"]["IBUS2107"] = 1

    return "[MGMT1101 || COMM1150]"

def MGMT_2718():
    """
    "original": "Prerequisite or Co-requisite: MGMT1001 OR MGMT1101 OR MGMT1002 OR COMM1100 OR COMM1150 OR COMM1170<br/><br/>",
    "processed": "|| [MGMT1001 || MGMT1101 || MGMT1002 || COMM1100 || COMM1150 || COMM1170]"
    """
    return "[MGMT1001 || MGMT1101 || MGMT1002 || COMM1100 || COMM1150 || COMM1170]"

def MGMT_3001():
    """
    "original": "Prerequisite: MGMT1001or COMM1100 or COMM1120 or COMM1170 or 12 units of credit in Business courses<br/><br/>",
    "processed": "MGMT1001or COMM1100 || COMM1120 || COMM1170 || 12UOC in Business courses"
    """
    return "MGMT1001 || COMM1100 || COMM1120 || COMM1170 || 12UOC in F Business"

def MGMT_3004():
    return {
        "original": CONDITIONS["MGMT3004"]["original"],
        "processed": "96UOC",
        "warning": "Students must be in good standing"
    }

def MGMT_3102():
    """
    "original": "Prerequisite: MGMT1101or COMM1150<br/><br/>",
    "processed": "MGMT1101or COMM1150"
    """
    return "MGMT1101 || COMM1150"

def MGMT_3110():
    """
    "original": "MGMT2102 and completion of 72 UOC (if you are enrolled the Commerce International [program 3558], completion of the Commerce Overseas Program (Exchange) is also required)<br/><br/>",
    "processed": "MGMT2102 && 72UOC (if you are enrolled the Commerce International (program 3558), the Commerce Overseas Program (Exchange) is also required)"
    """
    return {
        "original": CONDITIONS["MGMT3110"]["original"],
        "processed": "MGMT2102 && 72UOC",
        "warning": "If you are enrolled the Commerce International (program 3558), the Commerce Overseas Program (Exchange) is also required"
    }

def MGMT_3728():
    """
    "original": "Prerequisite or Corequisite : MGMT2718<br/><br/>",
    "processed": "|| [: MGMT2718]"
    """
    return "[MGMT2718]"

def MGMT_3730():
    """
    "original": "Pre-requisite: MGMT2718 OR MGMT2001 OR MGMT2102 OR any Business Analytics Modelling I course (ECON2206, ECON2209 or RISK2002)<br/><br/>",
    "processed": "MGMT2718 || MGMT2001 || MGMT2102 || any Business Analytics Modelling I course (ECON2206 || ECON2209 || RISK2002)"
    """
    return "MGMT2718 || MGMT2001 || MGMT2102 || ECON2206 || ECON2209 || RISK2002"

def MGMT_4101_4500_4501():
    """
    "original": "Prerequisite: Program 4501 and enrolment in the International Business Honours plan is required.<br/><br/>",
    "processed": "Program 4501 && enrolment in the International Business Honours plan is required"
    """
    # Have not been able to locate a code for the IBUS honours plans. It appears
    # to be an IBUS specialisation with an additional course.
    return {
        "original": CONDITIONS["MGMT3110"]["original"],
        "processed": "4501",
        "warning": "enrolment in the International Business Honours plan is required"
    }

def MGMT_4104_4738_4739():
    """
    "original": "Prerequisite: Program 4501 and enrolled in the Human Resource Management Honours plan.<br/><br/>",
    "processed": "Program 4501 && the Human Resource Management Honours plan"
    """
    # Have not been able to locate a code for the HRM honours plan.
    return {
        "original": CONDITIONS["MGMT3110"]["original"],
        "processed": "4501",
        "warning": "enrolment in the Human Resource Management Honours plan is required"
    }


if __name__ == "__main__":
    fix_conditions()