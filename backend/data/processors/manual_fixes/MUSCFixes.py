"""
https://github.com/csesoc/Circles/wiki/Manual-Fixes-to-Course-Prerequisites

Apply manual [code] fixes to processed conditions in conditionsProcessed.json so
that they can be fed into algorithms.

If you make a mistake and need to regenerate conditionsProcessed.json, then you
can run:
    python3 -m data.processors.conditionsPreprocessing

To then run this file:
    python3 -m data.processors.manualFixes.MUSCFixes
"""

from data.utility import data_helpers

# Reads conditionsProcessed dictionary into 'CONDITIONS'
CONDITIONS = data_helpers.read_data("data/final_data/conditionsProcessed.json")
PROCESSED = "processed"

# Reads coursesProcessed dictionary into 'COURSES' (for updating exclusions)
COURSES = data_helpers.read_data("data/final_data/coursesProcessed.json")


def fix_conditions():
    """ Functions to apply manual fixes """

    CONDITIONS["MUSC3105"][PROCESSED] = MUSC_3105()
    CONDITIONS["MUSC4101"][PROCESSED] = MUSC_4101()

    # Updates the files with the modified dictionaries
    data_helpers.write_data(
        CONDITIONS, "data/final_data/conditionsProcessed.json")
    data_helpers.write_data(COURSES, "data/final_data/coursesProcessed.json")


def MUSC_3105():
    """
            "original": "Prerequisite: 24 units of credit in Music courses, including 12 at Level 1 and enrolment in a single or dual Music program. Or 48 UOC overall, including 6 UOC level 1 Music and 6 UOC level 2 Music and enrolment in a Music major or minor<br/><br/>",
            "processed": "24UOC in Music courses && 12 at L1 && enrolment in a single || dual Music program. || 48UOC && 6UOC L1 Music && 6UOC L2 Music && enrolment in a Music major || minor"
    """

    # TODO: add proper warnings/handbook notes/conditions about enrolment in the correct program - since the enrolment requirements change depending on how you satisfy the prereq I'm not sure how to best go about this

    return "(24UOC in MUSC && 12UOC in L1 MUSC) || (48UOC && 6UOC in L1 MUSC && 6UOC in L2 MUSC)"

def MUSC_4101():
    """
        "original": "Prerequisite: Level 1, 2 and 3 core Music courses and enrolment in a Music single or dual degree program; or 48 UoC overall including MUSC1602 or MUSC1604, and MUSC2116 and enrolment in a Music major in an Arts program<br/><br/>",
        "processed": "L1, 2 && 3 CORES Music courses && enrolment in a Music single || dual degree program; || 48UOC && MUSC1602 || MUSC1604 && MUSC2116 && enrolment in a Music major in an Arts program"
    """

    # TODO: add proper warnings/handbook notes/conditions about enrolment in the correct program - since the enrolment requirements change depending on how you satisfy the prereq I'm not sure how to best go about this

    return "(CORES in (L1 || L2 || L3)) || (48UOC && (MUSC1602 || MUSC1604) && MUSC2116)"


if __name__ == "__main__":
    fix_conditions()
