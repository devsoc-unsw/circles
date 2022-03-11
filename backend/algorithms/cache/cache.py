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
    Writes to mappings.json and courseMappings.json (i.e maps courses to corresponding school/faculty)
    """
    mappings = {}
    courseMappings = {}
    courses = read_data(COURSES_PROCESSED_FILE)
    
    # Tokenise faculty using regex, e.g 'UNSW Business School' -> 'F Business'
    def tokeniseFaculty(Faculty):
        faculty_token = "F "
        if re.search("Faculty of.+", Faculty):
            match_object = re.search("(?<=Faculty\sof\s)[^\s\n\,]+", Faculty)
        elif re.search("UNSW", Faculty):
            match_object = re.search(r"(?<=UNSW\s)[^\s\n\,]+", Faculty)
        else:
            match_object = re.search("^([\w]+)", Faculty)
        match = match_object.group()
        faculty_token += match
        return faculty_token
    
    # Tokenise faculty using regex, e.g 'School of Psychology' -> 'S Psychology'
    def tokeniseSchool(School):
        school_token = "S "
        if re.search("School\sof\sthe.+", School):
            match_object = re.search("(?<=School\sof\sthe\s)[^\s\n\,]+", School)
        elif re.search("School\sof\s.+", School):
            match_object = re.search("(?<=School\sof\s)[^\s\n\,]+", School)
        elif re.search("^(UC)", School):
            match_object = re.search("(?<=UC\s)[^\s\n\,]+", School)
            match = school_token + "UC-" +  match_object.group()
            return match
        elif re.search("UNSW", School):
            match_object = re.search("(?<=UNSW\s)[^\s\n\,]+", School)
        else: 
            match_object = re.search("^([\w]+)", School)
        match = match_object.group()
        school_token += match
        return school_token

    # add faculties to mappings.json
    for course in courses:
        faculty = courses[course]['faculty']
        if faculty in mappings:
            continue
        faculty_token = tokeniseFaculty(faculty)
        mappings[faculty] = faculty_token
        courseMappings[faculty_token] = {} 
    # add schools to mappings.json
    for course in courses.values():
        if 'school' in course:
            school = course['school']
            if school in mappings:
                continue
            school_token = tokeniseSchool(school)
            mappings[school] = school_token
            courseMappings[school_token] = {} 
    write_data(mappings, MAPPINGS_FILE)

    # finalise
    for course in courses.values():
        courseCode = course['code']
        courseFaculty = course['faculty']
        if 'school' in course:
            courseSchool = course['school']
            courseMappings[mappings[courseSchool]][courseCode] = 1
        courseMappings[mappings[courseFaculty]][courseCode] = 1
    
    write_data(courseMappings, COURSE_MAPPINGS_FILE)

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
