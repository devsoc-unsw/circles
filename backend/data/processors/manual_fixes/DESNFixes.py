"""
https://github.com/csesoc/Circles/wiki/Manual-Fixes-to-Course-Prerequisites

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

    CONDITIONS["DESN1900"][PROCESSED] = DESN_1900()
    CONDITIONS["DESN2000"] = DESN_2000(CONDITIONS["DESN2000"])

    # Updates the files with the modified dictionaries
    data_helpers.write_data(
        CONDITIONS, "data/final_data/conditionsProcessed.json")
    data_helpers.write_data(COURSES, "data/final_data/coursesProcessed.json")

def DESN_1900():
    """
        "original": "No prerequisites required<br/><br/>",
        "processed": "No required"
    """
    return ""

def DESN_2000(conditions):
    """
        "original": "No prerequisites required<br/><br/>",
        "processed": "No required"
    """
    return {
        "original": conditions["original"],
        "processed": "((AEROAH || MECHAH || MANF?H || MTRNAH || CVEN?H || GMATDH) && (DESN1000 || DPST1071)) || ((ELECAH || ELECCH || TELEAH) &&  (DESN1000 || DPST1071) && ELEC2141 && (COMP1511 || COMP1521)) && ((CHEM?H || CEIC?H) && (DESN1000 || DPST1071) && CEIC2000 && (CHEM1821 || CHEM1021 || CHEM1041)) || ((SOLAAH || SOLABH) && (DESN1000 || DPST1071) && SOLA2051) && (COMPBH && COMP1521 && (DESN1000 || DPST1071)) || ((SENGAH || BINFAH) && COMP2521 && (DESN1000 || DPST1071)) && (MINEAH && (DESN1000 || DPST1071)) || (PETRAH && CEIC2001 && (DESN1000 || DPST1071))",
        "handbook_note": "Please refer to the course overview section for further information on requirements."
    }

if __name__ == "__main__":
    fix_conditions()
