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