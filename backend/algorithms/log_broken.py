"""Logs all broken conditions to backend/algorithms/errors.txt

This file calls a secondary function make_condition() instead of the main
create_condition(). This is because our main focus is not on exclusions or such,
it is just to see if the condition is parsed properly. We also need the index
for debugging purposes.

Run from the backend directory with python3 -m algorithms.log_broken
"""

import json

from algorithms.create import make_condition
from data.utility import data_helpers

CONDITIONS_TOKENS_FILE = "./data/final_data/conditionsTokens.json"
CONDITIONS_PROCESSED_FILE = "./data/final_data/conditionsProcessed.json"
ERROR_OUTPUT_FILE = "./algorithms/errors.json"


def log_broken_conditions():
    """
    Write broken conditions to a ERROR_OUTPUT_FILE with accompanying
    information such as the condition, and location of break
    """
    with open(CONDITIONS_TOKENS_FILE, "r", encoding="utf8") as conditions_tokens:
        all_tokens = json.load(conditions_tokens)

    with open(CONDITIONS_PROCESSED_FILE, "r", encoding="utf8") as conditions_processed:
        conditions = json.load(conditions_processed)

    output = {}
    for course, tokens in all_tokens.items():
        # Use make_condition instead of create_condition since it gives us more
        # information on the index
        res = make_condition(tokens, True)
        if res[0] is None:
            bad_index = res[1] + 1
            # Something went wrong with parsing this condition...
            output[course] = {
                "condition": conditions[course],
                "tokens": tokens,
                "broke at": report_index_string(tokens, bad_index),
            }

    data_helpers.write_data(output, ERROR_OUTPUT_FILE)



def report_index_string(tokens, bad_index):
    """
    Generate a string the index of break and, the tokens broken
    """
    return f"Index {bad_index}, {'exclusions' if bad_index == -1 else tokens[bad_index]}"


if __name__ == "__main__":
    log_broken_conditions()
