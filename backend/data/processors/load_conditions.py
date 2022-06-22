"""
Will pickle all the conditions into a dictionary. Run this file from the backend
folder with python3 -m algorithms.load_conditions
"""

import json
import pickle

from algorithms.create import create_condition


def cache_conditions_pkl_file():
    """
    Loads all conditions objects and dumps them as a pickled file

    Input: None
    Returns: None
    """

    # Load in all the courses and their conditions list
    all_conditions_tokens_file = "./data/final_data/conditionsTokens.json"
    pickle_file = "./data/final_data/conditions.pkl"

    with open(all_conditions_tokens_file, "r", encoding="utf8") as f:
        all_conditions_tokens = json.load(f)

    all_objects = {}

    for course, tokens in all_conditions_tokens.items():
        all_objects[course] = create_condition(tokens, course)

    with open(pickle_file, "wb") as outp:
        pickle.dump(all_objects, outp, pickle.HIGHEST_PROTOCOL)


if __name__ == "__main__":
    cache_conditions_pkl_file()
