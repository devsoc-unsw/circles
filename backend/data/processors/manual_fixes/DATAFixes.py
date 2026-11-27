"""
https://github.com/devsoc-unsw/circles/wiki/Manual-Fixes-to-Course-Prerequisites

Copy this into a new file for the relevant faculty's fixes:
e.g. COMPFixes.py, ACCTFixes.py, PSYCFixes.py

Apply manual DESN fixes to processed conditions in conditionsProcessed.json so
that they can be fed into algorithms.

If you make a mistake and need to regenerate conditionsProcessed.json, then you
can run:
    python3 -m data.processors.conditionsPreprocessing

To then run this file:
    python3 -m data.processors.manualFixes.DESNFixes
"""

from data.utility import data_helpers

# Reads conditionsProcessed dictionary into 'CONDITIONS'
CONDITIONS = data_helpers.read_data("data/final_data/conditionsProcessed.json")
PROCESSED = "processed"

# Reads coursesProcessed dictionary into 'COURSES' (for updating exclusions)
COURSES = data_helpers.read_data("data/final_data/coursesProcessed.json")


def fix_conditions():
    """ Functions to apply manual fixes """

    CONDITIONS["DATA3001"][PROCESSED] = DATA_3001()
    CONDITIONS["DATA3002"] = DATA_3002(CONDITIONS["DATA3002"])

    # Updates the files with the modified dictionaries
    data_helpers.write_data(
        CONDITIONS, "data/final_data/conditionsProcessed.json")
    data_helpers.write_data(COURSES, "data/final_data/coursesProcessed.json")

def DATA_3001():
    """
        "original": "Prerequisite: Enrolment in 3959 Data Science program<br/><br/>",
        "processed": "Enrolment in 3959 Data Science program"
    """
    return "3959"

def DATA_3002(condition):
    """
    "original": "Prerequisite: DATA1001 or MATH1041 or MATH2089 or MATH2099 or MATH2801 or MATH2831 or MATH2859 or MATH2901 or MATH2831 or MATH3821 or MATH5806 or COMM1190 or ECON1203 or ECON2206 or ACTL3142 or BEES2041 or ACTL1101<br/><br/>Completed 12 UoC of Stage 2 courses<br/><br/>",
    "processed": "DATA1001 || MATH1041 || MATH2089 || MATH2099 || MATH2801 || MATH2831 || MATH2859 || MATH2901 || MATH2831 || MATH3821 || MATH5806 || COMM1190 || ECON1203 || ECON2206 || ACTL3142 || BEES2041 || ACTL1101 12UOC of Stage 2 courses"
    """
    return {
        "original": condition["original"],
        "processed": "(DATA1001 || MATH1041 || MATH2089 || MATH2099 || MATH2801 || MATH2831 || MATH2859 || MATH2901 || MATH3821 || MATH5806 || COMM1190 || ECON1203 || ECON2206 || ACTL3142 || BEES2041 || ACTL1101) && 12UOC in L2",
        "handbook_note": "Must have completed 12 UOC of Stage 2 courses."
    }


if __name__ == "__main__":
    fix_conditions()
