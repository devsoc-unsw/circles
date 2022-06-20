"""
https://github.com/csesoc/Circles/wiki/Manual-Fixes-to-Course-Prerequisites

Apply manual [code] fixes to processed conditions in conditionsProcessed.json so
that they can be fed into algorithms.

If you make a mistake and need to regenerate conditionsProcessed.json, then you
can run:
    python3 -m data.processors.conditionsPreprocessing

To then run this file:
    python3 -m data.processors.manualFixes.MDIAFixes
"""

import re

from data.utility import data_helpers

# Reads conditionsProcessed dictionary into 'CONDITIONS'
CONDITIONS = data_helpers.read_data("data/final_data/conditionsProcessed.json")
PROCESSED = "processed"

# Reads coursesProcessed dictionary into 'COURSES' (for updating exclusions)
COURSES = data_helpers.read_data("data/final_data/coursesProcessed.json")

PROGRAMS = data_helpers.read_data("data/final_data/programsProcessed.json")


def fix_conditions():
    """ Functions to apply manual fixes """

    CONDITIONS["MDIA3003"][PROCESSED] = MDIA_3003()
    # Updates the files with the modified dictionaries
    data_helpers.write_data(
        CONDITIONS, "data/final_data/conditionsProcessed.json")
    data_helpers.write_data(COURSES, "data/final_data/coursesProcessed.json")


def MDIA_3003():
    """
        "original": "Prerequisite: 66 units of credit overall, including 6 units of credit Level 2 MDIA core courses and enrolment in a Media (Communication & Journalism) or Media (PR & Advertising) program<br/><br/>",
        "processed": "66UOC && 6UOC L2 MDIA CORES courses && enrolment in a Media (Communication && Journalism) || Media (PR && Advertising) program"
    """

    # 3454 is Media (Comm & Journalism)
    non_spec_data: list = PROGRAMS["3454"]["components"]["non_spec_data"]
    core_courses = next(filter(lambda x: x["type"] == "prescribed_electives", iter(non_spec_data)))["courses"].keys()

    if not core_courses:
        return "ERROR[MDIA3003]: No core courses found for Media (Comm & Journalism)"

    core_courses = filter(lambda x: re.match(r"[A-Z]{4}2[0-9]{3}", x, flags=re.IGNORECASE),
                          core_courses)

    return f"66UOC && (6UOC in ({' || '.join(core_courses)})) && (3454 || 3453)"

if __name__ == "__main__":
    fix_conditions()
