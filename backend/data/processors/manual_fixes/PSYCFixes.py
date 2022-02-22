"""
https://github.com/csesoc/Circles/wiki/Manual-Fixes-to-Course-Prerequisites

Apply manual COMP fixes to processed conditions in conditionsProcessed.json so 
that they can be fed into algorithms.

If you make a mistake and need to regenerate conditionsProcessed.json, then you
can run:
    python3 -m data.processors.conditionsPreprocessing

To then run this file:
    python3 -m data.processors.manualFixes.PSYCFixes
"""

from data.utility import data_helpers

CONDITIONS = data_helpers.read_data("data/final_data/conditionsProcessed.json")
PROCESSED = "processed"

COURSES = data_helpers.read_data("data/final_data/coursesProcessed.json")

def fix_conditions():
    """ Functions to apply manual fixes """

    CONDITIONS["PSYC2061"][PROCESSED] = PSYC_2061_2081();
    CONDITIONS["PSYC2071"][PROCESSED] = PSYC_2061_2081();
    CONDITIONS["PSYC2081"][PROCESSED] = PSYC_2061_2081();
    # CONDITIONS["PSYC2001"][PROCESSED] = PSYC_2001();
    CONDITIONS["PSYC2061"][PROCESSED] = PSYC_2061_2081();
    CONDITIONS["PSYC2071"][PROCESSED] = PSYC_2061_2081();
    CONDITIONS["PSYC2081"][PROCESSED] = PSYC_2061_2081();
    # CONDITIONS["PSYC2101"][PROCESSED] = PSYC_2001();
    # CONDITIONS["PSYC3001"][PROCESSED] = PSYC_3011();
    CONDITIONS["PSYC3011"][PROCESSED] = PSYC3011();
    CONDITIONS["PSYC3051"][PROCESSED] = PSYC3051_PSYC3241();
    CONDITIONS["PSYC3241"][PROCESSED] = PSYC3051_PSYC3241();
    CONDITIONS["PSYC3121"][PROCESSED] = PSYC3121_PSYC3301();
    # CONDITIONS["PSYC3202"][PROCESSED] = PSYC_3051();
    # CONDITIONS["PSYC3211"][PROCESSED] = PSYC_3051();
    # CONDITIONS["PSYC3221"][PROCESSED] = PSYC_3051();
    CONDITIONS["PSYC3241"][PROCESSED] = PSYC3051_PSYC3241();
    CONDITIONS["PSYC3301"][PROCESSED] = PSYC3121_PSYC3301();
    CONDITIONS["PSYC3331"][PROCESSED] = PSYC3331();
    CONDITIONS["PSYC3361"][PROCESSED] = PSYC3361();
    CONDITIONS["PSYC4072"][PROCESSED] = PSYC4072_4073_4093_4103();
    CONDITIONS["PSYC4073"][PROCESSED] = PSYC4072_4073_4093_4103();
    CONDITIONS["PSYC4093"][PROCESSED] = PSYC4072_4073_4093_4103();
    CONDITIONS["PSYC4103"][PROCESSED] = PSYC4072_4073_4093_4103();

    # CONDITIONS["PSYC1021"][PROCESSED] = PSYC_3241();

    data_helpers.write_data(
        CONDITIONS, "data/final_data/conditionsProcessed.json")
    data_helpers.write_data(COURSES, "data/final_data/coursesProcessed.json")

def PSYC_2061_2081():
	return "PSYC1001 && PSYC1011"

def PSYC2001():
    return "PSYC1001 && PSYC1011 && PSYC1111"

def PSYC3011():
    return "PSYC2001 && PSYC2061 && PSYC2071 && PSYC2081 && PSYC2101"

def PSYC3051_PSYC3241():
    return "PSYC2001 && PSYC2081"

def PSYC3121_PSYC3301():
    return "PSYC2001 && PSYC2061"

def PSYC3211_PSYC3221_PSYC3311():
    return "PSYC2001 && PSYC2071"

def PSYC3331():
    return "(PSYC2001 || PSYC2061 || PSYC2101) || (HESC3504 && 3871)"

def PSYC3361():
    return "72UOC in PSYC && 80WAM"

def PSYC4072_4073_4093_4103():
    return "PSYCAH"



if __name__ == "__main__":
    fix_conditions()