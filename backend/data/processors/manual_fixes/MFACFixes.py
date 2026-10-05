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

    for course in ("MFAC2511", "MFAC2512"):
        CONDITIONS[course][PROCESSED] = MFAC_2511_2512()
    for course in ("MFAC4491", "MFAC4492", "MFAC4493"):
        CONDITIONS[course][PROCESSED] = MFAC_4491_4492_4493()

    # Updates the files with the modified dictionaries
    data_helpers.write_data(
        CONDITIONS, "data/final_data/conditionsProcessed.json")
    data_helpers.write_data(COURSES, "data/final_data/coursesProcessed.json")

def MFAC_2511_2512():
    """
    "original": "Prerequisite: (MFAC1511,MFAC1512,MFAC1513) or (MFAC8002 and MFAC8003)<br/><br/>",
    "processed": "(MFAC1511,MFAC1512,MFAC1513) || (MFAC8002 && MFAC8003)"
    """
    return "(MFAC1511 && MFAC1512 && MFAC1513) || (MFAC8002 && MFAC8003)"

def MFAC_4491_4492_4493():
    """
    "original": "Enrolled in program (3805 Medicine or 3856 Medicine/Arts or 3831 Science (Medicine) Honours), and have successfully completed MFAC2514, MFAC2515, and MFAC2516<br/><br/>",
    "processed": "(3805 Medicine || 3856 Medicine/Arts || (3831) ) && have successfully MFAC2514, MFAC2515 && MFAC2516"
    """
    return "(3805 || 3856 || 3831) && MFAC2514 && MFAC2515 && MFAC2516"


if __name__ == "__main__":
    fix_conditions()
