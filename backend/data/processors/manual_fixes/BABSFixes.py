"""
https://github.com/csesoc/Circles/wiki/Manual-Fixes-to-Course-Prerequisites

If you make a mistake and need to regenerate condition
"""

from data.utility import data_helpers

CONDITIONS = data_helpers.read_data("data/final_data/conditionsProcessed.json")
PROCESSED = "processed"

COURSES = data_helpers.read_data("data/final_data/coursesProcessed.json")


def fix_conditions():
    """ Functions to apply manual fixes """
    CONDITIONS["BABS3041"][PROCESSED] = BABS_3041()
    CONDITIONS["BABS3061"][PROCESSED] = BABS_3061()
    data_helpers.write_data(
        CONDITIONS, "data/final_data/conditionsProcessed.json")
    data_helpers.write_data(COURSES, "data/final_data/coursesProcessed.json")

def BABS_3041():
    '''
        "original": "Prerequisite: BIOC2101 or (BIOC2181and MICR2011) or (BIOC2181 and BABS2202)<br/><br/>",
        "processed": "BIOC2101 || (BIOC2181and MICR2011) || (BIOC2181 && BABS2202)"
    '''
    return "BIOC2101 || (BIOC2181 && MICR2011) || (BIOC2181 && BABS2202)"

def BABS_3061():
    '''
        "original": "Prerequisites: BIOC2101 or LIFE2101, BIOC2201<br/><br/>",
        "processed": "BIOC2101 || LIFE2101, BIOC2201"
    '''
    return "BIOC2101 || LIFE2101 || BIOC2201"
if __name__ == "__main__":
    fix_conditions()
