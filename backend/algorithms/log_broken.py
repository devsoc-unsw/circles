"""Logs all broken conditions to backend/algorithms/errors.txt

Run from the backend directory with python3 -m algorithms.log_broken
"""
from algorithms.conditions import make_condition
import json

CONDITIONS_TOKENS_FILE = "./data/finalData/conditionsTokens.json"
CONDITIONS_PROCESSED_FILE = "./data/finalData/conditionsProcessed.json"
ERROR_OUTPUT_FILE = "./algorithms/errors.json"

def log_broken_conditions():
    with open(CONDITIONS_TOKENS_FILE, "r") as conditions_tokens:
        all_tokens = json.load(conditions_tokens)
    
    with open(CONDITIONS_PROCESSED_FILE, "r") as conditions_processed:
        conditions = json.load(conditions_processed)

    output = {}

    for course, tokens in all_tokens.items():
        # Use make_condition instead of create_condition since it gives us more
        # information on the index
        res = make_condition(tokens, True)
        if res[0] == None:
            bad_index = res[1] + 1
            # Something went wrong with parsing this condition...
            output[course] = {
                "condition": conditions[course],
                "tokens": tokens,
                "broke at": f"Index {bad_index}, {tokens[bad_index]}"
            }
    
    with open(ERROR_OUTPUT_FILE, "w") as out:
        json.dump(output, out)

if __name__ == "__main__":
    log_broken_conditions()