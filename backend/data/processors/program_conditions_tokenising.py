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
# FINAL_TOKENS_PATH = "data/final_data/programsConditionsTokens.json"

def pre_process_program_requirements(program_info: Dict) -> List[Dict]:
    """ Do epic pre-proc (i only want to take in the relevant ones) """

    non_spec_data: List[Dict] = program_info.get("components", {}).get("non_spec_data", [])
    if not len(non_spec_data):
        return []

    pre_processes_conditions: List[Dict] = []
    for condition in non_spec_data:
        pre_procced = pre_process_cond(condition)
        if pre_procced is not None:
            pre_processes_conditions.append(pre_procced)
            print("above is for ", condition.get("title", ""))
    return pre_processes_conditions


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
    # Remove all cringe stuff

def is_relevant_string(string: str) -> bool:
    """
    Checks if a string is relevant to the tokenisation process.
    Doesn't actually make changes to the file but is instead just there to prune
    away irrelevant strings so that we don't have to bother cleaning them up later.
    """
    relevant: bool = (
        re.match(r".*(maturity)+", string.lower())
    )
    if relevant:
        print("RELEVANT:", string)
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
            print("above is for ", condition.get("title", ""))
    return pre_processes_conditions

def run_program_token_process():
    program_info = read_data(PROGRAMS_PROCESSED_PATH)

    pre_processed = {
        code: filter_pre_processable_conditions(info)
        for code, info in program_info.items()
    }

    pre_processed_shortlist = shortlist_pre_proc(pre_processed)
    print(f"Found a total of {len(pre_processed_shortlist)} relevant programs")
    write_data(pre_processed_shortlist, PRE_PROCESSED_DATA_PATH)


if __name__ == "__main__":
    run_program_token_process()

