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
import sys
sys.path.append('../../..')
from data.utility import dataHelpers

# Reads conditionsProcessed dictionary into 'CONDITIONS'
CONDITIONS = dataHelpers.read_data("../../../data/finalData/conditionsProcessed.json")
PROCESSED = "processed"

# Reads coursesProcessed dictionary into 'COURSES' (for updating exclusions)
COURSES = dataHelpers.read_data("../../../data/finalData/coursesProcessed.json")

def fix_conditions():
    """ Functions to apply manual fixes """

    # TODO: call your functions here
    CONDITIONS["MGMT2101"][PROCESSED] = MGMT_2101()
    CONDITIONS["MGMT2718"][PROCESSED] = MGMT_2718()
    CONDITIONS["MGMT3001"][PROCESSED] = MGMT_3001()
    CONDITIONS["MGMT3102"][PROCESSED] = MGMT_3102()
    CONDITIONS["MGMT3110"] = MGMT_3110()
    CONDITIONS["MGMT3728"][PROCESSED] = MGMT_3728()
    CONDITIONS["MGMT3730"][PROCESSED] = MGMT_3730()
    CONDITIONS["MGMT4101"] = MGMT_4101()
    CONDITIONS["MGMT4104"] = MGMT_4104()
    CONDITIONS["MGMT4500"] = MGMT_4500()
    CONDITIONS["MGMT4501"] = MGMT_4501()
    CONDITIONS["MGMT4738"] = MGMT_4738()
    CONDITIONS["MGMT4739"] = MGMT_4739()
    
    # Updates the files with the modified dictionaries
    dataHelpers.write_data(
        CONDITIONS, "../../../data/finalData/conditionsProcessedt.json")
    dataHelpers.write_data(COURSES, "../../../data/finalData/coursesProcessedt.json")

# TODO: implement your functions here

def MGMT_2101():
    COURSES["MGMT2101"]["exclusions"]["IBUS2107"] = 1
    return "[MGMT1101 || COMM1150]"

def MGMT_2718():
    return "[MGMT1001 || MGMT1101 || MGMT1002 || COMM1100 || COMM1150 || COMM1170]"

def MGMT_3001():
    return "MGMT1001 || COMM1100 || COMM1120 || COMM1170 || 12UOC in Business courses"

def MGMT_3102():
    return "MGMT1101 || COMM1150"

def MGMT_3110():
    return {
        "original": CONDITIONS["MGMT3110"]["original"],
        "processed": "MGMT2102 && 72UOC",
        "warning": "if you are enrolled the Commerce International (program 3558), the Commerce Overseas Program (Exchange) is also required"
    }

def MGMT_3728():
    return "[MGMT2718]"

def MGMT_3730():
    return "MGMT2718 || MGMT2001 || MGMT2102 || (ECON2206 || ECON2209 || RISK2002)"

def MGMT_4101():
    return {
        "original": CONDITIONS["MGMT3110"]["original"],
        "processed": "4501",
        "warning": "enrolment in the International Business Honours plan is required"
    }

def MGMT_4104():
    return {
        "original": CONDITIONS["MGMT3110"]["original"],
        "processed": "4501",
        "warning": "enrolment in the Human Resource Management Honours plan is required"
    }

def MGMT_4500():
    return {
        "original": CONDITIONS["MGMT3110"]["original"],
        "processed": "4501",
        "warning": "enrolment in the International Business Honours plan is required"
    }

def MGMT_4501():
    return {
        "original": CONDITIONS["MGMT3110"]["original"],
        "processed": "4501",
        "warning": "enrolment in the International Business Honours plan is required"
    }

def MGMT_4738():
    return {
        "original": CONDITIONS["MGMT3110"]["original"],
        "processed": "4501",
        "warning": "enrolment in the Human Resource Management Honours plan is required"
    }

def MGMT_4739():
    return {
        "original": CONDITIONS["MGMT3110"]["original"],
        "processed": "4501",
        "warning": "enrolment in the Human Resource Management Honours plan is required"
    }


if __name__ == "__main__":
    fix_conditions()