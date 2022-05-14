"""
https://github.com/csesoc/Circles/wiki/Manual-Fixes-to-Course-Prerequisites

Apply manual [code] fixes to processed conditions in conditionsProcessed.json so
that they can be fed into algorithms.

If you make a mistake and need to regenerate conditionsProcessed.json, then you
can run:
    python3 -m data.processors.conditionsPreprocessing

To then run this file:
    python3 -m data.processors.manualFixes.CHEMFixes
"""

from data.utility import data_helpers

# Reads conditionsProcessed dictionary into 'CONDITIONS'
CONDITIONS = data_helpers.read_data("data/final_data/conditionsProcessed.json")
PROCESSED = "processed"

# Reads coursesProcessed dictionary into 'COURSES' (for updating exclusions)
COURSES = data_helpers.read_data("data/final_data/coursesProcessed.json")


def fix_conditions():
    """ Functions to apply manual fixes """

    CONDITIONS["CHEM1521"][PROCESSED] = CHEM_1521()
    CONDITIONS["CHEM1777"][PROCESSED] = CHEM_1777()
    CONDITIONS["CHEM2521"][PROCESSED] = CHEM_2521()

    # Updates the files with the modified dictionaries
    data_helpers.write_data(
        CONDITIONS, "data/final_data/conditionsProcessed.json")
    data_helpers.write_data(COURSES, "data/final_data/coursesProcessed.json")


def CHEM_1521():
    """
        "original": "Pre-req of Prerequisite: CHEM1011 Chemistry 1A or equivalent. Exclusion: CHEM1021<br/><br/>",
        "processed": "of CHEM1011 Chemistry 1A || equivalent"
    """
    return "CHEM1011"

def CHEM_1777():
    """
        "original": "Presumed knowledge is Year 10 General Science.<br/><br/>",
        "processed": "knowledge is Year 10 General Science"
    """
    return ""

def CHEM_2521():
    """
        "original": "This is the main Level 2 Organic Chemistry course taught within the School of Chemistry.<br/>It assumes knowledge of CHEM1011 and CHEM1021 or CHEM1031 and CHEM1041 or CHEM1051 and CHEM1061, AND CHEM2041. It is a core element in Chemistry major programs. It is also required for industrial chemistry, biochemistry and medicinal chemistry programs.<br/><br/>",
        "processed": "This is the main L2 Organic Chemistry course taught within the School of Chemistry. It assumes knowledge of CHEM1011 && CHEM1021 || CHEM1031 && CHEM1041 || CHEM1051 && CHEM1061 && CHEM2041. It is a core element in Chemistry major programs. It is also required for industrial chemistry, biochemistry && medicinal chemistry programs"
    """
    return "((CHEM1011 && CHEM1021) || (CHEM1031 && CHEM1041) || (CHEM1051 && 1061)) && CHEM2041"


if __name__ == "__main__":
    fix_conditions()
