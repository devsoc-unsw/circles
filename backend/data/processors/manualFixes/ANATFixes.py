"""
https://github.com/csesoc/Circles/wiki/Manual-Fixes-to-Course-Prerequisites

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

from data.utility import dataHelpers

# Reads conditionsProcessed dictionary into 'CONDITIONS'
CONDITIONS = dataHelpers.read_data("data/finalData/conditionsProcessed.json")
PROCESSED = "processed"

# Reads coursesProcessed dictionary into 'COURSES' (for updating exclusions)
COURSES = dataHelpers.read_data("data/finalData/coursesProcessed.json")

def fix_conditions():
    """ Functions to apply manual fixes """
    CONDITIONS["ANAT2241"][PROCESSED] = ANAT_2241()
    CONDITIONS["ANAT2111"][PROCESSED] = ANAT_2111()
    # Updates the files with the modified dictionaries
    dataHelpers.write_data(
        CONDITIONS, "data/finalData/conditionsProcessed.json")
    dataHelpers.write_data(COURSES, "data/finalData/coursesProcessed.json")

def ANAT_2241():
    """
        "original": "Prerequisites: BABS1201 (or DPST1051) AND 30 UOC<br/><br/>",
        "processed": "BABS1201 (or DPST1051) && 30UOC"
    """
    return "(BABS1201 || DPST1051) && 30UOC"

def ANAT_2111():
    """
        "original": "Prerequisite: A pass in BABS1201 or DPST1051 plus either a pass in ANAT2241 or BABS1202 or DPST1052 or BABS2202 or BABS2204 or BIOC2201 or BIOC2291 or BIOS1101 or HESC1501 or PHSL2101 or PHSL2121 or VISN1221<br/><br/>",
        "processed": "A pass in BABS1201 || DPST1051 plus a pass in ANAT2241 || BABS1202 || DPST1052 || BABS2202 || BABS2204 || BIOC2201 || BIOC2291 || BIOS1101 || HESC1501 || PHSL2101 || PHSL2121 || VISN1221"
    """
    return "(BABS1201 || DPST1051) && (ANAT2241 || BABS1202 || DPST1052 || BABS2202 || BABS2204 || BIOC2201 || BIOC2291 || BIOS1101 || HESC1501 || PHSL2101 || PHSL2121 || VISN1221)"
if __name__ == "__main__":
    fix_conditions()