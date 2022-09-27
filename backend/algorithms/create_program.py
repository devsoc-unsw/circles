"""
Like `create.py` but, for `program_conditions`.
Converts from the tokens to actual conditions that can be made.
"""

from typing import Dict, List
from algorithms.objects.conditions import Condition, ProgramCondition
from algorithms.objects.helper import read_data
from data.processors.program_conditions_pre_processing import PROGRAMS_PROCESSED_PATH
from data.processors.program_conditions_tokenising import FINAL_TOKENS_PATH




def create_all_program_conditions():
    """
    """
    programs_list: List[str] = read_data(PROGRAMS_PROCESSED_PATH)
    for program in programs_list:
        create_program_condition(program)

    raise NotImplementedError

def create_program_condition() -> ProgramCondition:
    raise NotImplementedError

if __name__ == "__main__":
    create_all_program_conditions()

