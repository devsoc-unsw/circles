"""
Like `create.py` but, for `program_conditions`.
Converts from the tokens to actual conditions that can be made.
"""

from typing import Dict, List
from algorithms.objects.conditions import Condition
from algorithms.objects.helper import read_data
from data.processors.program_conditions_pre_processing import PROGRAMS_PROCESSED_PATH
from data.processors.program_conditions_tokenising import FINAL_TOKENS_PATH


def create_all_program_conditions():
    """
    """
    programs_list: List[str] = read_data(PROGRAMS_PROCESSED_PATH)
    tokens_data: Dict[str, List[Dict[str, List[str]]]] = read_data(FINAL_TOKENS_PATH)
    for program in programs_list:
        conditons = [
            create_program_condition(tokens)
            for tokens in tokens_data.get(program, [])
        ]
        print(conditons)

        create_program_condition(program)

    raise NotImplementedError

# TODO: Make this use a real condition
def create_program_condition(tokens: Dict[str, List[str]]) -> Condition:
    """
    Creates a condition from the tokens.
    Currently supports:
        - Maturity Conditions
    """
    print(tokens)
    raise NotImplementedError

if __name__ == "__main__":
    create_all_program_conditions()

