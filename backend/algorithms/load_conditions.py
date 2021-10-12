'''
Will pickle all the conditions into a dictionary. Run this file from the backend
folder with python3 -m algorithms.load_conditions
'''
import pickle
import json
from algorithms.conditions import create_condition

# Load in all the courses and their conditions list
ALL_CONDITION_TOKENS_FILE = "./data/finalData/conditionsTokens.json"

with open(ALL_CONDITION_TOKENS_FILE) as f:
    CONDITIONS = json.load("./")

