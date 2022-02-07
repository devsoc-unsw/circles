'''
Will pickle all the conditions into a dictionary. Run this file from the backend
folder with python3 -m algorithms.load_conditions
'''
import pickle
import json
from algorithms.create import create_condition
# Load in all the courses and their conditions list
ALL_CONDITION_TOKENS_FILE = "./data/finalData/conditionsTokens.json"
PICKLE_FILE = "./algorithms/conditions.pkl"

with open(ALL_CONDITION_TOKENS_FILE) as f:
    ALL_CONDITIONS_TOKENS = json.load(f)

ALL_OBJECTS = {}
def cache_conditions_pkl_file():
    for course, tokens in ALL_CONDITIONS_TOKENS.items():
        ALL_OBJECTS[course] = create_condition(tokens, course)

    with open(PICKLE_FILE, "wb") as outp:
        pickle.dump(ALL_OBJECTS, outp, pickle.HIGHEST_PROTOCOL)

if __name__ == '__main__':
    cache_conditions_pkl_file()