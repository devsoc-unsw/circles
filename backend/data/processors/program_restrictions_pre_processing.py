"""

PreProcesses the ProgramRestrictions so that the tokeniser only deals with clean input
[ ] Scrape Program data
[ ] Format, filter and process program data
[x] Pre-process the ProgramRestrictions <------- You are HERE
[ ] Tokenise ProgramRestrictions
[ ] Parse the tokens to create `ProgramRestriction` objects


Entrypoint: `pre_process_all_restrictions`:
    1. filter_pre_processable_sub_conditions # does the pre_processing
        1.1 - calls pre_pre_process on this
        # This will pre-pre-process: extract `type` `title` `notes` from info_rule only
        # if not notes or title is relevant, then return None

    2. `shortlist_pre_proc` - only non-empty stuff is left; effectively a nullity check
    3. use pre_process_program_requirements: list of dicts
        3.1. pre_proc whatever; does the matchy thing: this should attach types and stuff too


# For injection of new type, follow the given steps:
    0. Create a corresponding `PreprocessedRestriction` class
    1. If applicable, add needed types to `1.1`
    2. Go to `3.1` and add another check for your type.
        - Then, add the actual function to create the conditon

"""


from enum import Enum
import re
from typing import Dict, List, TypedDict
from algorithms.objects.program_restrictions import NoRestriction

from data.utility.data_helpers import read_data, write_data

PROGRAMS_PROCESSED_PATH = "data/final_data/programsProcessed.json"
PRE_PROCESSED_DATA_PATH = "data/final_data/programRestrictionsPreProcessed.json"

class ProgramRuleType(Enum):
    """
    The different types of program rules.
    This information is needed by the tokeniser to understand what pre-processed
    rules it is working on.
    """
    NoRestrictionRule = 0
    MaturityRestrictionRule = 1
    CourseRestrictionRule = 2
    LevelUocRestrictionRule = 3

class PreprocessedRestriction():
    type: ProgramRuleType

class PreprocessedMaturityCondition(PreprocessedRestriction):
    type: ProgramRuleType = ProgramRuleType.MaturityRestrictionRule
    dependency: str
    dependent: str

    def __init__(self, dependency: str, dependent) -> None:
        self.dependency = dependency
        self.dependent = dependent

    def __dict__(self):
        return {
            "type": self.type,
            "dependency": self.dependency,
            "dependent": self.dependent
        }

class PreProcessedNoRestrictionCondition(PreprocessedRestriction):
    type = ProgramRuleType.NoRestrictionRule

    def __init__(self) -> None:
        super().__init__()

    def __dict__(self):
        return {
            "type": self.type
        }

class PreProcessedCourseRestriction(PreprocessedRestriction):
    type = ProgramRuleType.CourseRestrictionRule

    def __dict__(self):
        return {
            "type": self.type
        }

class PreProcessedCourseRestriction(PreprocessedRestriction):
    type: ProgramRuleType.CourseRestrictionRule

    def __dict__(self):
        return {
            "type": self.type
        }



def pre_process_all_restrictions():
    """
    Pipeline starts here:
        - Read in the cleaned programs data
        - Filter out conditions that are not relevant to the pre_process
        - Pre-process the conditions
        - Write the pre-processed conditions to `.json` file
    """
    # Raw data of programs. Expect very little type safety here.
    program_info: Dict[str, Dict] = read_data(PROGRAMS_PROCESSED_PATH)

    # At this stage, conditions are pre-pre-processed and only stuff that
    # can be further processed is left
    pre_processable = {
        code: pre_processable_sub_conditions(info)
        for code, info in program_info.items()
    }

    # Only care for programs with relevant (non-empty) conditions
    pre_pre_processed_shortlist = shortlist_non_empty_pre_pre_processed(pre_processable)

    # Finally, actually process all the conditions
    pre_processed_restrictions: Dict[str, List[Dict[str, str]]] = {
        program: [dict(x) for x in pre_process_program_requirements(cond)]
        for program, conds in pre_pre_processed_shortlist.items()
        for cond in conds
    }

    # Done Cleanup, write the data.
    write_data(PRE_PROCESSED_DATA_PATH)
    return pre_processed_restrictions


