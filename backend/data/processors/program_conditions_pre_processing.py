"""
DOCUMENTATION: TBA

This file currently does the job of two. TODO: move stuff out

1. Pre-process condition tokenisations
2. Tokenise conditions

"""


import re
from typing import Dict, List

from data.utility.data_helpers import read_data, write_data

PROGRAMS_PROCESSED_PATH = "data/final_data/programsProcessed.json"
PRE_PROCESSED_DATA_PATH = "data/final_data/programsConditionsPreProcessed.json"

def pre_process():
    """
    Start Here:
    """
    # Raw data of programs
    program_info = read_data(PROGRAMS_PROCESSED_PATH)

    # At this stage, conditions are pre-processed
    pre_processed = {
        code: filter_pre_processable_conditions(info)
        for code, info in program_info.items()
    }

    # Only care for programs with relevant coditions
    pre_pre_processed_shortlist = shortlist_pre_proc(pre_processed)
    pre_processed_shortlist = {
        program: pre_process_program_requirements(cond)
        for program, conds in pre_pre_processed_shortlist.items()
        for cond in conds
    }
    print(f"Found a total of {len(pre_pre_processed_shortlist)} relevant programs")
    write_data(pre_processed_shortlist, PRE_PROCESSED_DATA_PATH)
    return pre_processed_shortlist


def pre_process_program_requirements(condition_raw: Dict[str, str]) -> List[Dict]:
    """
    Do epic pre-proc (i only want to take in the relevant ones)
    If you feed me a condition with no notes, i will literally die

    Currently assumes only 'maturity' conditions exist. To add support for more
    need to actually check what the condition type is first
    """
    notes: str = condition_raw.get("notes", "")
    # Assumption: Only one condition per sentence. No misc. `.`
    notes: List[str] = [
        note.strip() for note in notes.split(".")
        if len(note) > 0
    ]
    print("NOTES:", notes)
    return [
        pre_process_maturity_condition(note)
        for note in notes
    ]

def pre_process_maturity_condition(string: str) -> List[str]:
    """
    Pre-processes a maturity condition.
    These conditions are constructed of two sections
        - "dependency": This is the conditin that must be passed before anything
                        from the dependant my be satisfied.
        - "dependant": This is the condition that is restricted and cannot be
                        fulfilled before the dependency is satisfied.
    """
    print("\n"*2)
    # print("am dealing with maturity:", string)
    components: List[str] = string.split("before")
    print("components:", components)
    dependency: str = components[0].strip()
    dependant: str = components[1].strip()
    print("reduction:::::", dependency, "---------", dependant)
    return {
        # "dependency": "", "dependant": "",
        "dependency": dependency,
        "dependant": dependant
    }


def maturity_match(string: str):
    return re.match(r".*(maturity)+", string.lower())

def pre_process_cond(condition: Dict):
    """
    Takes a raw condition and pre-processes it.
    The condition will be a dict with atleast the following keys:
        - "type"
        - "title"
        - "notes"
    We care for instances where the type is "info_rule". The rest relates to
    items such as core courses, etc.
    The relevant information about maturity and other rules is usually inside
    the "notes" field. Though typically the "title" will clarify that there is
    a maturity requirement, it is not a guarantee as  it may be of form
    "Program Rules and Dictionary"
    """
    if not condition.get("type", None) == "info_rule":
        return None
    if not is_relevant_string(condition.get("notes", "")) and not is_relevant_string(condition.get("title", "")):
        return None
    return condition
    # Epic regex happens here
    # TODO: Remove all cringe stuff -- wait for conditions

def is_relevant_string(string: str) -> bool:
    """
    Checks if a string is relevant to the tokenisation process.
    Doesn't actually make changes to the file but is instead just there to prune
    away irrelevant strings so that we don't have to bother cleaning them up later.

    Add any future condition checkers here inside the list in the `any`
    """
    relevant: bool = any(
        [maturity_match(string)]
    )
    # if relevant:
    #     print("RELEVANT:", string)
    return relevant

def tokenise_program_requirements(program_info: Dict) -> Dict:
    """
    Recieves the pre-processed program info and tokenises the conditions.
    """
    program_info
    return []

def shortlist_pre_proc(full_condition_list):
    return {
        course_code: relevant_str_conditions
        for course_code, relevant_str_conditions in full_condition_list.items()
        if relevant_str_conditions != []
    }

def filter_pre_processable_conditions(program_info: Dict) -> List[Dict]:
    non_spec_data: List[Dict] = program_info.get("components", {}).get("non_spec_data", [])
    if not len(non_spec_data):
        return []

    pre_processes_conditions: List[Dict] = []
    for condition in non_spec_data:
        pre_procced = pre_process_cond(condition)
        if pre_procced is not None:
            pre_processes_conditions.append(pre_procced)
            # print("above is for ", condition.get("title", ""))
    return pre_processes_conditions

if __name__ == "__main__":
    pre_process()

