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
    CONDITIONS["INFS1609"][PROCESSED] = INFS1609()
    CONDITIONS["INFS2101"][PROCESSED] = INFS2101()
    CONDITIONS["INFS2605"][PROCESSED] = INFS2605()

    CONDITIONS["INFS3302"][PROCESSED] = INFS_3302_3303()
    CONDITIONS["INFS3303"][PROCESSED] = INFS_3302_3303()

    CONDITIONS["INFS3830"][PROCESSED] = INFS_3830_3873()
    CONDITIONS["INFS3873"][PROCESSED] = INFS_3830_3873()

    CONDITIONS["INFS4831"][PROCESSED] = INFS_4831_4854_4886()
    CONDITIONS["INFS4854"][PROCESSED] = INFS_4831_4854_4886()
    CONDITIONS["INFS4886"][PROCESSED] = INFS_4831_4854_4886()

    CONDITIONS["INFS4858"][PROCESSED] = INFS_4858_4907()
    CONDITIONS["INFS4907"][PROCESSED] = INFS_4858_4907()

    CONDITIONS["INFS4887"][PROCESSED] = INFS4887()
    



    # Updates the files with the modified dictionaries
    dataHelpers.write_data(
        CONDITIONS, "data/finalData/conditionsProcessed.json")
    dataHelpers.write_data(COURSES, "data/finalData/coursesProcessed.json")

# TODO: implement your functions here

# PROBLEM FUNCTION
def INFS1609():
    return "COMP?1 && COMP#"

def INFS2101():
    return "(INFSCH3964 || INFSCH3971) && (INFS1609 || INFS2609) && INFS2603) OR (INFSB13554 && INFS2603)"

def INFS2605():

    # Add exclusions to courseProcessed.json. Assumes that 'majors' includes
    # honours programs
    COURSES["INFS2605"]["exclusions"]["COMP?1"] = 1
    COURSES["INFS2605"]["exclusions"]["COMP?H"] = 1
    COURSES["INFS2605"]["exclusions"]["BINF?1"] = 1
    COURSES["INFS2605"]["exclusions"]["BINF?H"] = 1
    COURSES["INFS2605"]["exclusions"]["SENGAH"] = 1

    return "INFS1603 && (INFS2609 || INFS1609)"

def INFS_3302_3303():
    return "INFS2101 && (INFSB13554 || INFSCH3971 || INFSCH3964)"

def INFS3603():
    return "INFS1602 || INFS2602 || ((3959 || COMMJ1) && 48UOC)"

def INFS_3830_3873():
    COURSES["INFS3830"]["warning"] = "Students wishing to meet SAS certification must complete INFS3603. Completion of COMM2501 in lieu of INFS3603 will not be considered equivalent for the certificate"
    COURSES["INFS3873"]["warning"] = "Students wishing to meet SAS certification must complete INFS3603. Completion of COMM2501 in lieu of INFS3603 will not be considered equivalent for the certificate"
    return "INFS3603 || (COMM2501 && COMMJ)"

def INFS_4831_4854_4886():
    return "INFS?H"

def INFS_4858_4907():
    return "INFSAH || INFSBH || INFSCH"

def INFS4887():
    return "INFS4886 && INFS?H"
``
if __name__ == "__main__":
    fix_conditions()