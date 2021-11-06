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

MAPPINGS_FILE = "./algorithms/cache/mappings.json"

COURSE_MAPPINGS_FILE = "./algorithms/cache/courseMappings.json"

COURSE_CODE_MAPPINGS = "./algorithms/cache/courseCodeMappings.json"

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


def cache_mappings():
    """
    Reads from courses and mappings to map course to a school/faculty
    """
    finalMappings = {}
    courses = read_data(COURSES_PROCESSED_FILE)
    mappings = read_data(MAPPINGS_FILE)
    # Initialise keys in final file
    for mapping in mappings:
        first_word = mapping.split()[0]
        if len(first_word) == 1:
            finalMappings[mapping] = {}
    # Map courses to keys
    for course in courses.values():
        courseCode = course['code']
        courseFaculty = course['faculty']
        if 'school' in course:
            courseSchool = course['school']
            finalMappings[mappings[courseSchool]][courseCode] = 1

        finalMappings[mappings[courseFaculty]][courseCode] = 1

    write_data(finalMappings, COURSE_MAPPINGS_FILE)

def cache_course_codes():
    """
    Reads from courses and maps all numbers to relevant course code
    """

    finalMappings = {}
    courses = read_data(COURSES_PROCESSED_FILE)
    # Assumes courses are read in alphabetical order
    
    courseCodeLetters = None
    for course in courses.values():
        courseNumbers = course['code'][-4:]
        # If first 4 letters of code are same as one before
        if course['code'][:4] == courseCodeLetters:
            finalMappings[courseCodeLetters][courseNumbers] = 1
        # First 4 letters different
        else:
            courseCodeLetters = course['code'][:4]
            finalMappings[courseCodeLetters] = {}
            finalMappings[courseCodeLetters][courseNumbers] = 1
    write_data(finalMappings, COURSE_MAPPINGS_FILE)