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

    CONDITIONS["SCIF1111"][PROCESSED] = SCIF_1111()
    CONDITIONS["SCIF1131"][PROCESSED] = SCIF_1131()
    CONDITIONS["SCIF3000"] = SCIF_3000(CONDITIONS["SCIF3000"])
    CONDITIONS["SCIF3041"][PROCESSED] = SCIF_3041()
    CONDITIONS["SCIF3199"][PROCESSED] = SCIF_3199()

    # Updates the files with the modified dictionaries
    data_helpers.write_data(
        CONDITIONS, "data/final_data/conditionsProcessed.json")
    data_helpers.write_data(COURSES, "data/final_data/coursesProcessed.json")

def SCIF_1111():
    """
        "original": "Enrolment in the Bachelor of Medical Science (3991) or the Bachelor of Medicinal Chemistry (3992) or the bachelor of Medicinal Chemistry (Honours) (3999)<br/><br/>",
        "processed": "Enrolment in the Bachelor of (3991) || the Bachelor of Medicinal Chemistry (3992) || the bachelor of Medicinal Chemistry (Honours) (3999)"
    """
    return "3991 || 3992 || 3999"


def SCIF_1131():
    """
        "original": "Enrolment in BSc (Adv. Science), BAdvSci(Hons), BSc (Adv. Maths), BSc(AdvMath)(Hons), (incl. associated dual degrees), or BMedSci<br/><br/>",
        "processed": "Enrolment in BSc (Adv. Science), BAdvSci(Hons), BSc (Adv. Maths), BSc(AdvMath)(Hons), (incl. associated dual degrees) || BMedSci"
    """
    return "ASCI# || MATH# || MSCI#"

def SCIF_3000(conditions):
    return  {
        "original": conditions["original"],
        "processed" : "SCIF# && 60UOC && 65WAM",
        "handbook_note": "Good Standing required"
    }
def SCIF_3041():
    """
        "original": "Pre: 72UOC completed 70WAM<br/><br/>",
        "processed": "72UOC70WAM"
    """
    return "72UOC && 70WAM"

def SCIF_3199():
    """
        "original": "Prerequisite: 48 units of credit. Students must have a WAM of 65 or above to be eligible for this course<br/><br/>",
        "processed": "48UOC.65WAM"
    """
    return "48UOC && 65WAM"

if __name__ == "__main__":
    fix_conditions()
