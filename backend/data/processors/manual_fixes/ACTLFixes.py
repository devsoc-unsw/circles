"""
https://github.com/csesoc/Circles/wiki/Manual-Fixes-to-Course-Prerequisites

Copy this into a new file for the relevant faculty's fixes: 
e.g. COMPFixes.py, ACCTFixes.py, PSYCFixes.py

Apply manual ACTL fixes to processed conditions in conditionsProcessed.json so 
that they can be fed into algorithms.

If you make a mistake and need to regenerate conditionsProcessed.json, then you
can run:
    python3 -m data.processors.conditionsPreprocessing

To then run this file:
    python3 -m data.processors.manualFixes.ACTLFixes
"""

from data.utility import data_helpers

# Reads conditionsProcessed dictionary into 'CONDITIONS'
CONDITIONS = data_helpers.read_data("data/final_data/conditionsProcessed.json")
PROCESSED = "processed"

# Reads coursesProcessed dictionary into 'COURSES' (for updating exclusions)
COURSES = data_helpers.read_data("data/final_data/coursesProcessed.json")

def fix_conditions():
    """ Functions to apply manual fixes """

    CONDITIONS["ACTL1101"][PROCESSED] = ACTL_1101()
    CONDITIONS["ACTL2101"][PROCESSED] = ACTL_2101()
    CONDITIONS["ACTL2102"][PROCESSED] = ACTL_2102()
    CONDITIONS["ACTL2111"][PROCESSED] = ACTL_2111()
    CONDITIONS["ACTL3142"][PROCESSED] = ACTL_3142()
    CONDITIONS["ACTL3162"][PROCESSED] = ACTL_3162()
    CONDITIONS["ACTL3191"][PROCESSED] = ACTL_3191()
    CONDITIONS["ACTL3192"] = ACTL_3192(CONDITIONS["ACTL3192"])
    CONDITIONS["ACTL3202"][PROCESSED] = ACTL_3202()
    CONDITIONS["ACTL3303"][PROCESSED] = ACTL_3303()
    CONDITIONS["ACTL4001"] = ACTL_4001(CONDITIONS["ACTL4001"])
    CONDITIONS["ACTL4003"][PROCESSED] = ACTL_4003()

    # Updates the files with the modified dictionaries
    data_helpers.write_data(
        CONDITIONS, "data/final_data/conditionsProcessed.json")
    data_helpers.write_data(COURSES, "data/final_data/coursesProcessed.json")

def ACTL_1101():
    """
    "original": "Prerequisite: MATH1151 AND in Actuarial Studies programs.<br/><br/>",
    
    "processed": "MATH1151 && in Actuarial Studies programs"
    """
    return "MATH1151 && ACTL#"

def ACTL_2101():
    """
    "original": "Prerequisite:Enrolment in Program 3587<br/><br/>",

    "processed": "Enrolment in Program 3587"
    """
    return "3587"

def ACTL_2102():
    """
    "original": "Pre-requisite: (ACTL2131 or MATH2901) and in Actuarial single or dual degrees.<br/><br/>",

    "processed": "(ACTL2131 || MATH2901) && in Actuarial single || dual degrees"    
    """
    return "(ACTL2131 || MATH2901) && ACTL#"

def ACTL_2111():
    """
    "original": "Pre-requsite: MATH1251 AND (ACTL1101 OR in MATHE1, MATHM1 or MATHT1 majors)<br/><br/>",

    "processed": "MATH1251 && (ACTL1101 || in MATHE1 || MATHM1 || MATHT1 majors)"   
    """
    return "MATH1251 && (ACTL1101 || (MATHE1 || MATHM1 || MATHT1))"  

def ACTL_3142():
    """
    "original": "Pre-requisite: ACTL2131 OR (MATH2931 and in B. Data Science and Decisions (3959)) OR (MATH2901 and MATH2931)<br/><br/>",

    "processed": "ACTL2131 || (MATH2931 && in B. Data Science && Decisions (3959)) || (MATH2901 && MATH2931)"
    """
    return "ACTL2131 || (MATH2931 && 3959) || (MATH2901 && MATH2931)"

def ACTL_3162():
    """
    "original": "Pre-requisite: ACTL2102 or (MATH2901 AND MATHE1, MATHM1 or MATHT1 major)<br/><br/>",

    "processed": "ACTL2102 || (MATH2901 && MATHE1 || MATHM1 || MATHT1 major)"   
    """
    return "ACTL2102 || (MATH2901 && (MATHE1 || MATHM1 || MATHT1))"

def ACTL_3191():
    """
    "original": "Pre-requisites: ECON2101 or (ECON1101 and ACTL1101) or (completed at least 84UOC and enrolled in a Commerce Program).<br/><br/>",

    "processed": "ECON2101 || (ECON1101 && ACTL1101) || ( 84UOC && a Commerce Program)"    
    """
    return "ECON2101 || (ECON1101 && ACTL1101) || (84UOC && COMM#)"

def ACTL_3192(condition):
    """
    "original": "Pre-requisites: ECON2101 or (ECON1101 and ACTL1101) or (completed at least 84UOC and enrolled in a Commerce Program) and be in good academic standing.<br/><br/>",

    "processed": "ECON2101 || (ECON1101 && ACTL1101) || ( 84UOC && a Commerce Program) && be in good academic standing"
    """
    return {
        "original": condition["original"],
        "processed": "ECON2101 || (ECON1101 && ACTL1101) || (84UOC && COMM#)",
        "handbook_note": "You must be in good academic standing to enroll in this course."
    }

def ACTL_3202():
    """
    "original": "Prerequisite: ACTL2101 and enrolment in program 3587<br/><br/>",

    "processed": "ACTL2101 && enrolment in program 3587"
    """
    return "ACTL2101 && 3587"

def ACTL_3303():
    """
    "original": "Prerequisite: ACTL3202 and enrolment in program 3587<br/><br/>",

    "processed": "ACTL3202 && enrolment in program 3587"  
    """
    return "ACTL3202 && 3587" 

def ACTL_4001(condition):
    """
    "original": "Pre-requisite: ACCT1511 or COMM1140, ACTL3141, ACTL3182, FINS1613 or COMM1180, ACTL3162, ACTL3151, ECON1102, 60+ WAM.<br/>Note: Students in 3587 may complete ACTL3141 as a co-requisite<br/><br/>",

    "processed": "ACCT1511 || COMM1140 || ACTL3141 || ACTL3182 || FINS1613 || COMM1180, ACTL3162, ACTL3151, ECON1102, 60WAM. Note: in 3587 may complete ACTL3141 as a []"  
    """
    return {
        "original": condition["original"],
        "processed": "(ACCT1511 || COMM1140) && ACTL3141 && ACTL3182 && (FINS1613 || COMM1180) && ACTL3162 && ACTL3151 && ECON1102 && 60WAM",
        "handbook_note": "Students in 3587 may complete ACTL3141 as a co-requisite."
    }

def ACTL_4003():
    """
    "original": "Students must be in Actuarial Studies (Honours).<br/><br/>",

    "processed": "must be in Actuarial Studies (Honours)"    
    """
    return "4520"

if __name__ == "__main__":
    fix_conditions()
