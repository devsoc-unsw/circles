"""
Documentation: TBA

Assume everything is a maturity condition for now.
- Tokenise the pre-processed data.
"""

import re
from typing import Dict, List
from data.processors.conditions_preprocessing import preprocess_condition
from data.processors.program_conditions_pre_processing import PRE_PROCESSED_DATA_PATH
from data.utility.data_helpers import read_data

FINAL_TOKENS_PATH = "data/final_data/programsConditionsTokens.json"


def tokenise_program_conditions():
    """
    """
    pre_processed_conditions: Dict[str, List[Dict[str, str]]] = read_data(PRE_PROCESSED_DATA_PATH)

    tokenised_conditions: Dict[str, List[Dict[str, str]]] = read_data(PRE_PROCESSED_DATA_PATH)

    # TODO: for loops cringe
    for program, pre_processed_conditions in pre_processed_conditions.items():
        cond_list = []
        for pre_processed_conditions in pre_processed_conditions:
            cond_list.append(tokenise_maturity_requirement(pre_processed_conditions))
        tokenised_conditions[program] = cond_list

def tokenise_maturity_requirement(condition: Dict[str, str]):
    return {
        "dependency": tokenise_dependency(condition["dependency"]),
        "dependant": tokenise_dependant(condition["dependant"]),
    }

def tokenise_dependency(condition: str):
    """
    This is literally just a condition. At time of writing, it follows one of the following form
        - Must have completed \d UOC
        - Must complete all level \d [CATEGORY] courses
    That is, follow under the classification of UOC and CORE conditions

    Assumption (True as of 2023): There are no composite dependencies
    """
    # print("here")
    print("^.condition: ", condition)
    if re.match("UOC", condition):
        print("MATHHHHHHHHHHHHHHHHHHHHHHHHHHHHhh\n\n\n\n")
        return tokenise_uoc_dependency(condition)
    return condition

def tokenise_uoc_dependency(condition: str):
    """
    Tokenise the UOC dependency
    """
    num_uoc = re.match("(\d+)", condition)
    print("uoc needed: ", num_uoc)
    return condition

def tokenise_dependant(condition: str):
    return condition


if __name__ == "__main__":
    tokenise_program_conditions()


