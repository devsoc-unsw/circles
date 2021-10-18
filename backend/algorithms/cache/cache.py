""" 
Loads cached data such as exclusions, program mappings, etc, into local JSON files
for faster algorithms performance.

This should be run from the backend directory or via runprocessors
"""

import sys
import json

from data.utility.dataHelpers import read_data, write_data

COURSES_PROCESSED_FILE = "./data/finalData/coursesProcessed.json"

CACHED_EXCLUSIONS_FILE = "./algorithms/cache/exclusions.json"

CONDITIONS_PROCESSED_FILE = "./data/finalData/conditionsProcessed.json"

CACHED_WARNINGS_FILE = "./algorithms/cache/warnings.json"

def cache_exclusions():
    """
    Reads from processed courses and stores the exclusions in a map mapping
    COURSE: {
        EXCLUSION_1: 1,
        EXCLUSION_2: 1,
        EXCLUSION_3: 1 
    }

    NOTE: Should run this after all the conditions have been processed as sometimes
    exclusions are included inside the conditions text
    """

    courses = read_data(COURSES_PROCESSED_FILE)

    cached_exclusions = {}

    for course, data in courses.items():
        cached_exclusions[course] = data["exclusions"]
    
    write_data(cached_exclusions, CACHED_EXCLUSIONS_FILE)

def cache_warnings():
    """
    Reads from processed conditions and stores the warnings in a map mapping
    COURSE: WARNING
    
    NOTE: Condition warnings are created during the manual fix stage, so this 
    will need to be re-run as more conditions are manually fixed.
    """

    conditions = read_data(CONDITIONS_PROCESSED_FILE)

    cached_warnings = {}

    for course, data in conditions.items():
        if "warning" in data:
            cached_warnings[course] = data["warning"]
    
    write_data(cached_warnings, CACHED_WARNINGS_FILE)
