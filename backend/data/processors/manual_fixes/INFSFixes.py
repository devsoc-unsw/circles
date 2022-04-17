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
    python3 -m data.processors.manualFixes.INFSFixes
"""

from data.utility import data_helpers

# Reads conditionsProcessed dictionary into 'CONDITIONS'
CONDITIONS = data_helpers.read_data("data/final_data/conditionsProcessed.json")
PROCESSED = "processed"

# Reads coursesProcessed dictionary into 'COURSES' (for updating exclusions)
COURSES = data_helpers.read_data("data/final_data/coursesProcessed.json")


def fix_conditions():
    """ Functions to apply manual fixes """

    CONDITIONS["INFS1609"][PROCESSED] = INFS1609()
    CONDITIONS["INFS2101"][PROCESSED] = INFS2101()
    CONDITIONS["INFS2605"][PROCESSED] = INFS2605()

    CONDITIONS["INFS2822"][PROCESSED] = INFS_2822()

    CONDITIONS["INFS3202"][PROCESSED] = INFS_3202()
    CONDITIONS["INFS3303"][PROCESSED] = INFS_3303()

    CONDITIONS["INFS3603"][PROCESSED] = INFS_3603()

    CONDITIONS["INFS3830"] = INFS_3830_3873(CONDITIONS["INFS3830"])
    CONDITIONS["INFS3873"] = INFS_3830_3873(CONDITIONS["INFS3873"])

    CONDITIONS["INFS4831"][PROCESSED] = INFS_4831_4854_4886()
    CONDITIONS["INFS4854"][PROCESSED] = INFS_4831_4854_4886()
    CONDITIONS["INFS4886"][PROCESSED] = INFS_4831_4854_4886()

    CONDITIONS["INFS4858"][PROCESSED] = INFS_4858_4907()
    CONDITIONS["INFS4907"][PROCESSED] = INFS_4858_4907()

    CONDITIONS["INFS4887"][PROCESSED] = INFS4887()

    # Updates the files with the modified dictionaries
    data_helpers.write_data(
        CONDITIONS, "data/final_data/conditionsProcessed.json")
    data_helpers.write_data(COURSES, "data/final_data/coursesProcessed.json")


# PROBLEM FUNCTION
def INFS1609():
    """
    "original": "Students completing Computer Science degrees or majors (including BINF, COMP, or SENG) are excluded from this course.<br/><br/>",
    "processed": "Computer Science degrees || majors (&& BINF || COMP || SENG) are"
    """
    COURSES["INFS1609"]["exclusions"]["COMP#"] = 1
    COURSES["INFS1609"]["exclusions"]["COMP?1"] = 1

    return ""


def INFS2101():
    """
    "original": "Enrolled in plan (INFSCH3964 OR INFSCH3971) AND (INFS1609 OR INFS2609) AND INFS 2603; OR Enrolled in plan (INFSB13554) AND INFS2603<br/><br/>",
    "processed": "plan (INFSCH3964 || INFSCH3971) && (INFS1609 || INFS2609) && INFS 2603; || plan (INFSB13554) && INFS2603"
    """
    return "(INFSCH3964 || INFSCH3971) && (INFS1609 || INFS2609) && INFS2603) || (INFSB13554 && INFS2603)"


def INFS2605():
    """
    "original": "Prerequisite: INFS1603 AND (INFS2609 or INFS1609).<br/>Students completing Computer Science degrees or majors (including BINF, COMP, or SENG) are excluded from this course.<br/><br/>",
    "processed": "INFS1603 && (INFS2609 || INFS1609). Computer Science degrees || majors (&& BINF || COMP || SENG) are"
    """
    # Add exclusions to courseProcessed.json. Assumes that 'majors' includes
    # honours programs
    COURSES["INFS1609"]["exclusions"]["COMP#"] = 1
    COURSES["INFS1609"]["exclusions"]["COMP?1"] = 1

    return "INFS1603 && (INFS2609 || INFS1609)"


def INFS_2822():
    """
    "original": "Pre-requisite: Any of the following: COMM1190, OR  INFS1603/COMM1822 OR INFS1609/INFS2609<br/><br/>",
    "processed": "Any of the following: COMM1190 || (INFS1603 || COMM1822) || (INFS1609 || INFS2609)"
    """
    return "COMM1190 || (INFS1603 || COMM1822) || (INFS1609 || INFS2609)"


def INFS_3202():
    """
    "original": "Prerequisite: INFS2101 AND in Plan (INFSB13554 OR INFSCH3971 OR INFSCH3964)<br/><br/>",

    "processed": "INFS2101 && in Plan (INFSB13554 || INFSCH3971 || INFSCH3964)"
    """
    return "INFS2101 && (INFSB13554 || INFSCH3971 || INFSCH3964)"


def INFS_3303():
    """
    "original": "Prerequisite: INFS3202 and in (Plan INFSB13554 or INFSCH3964 or INFSCH3971)<br/><br/>",
    "processed": "INFS3202 && in (Plan INFSB13554 || INFSCH3964 || INFSCH3971)"
    """
    return "INFS3202 && (INFSB13554 || INFSCH3964 || INFSCH3971)"


def INFS_3603():
    """
    "original": "Pre-requisite: INFS1602 OR INFS2602 OR ((in program 3959 or completing Business Analytics major (COMMJ1)) AND completed 48 UOC)<br/><br/>",
    "processed": "INFS1602 || INFS2602 || ((in program 3959 || Business Analytics major (COMMJ1)) && 48UOC)"
    """
    return "INFS1602 || INFS2602 || ((3959 || COMMJ1) && 48UOC)"


def INFS_3830_3873(condition):
    """
    "original": "Pre-requisite: INFS3603 or (COMM2501 and in Business Analytics major (COMMJ)).<br/>Note: Students wishing to meet SAS certification must complete INFS3603. Completion of COMM2501 in lieu of INFS3603 will not be considered equivalent for the certificate.<br/><br/>",
    "processed": "INFS3603 || (COMM2501 && in Business Analytics major (COMMJ)). Note: wishing to meet SAS certification must complete INFS3603. COMM2501 in lieu of INFS3603 will not be considered equivalent for the certificate"
    """
    return {
        "original": condition["original"],
        "processed": "INFS3603 || (COMM2501 && COMMJ)",
        "handbook_note": "Students wishing to meet SAS certification must complete INFS3603. Completion of COMM2501 in lieu of INFS3603 will not be considered equivalent for the certificate"
    }


def INFS_4831_4854_4886():
    """
    "original": "Prerequisite: Enrolled in Honours majoring in Information Systems.<br/><br/>",
    "processed": "Honours majoring in Information Systems"
    """
    return "INFS?H"


def INFS_4858_4907():
    """
    "original": "Enrolment in Streams: Enrolled in an Honours Program majoring in Information Systems (INFSAH OR INFSBH OR INFSCH)<br/><br/>",
    "processed": "Enrolment in Streams: an Honours Program majoring in Information Systems (INFSAH || INFSBH || INFSCH)"
    """
    return "INFSAH || INFSBH || INFSCH"


def INFS4887():
    """
    "original": "Prerequisite: INFS4886 AND enrolled in Honours majoring in Information Systems.<br/><br/>",
    "processed": "INFS4886 && Honours majoring in Information Systems"
    """
    return "INFS4886 && INFS?H"


if __name__ == "__main__":
    fix_conditions()
