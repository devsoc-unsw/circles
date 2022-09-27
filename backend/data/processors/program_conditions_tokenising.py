"""
Documentation: TBA

Assume everything is a maturity condition for now.
- Tokenise the pre-processed data.
"""

from contextlib import suppress
import re
from typing import Dict, Iterator, List, Optional
from data.processors.program_conditions_pre_processing import PRE_PROCESSED_DATA_PATH
from data.utility.data_helpers import read_data, write_data

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
    write_data(tokenised_conditions, FINAL_TOKENS_PATH)

def tokenise_maturity_requirement(condition: Dict[str, str]):
    return {
        "dependency": tokenise_dependency(condition["dependency"]),
        "dependant": tokenise_dependant(condition["dependant"]),
    }

def tokenise_dependency(condition: str) -> List[str]:
    """
    This is literally just a condition. At time of writing, it follows one of the following form
        - Must have completed \d UOC
        - Must complete all level \d [CATEGORY] courses
    That is, follow under the classification of UOC and CORE conditions

    Assumption (True as of 2023): There are no composite dependencies
    """
    if re.search("UOC", condition):
        return tokenise_uoc_dependency(condition)
    if re.search("(level|prescribed|core|cores)", condition):
        return tokenise_core_dependency(condition)
    # Ideally shouldn't get to this point since caller should verify
    # only parseable strings passed in; TODO: raise Error
    return [condition]

def tokenise_uoc_dependency(condition: str) -> List[str]:
    """
    Tokenise the UOC dependency.
    Assumes that the caller has already verified that the given condition is UOC only.

    Example input: "Must have completed 24 UOC"

    """
    num_uoc: Optional[re.Match[str]] = re.search("(\d+)", condition)

    return ["UOC", num_uoc.group()] if num_uoc else ["UOC", "0"]

def tokenise_core_dependency(condition: str):
    """
    Tokenise the core dependency.
    Assumes that the caller has already verified that the given condition is core only.

    Example Input:
        "Students must have completed all Level 1 ECON courses prescribed in the degree"
    Want to catch
        - Level \d (If it exists)
        - Category (If it exists)
        - Prescribed (If it exists) -> CORE
    The given example will be outputted as:
        ["L1", "ECON", "CORES"]
    """
    tokens_raw: List[str] = condition.split(" ")
    # ['Students', 'must', 'have', 'completed', 'all', 'Level', '1', 'ECON',
            # 'courses', 'prescribed', 'in', 'the', 'degree']

    # Keep only tokens with meaning
    tokens_filtered: List[str] = list(filter(
            lambda tok: re.search("([lL]evel)|(\d+)|(prescribed)|([A-Z]{4})", tok),
            tokens_raw
        ))
    tokens_post_level: List[str] = compress_level_tokens(tokens_filtered)
    tokens_post_core: List[str] = compress_cores_tokens(tokens_post_level)

    return tokens_post_core
    # raise NotImplementedError

def compress_cores_tokens(tokens: List[str]) -> List[str]:
    """
    Take in a list of tokens [..., "prescribed", ...]
    and simplify to [..., "CORES", ...]
    """
    tokens_iter: Iterator[str] = iter(tokens)
    tokens_out: List[str] = []

    with suppress(StopIteration):
        while (tok := next(tokens_iter), None):
            if re.search("prescribed", tok):
                tokens_out.append("CORES")
            else:
                tokens_out.append(tok)
    return list(tokens_out)

def compress_level_tokens(tokens: List[str]) -> List[str]:
    """
    Take in a list of tokens [..., "Level", "\d", ...]
    and simplify to [..., "L\d", ...]
    """
    # Want this as iterable rather than just a for-loop over the tokens
    # to not have to deal with iteration invalidation or, cringe index stuff
    # for arbitrary consumption of future tokens
    tokens_iter: Iterator[str] = iter(tokens)
    tokens_out: List[str] = []

    with suppress(StopIteration):
        while (tok := next(tokens_iter), None):
            if re.search("[Ll]evel", tok):
                # Valid assumption (as of 2023) that next *will* be a digit
                # TODO: Make FutureProof with error handling
                level_num = next(tokens_iter)
                tokens_out.append("L" + level_num)
            else:
                tokens_out.append(tok)
    return list(tokens_out)

def tokenise_dependant(condition: str):
    """
    Tokenise the dependant condition.
    These come in *usually* as a category.
    Examples:
        - "taking any level 2 courses"
        - "taking any level 2 ECON course"
    Output:
        - ["L2"]
        - ["L2", "ECON"]
    As of 2023 Handbook, no other example types exist.
    Will assume only Level and Faculty Category types
    """
    tokens: List[str] = condition.split(" ")
    # Keep only tokens with meaning
    tokens = list(filter(
            # Groups (left -> right): level, FaculyCode, Number
            lambda tok: re.search("([Ll]evel)|(^[A-Za-z]{4}$)|(\d+)", tok),
            tokens
        ))
    tokens = compress_level_tokens(tokens)
    tokens = compress_cores_tokens(tokens)
    return tokens


if __name__ == "__main__":
    tokenise_program_conditions()


