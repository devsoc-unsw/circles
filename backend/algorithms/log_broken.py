"""Logs all broken conditions to backend/algorithms/errors.txt

Run from the backend directory with python3 -m algorithms.log_broken
"""
from algorithms.conditions import create_condition
import json

CONDITIONS_FILE = "./data/finalData/conditionsProcessed.json"

def log_broken_conditions():
    with open(CONDITIONS_FILE, "r") as file:
        conditions = json.load(file)
    
    output = {}

    for course, cond in conditions.items():
        # OUTPUT = {}
        if create_condition(cond["processed"]) == None:
            # Something went wrong with parsing this condition...
            output[course] = {}  

if __name__ == "__main__":
    log_broken_conditions()