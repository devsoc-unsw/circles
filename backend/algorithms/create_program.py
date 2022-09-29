"""
Like `create.py` but, for `program_conditions`.
Converts from the tokens to actual conditions that can be made.
"""

import re
from typing import Dict, List
from algorithms.objects.categories import Category, LevelCategory, LevelCourseCategory
from algorithms.objects.conditions import Condition, CoresCondition, UOCCondition
from algorithms.objects.helper import read_data
from algorithms.objects.program_restrictions import MaturityRestriction, ProgramRestriction
from data.processors.program_conditions_pre_processing import PROGRAMS_PROCESSED_PATH
from data.processors.program_conditions_tokenising import FINAL_TOKENS_PATH


class UnparseableError(Exception):
    """
    The given token cannot be parsed
    """
    def __init__(self, tokens: List[str]):
        super().__init__("Unparseable tokens: {}".format(tokens))

def create_all_program_conditions():
    """
    """
    programs_list: List[str] = read_data(PROGRAMS_PROCESSED_PATH)
    tokens_data: Dict[str, List[Dict[str, List[str]]]] = read_data(FINAL_TOKENS_PATH)
    for program in programs_list:
        conditons = [
            create_program_restriction(tokens)
            for tokens in tokens_data.get(program, [])
        ]
        print(conditons)

        create_program_restriction(program)

def create_program_restriction(tokens: Dict[str, List[str]]) -> ProgramRestriction:
    """
    Creates a condition from the tokens.
    Currently supports:
        - Maturity Conditions
    """
    # TODO: Once more restriction types are created, there needs to be a check
    # for the type of restriction
    return create_maturity_restriction(tokens)

def create_maturity_restriction(tokens: Dict[str, List[str]]) -> ProgramRestriction:
    """
    Creates a maturity restriction from the tokens.
    """
    dependency_tokens: List[str] = tokens.get("dependency", [])
    dependent_tokens: List[str] = tokens.get("dependent", [])
    return MaturityRestriction(
         create_dependency_condition(dependency_tokens),
         create_dependent_condition(dependent_tokens)
    )

def create_dependency_condition(tokens: List[str]) -> Condition:
    """
    Creates a dependent condition from the tokens.

    Dependency Types:
        "UOC": Will immediately be followed by a digit.
        "L\d", "CODE", "CORES": Wants
    """

    # Don't need a loop here. Don't ever add a loop here, no matter
    # how tempting it is when expanding functionality.
    # The responsibility should be on the tokeniser to ensure that the
    # tokens are cleaned and legible.

    index: int = 0
    base_token: str = tokens[index]

    if base_token == "UOC":
        # Guaranteed. Also guaranteed to be the only prefix
        num_uoc = int(tokens[index + 1])
        return UOCCondition(num_uoc)
        # Maybe assert that this is the end?

    # Matching LevelCategory
    if re.match("L\d", base_token):
        index += 1
        level = int(base_token[1:])
        level_category = LevelCategory(level)

        # Next is either `CORES` by itself -> just a CoreCondition w/ Level
        # or: `FACULTY` -> CoreCondition w/ Level and Faculty
        second_token: str = tokens[index]
        # 'CORES' w/ level
        if second_token == "CORES":
            core_condition = CoresCondition()
            core_condition.set_category(level_category)
            return core_condition
        index += 1
        # CoreCondition w/ Level and Faculty;
        # Don't read third token because it's just `"CORES"`; Token2 is faculty
        faculty = second_token
        composite_category = LevelCourseCategory(level, faculty)

        core_condition = CoresCondition()
        core_condition.set_category(composite_category)
        return core_condition

    # This should literally never happen and indicates you have broken smth
    raise UnparseableError(tokens)


def create_dependent_condition(tokens: List[str]) -> Category:
    """
    Creates a dependency condition from the tokens.

    Need to worry about:
        - "L\d"
        - "L\d", Faculty
    """
    level = int(tokens[0][1:])
    level_condition = LevelCategory(level)

    if len(tokens) == 1:
        return level_condition

    faculty = tokens[1]
    return LevelCourseCategory(level, faculty)

if __name__ == "__main__":
    create_all_program_conditions()

