""" 
Loads cached data such as exclusions, program mappings, etc, into local JSON files
for faster algorithms performance.

This should be run from the backend directory or via runprocessors
"""

import re

from data.utility.data_helpers import read_data, write_data

# INPUT SOURCES
COURSES_PROCESSED_FILE = "./data/final_data/coursesProcessed.json"

PROGRAMS_FORMATTED_FILE = "./data/scrapers/programsFormattedRaw.json"

CACHED_EXCLUSIONS_FILE = "./algorithms/cache/exclusions.json"

CONDITIONS_PROCESSED_FILE = "./data/final_data/conditionsProcessed.json"


# OUTPUT SOURCES
CACHED_WARNINGS_FILE = "./algorithms/cache/handbook_note.json"

MAPPINGS_FILE = "./algorithms/cache/mappings.json"

COURSE_MAPPINGS_FILE = "./algorithms/cache/courseMappings.json"

PROGRAM_MAPPINGS_FILE = "./algorithms/cache/programMappings.json"

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

def cache_handbook_note():
    """
    Reads from processed conditions and stores the warnings in a map mapping
    COURSE: WARNING
    
    NOTE: Condition warnings are created during the manual fix stage, so this 
    will need to be re-run as more conditions are manually fixed.
    """

    conditions = read_data(CONDITIONS_PROCESSED_FILE)

    cached_handbook_note= {}

    for course, data in conditions.items():
        if "handbook_note" in data:
            cached_handbook_note[course] = data["handbook_note"]
    
    write_data(cached_handbook_note, CACHED_WARNINGS_FILE)


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

def cache_program_mappings():
    """
    Maps CODE# to programs, e.g.
    {
        "ACTL#": {
            "3586": 1,
            "4520": 1,
        }
    }

    Achieves this by looking for a keyword in the program's title
    """

    # Initialise mappings with all the mapping codes
    mappings = {}
    mappings["ACTL#"] = {}
    mappings["BUSN#"] = {}
    mappings["COMM#"] = {}
    mappings["ECON#"] = {}
    mappings["INFS#"] = {}
    mappings["ZBUS#"] = {}
    mappings["DATA#"] = {}
    mappings["COMP#"] = {}
    # TODO: Add any more mappings. Look into updating manual-fixes wiki page?

    programs = read_data(PROGRAMS_FORMATTED_FILE)        

    for program in programs.values():
        if re.match(r"actuarial", program["title"], flags=re.IGNORECASE):
            mappings["ACTL#"][program["code"]] = 1
            mappings["ZBUS#"][program["code"]] = 1
        elif re.match(r"business", program["title"], flags=re.IGNORECASE):
            mappings["BUSN#"][program["code"]] = 1
            mappings["ZBUS#"][program["code"]] = 1
        elif re.match(r"commerce", program["title"], flags=re.IGNORECASE):
            mappings["COMM#"][program["code"]] = 1
            mappings["ZBUS#"][program["code"]] = 1
        elif re.match(r"economics", program["title"], flags=re.IGNORECASE):
            mappings["ECON#"][program["code"]] = 1
            mappings["ZBUS#"][program["code"]] = 1
        elif re.match(r"information systems", program["title"], flags=re.IGNORECASE):
            mappings["INFS#"][program["code"]] = 1
            mappings["ZBUS#"][program["code"]] = 1
        elif re.match(r"data science and decisions",program["title"], flags=re.IGNORECASE):
            mappings["DATA#"][program["code"]] = 1
        elif re.match(r"computer science",program["title"], flags=re.IGNORECASE):
            mappings["COMP#"][program["code"]] = 1
        
    write_data(mappings, PROGRAM_MAPPINGS_FILE)
