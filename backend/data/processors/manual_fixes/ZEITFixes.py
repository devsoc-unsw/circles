"""
https://github.com/devsoc-unsw/circles/wiki/Manual-Fixes-to-Course-Prerequisites

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

    CONDITIONS["ZEIT3750"] = ZEIT_3750(CONDITIONS["ZEIT3750"])
    CONDITIONS["ZEIT3754"][PROCESSED] = ZEIT_3754()
    CONDITIONS["ZEIT3755"][PROCESSED] = ZEIT_3755()
    CONDITIONS["ZEIT3756"][PROCESSED] = ZEIT_3756()
    CONDITIONS["ZEIT4753"][PROCESSED] = ZEIT_4753()
    CONDITIONS["ZEIT4754"][PROCESSED] = ZEIT_4754()
    CONDITIONS["ZEIT4755"][PROCESSED] = ZEIT_4755()
    CONDITIONS["ZEIT4756"][PROCESSED] = ZEIT_4756()

    # Updates the files with the modified dictionaries
    data_helpers.write_data(
        CONDITIONS, "data/final_data/conditionsProcessed.json")
    data_helpers.write_data(COURSES, "data/final_data/coursesProcessed.json")

def ZEIT_3750(condition):
    """
    "original": "Students enrolled in B. Engineering programs offered by School of Engineering and Technology at UNSW Canberra<br/><br/>Student enrolled in 4484 B. Engineering (Naval Architecture) (Honours) offered by School of Engineering and Technology at UNSW Canberra<br/><br/>Students enrolled in B. Science Maritime Major or Minor offered by School of Science at UNSW Canberra<br/><br/>",
    "processed": "B. ENGG# offered by School of Engineering && Technology at UNSW Canberra 4484 B. Engineering (Naval Architecture) (Honours) offered by School of Engineering && Technology at UNSW Canberra B. Science Maritime Major || Minor offered by School of Science at UNSW Canberra"
    """
    return {
        "original": condition["original"],
        "processed": "",
        "handbook_note": "Restricted to students in B. Engineering programs offered by the School of Engineering and Technology, 4484 B. Engineering (Naval Architecture) (Honours), or the B. Science Maritime major or minor at UNSW Canberra."
    }

def ZEIT_3754():
    """
    "original": "Students enrolled in 4484 B. Engineering (Naval Architecture) (Honours) offered by School of Engineering and Technology at UNSW Canberra<br/><br/>Pre-requisite: ZEIT2503 <br/><br/>",
    "processed": "4484 B. Engineering (Naval Architecture) (Honours) offered by School of Engineering && Technology at UNSW Canberra ZEIT2503"
    """
    return "4484 && ZEIT2503"

def ZEIT_3755():
    """
    "original": "Students enrolled in 4484 B. Engineering (Naval Architecture) (Honours) offered by School of Engineering and Technology at UNSW Canberra<br/><br/>Prerequisite: ZEIT3750 and ZEIT3754 <br/><br/>",
    "processed": "4484 B. Engineering (Naval Architecture) (Honours) offered by School of Engineering && Technology at UNSW Canberra ZEIT3750 && ZEIT3754"
    """
    return "4484 && ZEIT3750 && ZEIT3754"

def ZEIT_3756():
    """
    "original": "Students enrolled in 4484 B. Engineering (Naval Architecture) (Honours) offered by School of Engineering and Technology at UNSW Canberra<br/><br/>Pre-requisite: ZEIT3754 <br/><br/>",
    "processed": "4484 B. Engineering (Naval Architecture) (Honours) offered by School of Engineering && Technology at UNSW Canberra ZEIT3754"
    """
    return "4484 && ZEIT3754"

def ZEIT_4753():
    """
    "original": "Prerequisite: ZEIT2504 and ZEIT3501 <br/><br/>Students enrolled in 4484 B. Engineering (Naval Architecture) (Honours) offered by School of Engineering and Technology at UNSW Canberra<br/><br/>",
    "processed": "ZEIT2504 && ZEIT3501 4484 B. Engineering (Naval Architecture) (Honours) offered by School of Engineering && Technology at UNSW Canberra"
    """
    return "4484 && ZEIT2504 && ZEIT3501"

def ZEIT_4754():
    """
    "original": "Students enrolled in 4484 B. Engineering (Naval Architecture) (Honours) offered by School of Engineering and Technology at UNSW Canberra<br/><br/>Prerequisite: ZEIT3750, ZEIT3754, ZEIT3755 and ZEIT3756<br/><br/>",
    "processed": "4484 B. Engineering (Naval Architecture) (Honours) offered by School of Engineering && Technology at UNSW Canberra ZEIT3750, ZEIT3754, ZEIT3755 && ZEIT3756"
    """
    return "4484 && ZEIT3750 && ZEIT3754 && ZEIT3755 && ZEIT3756"

def ZEIT_4755():
    """
    "original": "Students enrolled in 4484 B. Engineering (Naval Architecture) (Honours) offered by School of Engineering and Technology at UNSW Canberra<br/><br/>Prerequisite: ZEIT4753<br/><br/>",
    "processed": "4484 B. Engineering (Naval Architecture) (Honours) offered by School of Engineering && Technology at UNSW Canberra ZEIT4753"
    """
    return "4484 && ZEIT4753"

def ZEIT_4756():
    """
    "original": "Students enrolled in 4484 B. Engineering (Naval Architecture) (Honours) offered by School of Engineering and Technology at UNSW Canberra<br/><br/>Prerequisite: ZEIT4754 <br/><br/>",
    "processed": "4484 B. Engineering (Naval Architecture) (Honours) offered by School of Engineering && Technology at UNSW Canberra ZEIT4754"
    """
    return "4484 && ZEIT4754"


if __name__ == "__main__":
    fix_conditions()