def pre_process_program_requirements(
    condition_raw: Dict[str, str]
) -> List[PreprocessedRestriction]:
    """
    Do epic pre-proc (i only want to take in the relevant ones)
    If you feed me a condition with no notes, i will literally die

    Currently assumes only 'maturity' conditions exist. To add support for more
    need to actually check what the condition type is first
    TODO: That's wrong^^^^^^^^^^^^^
    """
    notes_raw: str = condition_raw.get("notes", "")
    # Assumption: Only one condition per sentence. No misc. `.`
    notes: List[str] = [
        note.strip() for note in notes_raw.split(".")
        if note
    ]

    return [
        pre_process_condition(note)
        for note in notes
    ]

def pre_process_condition(note: str) -> PreprocessedRestriction:
    if maturity_match(note):
        return pre_process_maturity_condition(note)
    return NoRestriction()



def pre_process_maturity_condition(string: str) -> PreprocessedMaturityCondition:
    """
    Pre-processes a maturity condition.
    These conditions are constructed of two sections
        - "dependency": This is the conditin that must be passed before anything
                        from the dependent my be satisfied.
        - "dependent": This is the condition that is restricted and cannot be
                        fulfilled before the dependency is satisfied.
    """
    components: List[str] = string.split("before")
    dependency: str = components[0].strip()
    dependent: str = components[1].strip()

    return PreprocessedMaturityCondition(dependency, dependent)


def maturity_match(string: str):
    return re.match(r".*(maturity)+", string.lower())

def course_restriction_match(string: str):
    return re.search("excluded ", string.lower())


def is_relevant_string(string: str) -> bool:
    """
    Checks if a string is relevant to the tokenisation process.
    Doesn't actually make changes to the file but is instead just there to prune
    away irrelevant strings so that we don't have to bother cleaning them up later.

    Add any future condition checkers here inside the list in the `any`
    """
    relevant: bool = any([
        maturity_match(string),
        course_restriction_match(string),
    ])
    return relevant

def shortlist_non_empty_pre_pre_processed(full_condition_list):
    """
    Shortlist the pre-processed conditions so that only non-empty
    ones are passed through to the next stage.
    Prevents future processors from needing to do null / emptiness checks.
    """
    return {
        course_code: relevant_str_conditions
        for course_code, relevant_str_conditions in full_condition_list.items()
        if relevant_str_conditions != []
    }

def pre_processable_sub_conditions(program_info: Dict) -> List[Dict]:
    """
    Filters out conditions that are not relevant to the pre_process
    pipeline for the given process.
    """
    non_spec_data: List[Dict] = program_info.get("components", {}).get("non_spec_data", [])
    if not len(non_spec_data):
        return []

    pre_pre_processed_conditions: List[Dict] = []
    for condition in non_spec_data:
        pre_procced = pre_pre_proccess(condition)
        if pre_procced is not None:
            pre_pre_processed_conditions.append(pre_procced)
    return pre_pre_processed_conditions

if __name__ == "__main__":
    pre_process_all_restrictions()

def pre_pre_proccess(condition: Dict):
    """
    # Takes a raw condition and pre-pre-processes it.
    # The condition will be a dict with atleast the following keys:
    #     - "type"
    #     - "title"
    #     - "notes"
    # We care for instances where the type is "info_rule". The rest relates to
    # items such as core courses, etc.
    # The relevant information about maturity and other rules is usually inside
    # the "notes" field. Though typically the "title" will clarify that there is
    # a maturity requirement, it is not a guarantee as  it may be of form
    # "Program Rules and Dictionary"
    """
    if not condition.get("type", None) in ["info_rule"]:
        return None
    if not is_relevant_string(condition.get("notes", "")) and not is_relevant_string(condition.get("title", "")):
        return None
    return condition
