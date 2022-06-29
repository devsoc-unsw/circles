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

    CONDITIONS["PATH2201"][PROCESSED] = PATH_2201()
    CONDITIONS["PATH3210"][PROCESSED] = PATH_2201()

    # Updates the files with the modified dictionaries
    data_helpers.write_data(
        CONDITIONS, "data/final_data/conditionsProcessed.json")
    data_helpers.write_data(COURSES, "data/final_data/coursesProcessed.json")


def PATH_2201():
    """
        "original": "Prerequisite: OPTM6400 and OPTM6413, or, completion of OPTM3211, OPTM3231, PHAR3306, and VISN3211<br/>Corequisite: OPTM6412<br/><br/>",
        "processed": "OPTM6400 && OPTM6413 && or && OPTM3211 && OPTM3231 && PHAR3306 && VISN3211 && [OPTM6412]"
    """


    return  "((OPTM6400 && OPTM6413) || (OPTM3211 && OPTM3231 && PHAR3306 && VISN3211)) && [OPTM6412]"

def PATH_3210():
    """
        "original": "72 UOC including one of these courses: ANAT2111/1521/2241/2521/2341/2511, BABS2011/2202/2204, BIOC2181/2101, MICR2011, NEUR2201, PATH2201, PHAR2011, PHSL2101/2121/2201/2221, CHEM2041, NANO2002<br/><br/>",
        "processed": "72UOC && one of these courses: ANAT2111/1521/2241/2521/2341/2511, BABS2011/2202/2204, BIOC2181/2101, MICR2011, NEUR2201, PATH2201, PHAR2011, PHSL2101/2121/2201/2221, CHEM2041, NANO2002"
    """
    return "72UOC && (ANAT2111 || ANAT1521 || ANAT2241 || ANAT2521 || ANAT2341 || ANAT2511 || BABS2011 || BABS2202 || BABS2204 || BIOC2181 || BIOC2181 || MICR2011 || NEUR2201 || PATH2201 || PHAR2011 || PHSL2101 || PHSL2121 || PHSL2201 || PHSL2221 || CHEM2041 || NANO2002)"
if __name__ == "__main__":
    fix_conditions()
