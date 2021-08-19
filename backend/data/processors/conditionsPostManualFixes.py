"""
Apply heavy manual fixes to processed rules in preprocessedRules.json so that
they can be fed into algorithms.
"""

from data.utility import dataHelpers

RULES = dataHelpers.read_data("data/finalData/preprocessedRules.json")
PRO_RULE = "processed_rule"

COURSES = dataHelpers.read_data("data/finalData/coursesProcessed.json")

# TODO: create utility file with these mappings?
SPN_MAP = {
    "CSE_MAJORS": ["COMPA1", "COMPD1", "COMPD1", "COMPE1", "COMPI1", "COMPJ1", 
                   "COMPN1", "COMPS1", "COMPY1", "COMPZ1", "BINFB1"],
    "COMP_MAJORS": ["COMPA1", "COMPD1", "COMPD1", "COMPE1", "COMPI1", 
                    "COMPJ1", "COMPN1", "COMPS1", "COMPY1", "COMPZ1"]
}

def fix_conditions():
    """ Functions to apply manual fixes """

    RULES["COMP1400"][PRO_RULE] = COMP_1400_1911("COMP1400")
    RULES["COMP1911"][PRO_RULE] = COMP_1400_1911("COMP1911")

    RULES["COMP3900"][PRO_RULE] = COMP_3900()

    RULES["COMP3901"] = COMP_3901_3902(RULES["COMP3901"])
    RULES["COMP3902"] = COMP_3901_3902(RULES["COMP3902"])

    RULES["COMP4920"][PRO_RULE] = COMP_4920()

    RULES["COMP4951"][PRO_RULE] = COMP_4951()

    RULES["COMP4952"][PRO_RULE] = COMP_4952()
    RULES["COMP4953"][PRO_RULE] = COMP_4953()

    RULES["COMP4961"][PRO_RULE] = COMP_4961()

    dataHelpers.write_data(RULES, "data/finalData/preprocessedRules.json")
    dataHelpers.write_data(COURSES, "data/finalData/coursesProcessed.json")

def COMP_1400_1911(code):
    """ 
    "original_rule": "Prerequisite: Enrolment in a non-CSE major (no BINF, COMP, or SENG)<br/><br/>"

    "processed_rule": ""
    """
    
    # Add exclusions to courseProcessed.json
    for spn in SPN_MAP["CSE_MAJORS"]:
        COURSES[code]["exclusions"][spn] = 1

    # Then delete
    return ""

def COMP_3900():
    """
    "original_rule": "Prerequisite: COMP1531, and COMP2521 or COMP1927, and enrolled in a BSc Computer Science major with completion of 102 uoc.<br/><br/>"
    

    "processed_rule": "COMP1531 && COMP2521 || COMP1927 && 102UOC in (COMPA1 || COMPD1 || COMPD1 || COMPE1 || COMPI1 || COMPJ1 || COMPN1 || COMPS1 || COMPY1 || COMPZ1)"
    """

    new_rule = "COMP1531 && COMP2521 || COMP1927 && 102UOC in ("
    added = False
    for spn in SPN_MAP["COMP_MAJORS"]:
        if not added:
            new_rule += spn
            added = True
        else:
            new_rule += f" || {spn}"
    new_rule += ")"
    return new_rule

def COMP_3901_3902(rules):
    """
    "original_rule": "Prerequisite: 80+ WAM in COMP, SENG or BINF courses, completion of all first and second year core requirements a CSE program, and agreement from a suitable CSE academic supervisor.<br/><br/>"

    "processed_rule": "80WAM in COMP || SENG || BINF"
    
    "warning": "You must complete all first and second year core requirements of
    a CSE program and obtain agreement from a suitable CSE academic supervisor
    to enrol in this course."
    """

    return {
        "original_rule": rules["original_rule"],
        "processed_rule": "80WAM in COMP || SENG || BINF",
        "warning": "You must complete all first and second year core requirements of a CSE program and obtain agreement from a suitable CSE academic supervisor to enrol in this course."
    }

def COMP_4920():
    """
    "original_rule": "Prerequisite: (COMP2511 or COMP2911) and completion of 96 UOC in Computer Science.<br/><br/>",

    "processed_rule": "(COMP2511 || COMP2911) && 96UOC in COMP"
    """

    return "(COMP2511 || COMP2911) && 96UOC in COMP"

def COMP_4951():
    """
    "original_rule": "Prerequisite: Enrolled in a CSE BE (Hons) programs, completion of 126 UOC and completion of 3rd year core.<br/><br/>"

    "processed_rule": "Enrolled in a CSE BE (Hons) s && 126UOC && completion of 3rd year core"
    """
    # TODO
    pass 

def COMP_4952():
    """
    "original_rule": "Prerequisite: Completion of Research Thesis A (4951)<br/><br/>"

    "processed_rule": "COMP4951"
    """
    return "COMP4951"

def COMP_4953():
    """
    "original_rule": "Prerequisite: Completion of Research Thesis B (4952)<br/><br/>"

    "processed_rule": "COMP4952"
    """
    return "COMP4952"

def COMP_4961():
    """
    "original_rule": "Prerequisite: Students enrolled in program 4515 Bachelor of Computer Science (Hons) or program 3648.<br/><br/>",

    "processed_rule": "4515 Bachelor of Computer Science (Hons) || 3648"
    """
    return "4515 || 3648"

if __name__ == "__main__":
    fix_conditions()