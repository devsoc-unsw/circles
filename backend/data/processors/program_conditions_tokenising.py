"""
Documentation: TBA

Assume everything is a maturity condition for now.
- Tokenise the pre-processed data.
"""

from typing import Dict, List
from data.processors.program_conditions_pre_processing import PRE_PROCESSED_DATA_PATH
from data.utility.data_helpers import read_data

FINAL_TOKENS_PATH = "data/final_data/programsConditionsTokens.json"


def tokenise_conditions():
    """
    """
    pre_processed_conditions: Dict[str, List[Dict[str, str]]] = read_data(PRE_PROCESSED_DATA_PATH)

    tokenised_conditions: Dict[str, List[Dict[str, str]]] = read_data(PRE_PROCESSED_DATA_PATH)

    # TODO: for loops cringe
    for program, pre_processed_conditions in pre_processed_conditions.items():
        cond_list = []
        for pre_processed_conditions in pre_processed_conditions:
            cond_list.append(tokenise_condition(pre_processed_conditions))
        tokenised_conditions[program] = cond_list

def tokenise_condition(condition: Dict[str, str]):
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
    """
    condition
    raise NotImplementedError

def tokenise_dependant(condition: str):
    condition
    raise NotImplementedError


if __name__ == "__main__":
    tokenise_conditions()


