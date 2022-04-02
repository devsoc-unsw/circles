"""
Loads cached data such as exclusions, program mappings, etc, into local
JSON files for faster algorithms performance.
This should be run from the backend directory or via runprocessors
"""

import re

from algorithms.cache.cache_config import (CACHE_CONFIG,
                                           CACHED_EXCLUSIONS_FILE,
                                           CACHED_WARNINGS_FILE,
                                           CONDITIONS_PROCESSED_FILE,
                                           COURSE_MAPPINGS_FILE,
                                           COURSES_PROCESSED_FILE,
                                           MAPPINGS_FILE,
                                           PROGRAM_MAPPINGS_FILE,
                                           PROGRAMS_FORMATTED_FILE)
from data.utility.data_helpers import read_data, write_data


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
        cached_exclusions[course] = data["exclusions"] | data["equivalents"]

    write_data(cached_exclusions, CACHED_EXCLUSIONS_FILE)


def cache_handbook_note():
    """
    Reads from processed conditions and stores the warnings in a map mapping
    COURSE: WARNING

    NOTE: Condition warnings are created during the manual fix stage, so this
    will need to be re-run as more conditions are manually fixed.
    """

    conditions = read_data(CONDITIONS_PROCESSED_FILE)

    cached_handbook_note = {}

    for course, data in conditions.items():
        if "handbook_note" in data:
            cached_handbook_note[course] = data["handbook_note"]

    write_data(cached_handbook_note, CACHED_WARNINGS_FILE)


def cache_mappings():
    """
    Reads from courses and mappings to map course to a school/faculty
    """
    final_mappings = {}
    courses = read_data(COURSES_PROCESSED_FILE)
    mappings = read_data(MAPPINGS_FILE)
    # Initialise keys in final file
    for mapping in mappings:
        first_word = mapping.split()[0]
        if len(first_word) == 1:
            final_mappings[mapping] = {}
    # Map courses to keys
    for course in courses.values():
        course_code = course["code"]
        course_faculty = course["faculty"]
        if "school" in course:
            course_school = course["school"]
            final_mappings[mappings[course_school]][course_code] = 1

        final_mappings[mappings[course_faculty]][course_code] = 1

    write_data(final_mappings, COURSE_MAPPINGS_FILE)


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

    keyword_codes = read_data(CACHE_CONFIG)
    # Initialise mappings with all the mapping codes
    # TODO: Add any more mappings. Look into updating manual-fixes wiki page?
    code_list = keyword_codes["code_list"]
    mappings = {}
    for code in code_list:
        mappings[code] = {}

    programs = read_data(PROGRAMS_FORMATTED_FILE)

    keyword_map = keyword_codes["keyword_mapping"]
    for program in programs.values():
        for  keyword in keyword_map:
            if keyword in program["title"]:
                for code in keyword_map[keyword]:
                    mappings[code][program["code"]] = 1

    write_data(mappings, PROGRAM_MAPPINGS_FILE)
