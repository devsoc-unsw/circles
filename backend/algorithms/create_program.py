"""
Like `create.py` but, for `program_conditions`.
Converts from the tokens to actual conditions that can be made.
"""

import re
from typing import Dict, List
from algorithms.objects.categories import Category, CompositeCategory, CourseCategory, LevelCategory
from algorithms.objects.conditions import Condition, CoresCondition, UOCCondition
from algorithms.objects.helper import read_data
from algorithms.objects.program_restrictions import ProgramRestriction
from data.processors.program_conditions_pre_processing import PROGRAMS_PROCESSED_PATH
from data.processors.program_conditions_tokenising import FINAL_TOKENS_PATH


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

    raise NotImplementedError

# TODO: Make this use a real condition
def create_program_restriction(tokens: Dict[str, List[str]]) -> ProgramRestriction:
    """
    Creates a condition from the tokens.
    Currently supports:
        - Maturity Conditions
    """
    # TODO: Once more restriction types are created, there needs to be a check
    # for the type of restriction
    create_maturity_restriction(tokens)

def create_maturity_restriction(tokens: Dict[str, List[str]]) -> ProgramRestriction:
    """
    Creates a maturity restriction from the tokens.
    """
    dependency_tokens: List[str] = tokens.get("dependency", [])
    dependent_tokens: List[str] = tokens.get("dependent", [])
    dependency: Condition = create_dependency_condition(dependency_tokens)
    dependent: Category = create_dependent_condition(dependency_tokens)

def create_dependent_condition(tokens: List[str]) -> Category:
    """
    Creates a dependent condition from the tokens.

    Dependency Types:
        "UOC": Will immediately be followed by a digit.
        "L\d", "CODE", "CORES": Wants
    """
    # Need a while loop. Cannot be done with a for loop because might want
    # negative lookahead and, to consume multiple tokens at once. Doing this
    # with iterators makes it incredibly complex to have lookahead that doesnt
    # consume the token

    # Maybe don't need a loop. Be smart in pre-processing so that all conds
    # are split up beforehand into something neat

    index: int = 0
    def __tokens_finished() -> bool:
        """
        Effectively a 'macro' to check there are no more tokens left
        to consume. Don't need to pass in index, will use from outer scope.
        """
        return index >= len(tokens)

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

        if __tokens_finished(): # Simple LevelCategory
            return LevelCategory(level)
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
        faculty_category = CourseCategory(second_token)

        composite_category = CompositeCategory()
        composite_category.add_category(level_category)
        composite_category.add_category(faculty_category)

        core_condition = CoresCondition()
        core_condition.set_category(composite_category)
        return core_condition

    raise NotImplementedError

def create_dependency_condition(tokens: List[str]) -> Condition:
    """
    Creates a dependency condition from the tokens.
    """
    # Do NOT add a loop here.

if __name__ == "__main__":
    create_all_program_conditions()

