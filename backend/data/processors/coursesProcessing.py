"""
Step in the course data's journey:
    [   ] Scrape raw data (coursesScraper.py)
    [   ] Format scraped data (coursesFormatting.py)
    [ X ] Customise formatted data (coursesProcessing.py)
"""

import re 
from data.utility import dataHelpers

# Fields to keep in the processed file without modification from coursesFormattedRaw.json
KEEP_UNEDITED = ["title", "code", "UOC", "level", "description", "study_level",
                 "school", "faculty", "campus", "equivalents", "exclusions", 
                 "path_to"]

PROCESSED_COURSES = {}
ABSENT_COURSES = {} # Courses that appear in enrolment rules but do not exist
                    # in the 2021 Undergraduate handbook, either because the
                    # code is a typo, it has been discontinued, or is
                    # a postgraduate course

def process_courses():

    data = dataHelpers.read_data("data/scrapers/coursesFormattedRaw.json")

    for code, course in data.items():
        processed = {k:v for k,v in course.items() if k in KEEP_UNEDITED}
        
        if "path_to" not in processed:
            # If this course does not yet have a 'path_to' field, set up
            # dict in anticipation of courses being added
            processed["path_to"] = dict()
        
        format_types(processed)
        process_terms(processed, course)
        process_gen_ed(processed, course)
        process_enrolment_path(processed, course, data)
        # process_attributes(processed, course)

        # Overwrite data file entry with the newly processed info
        data[code] = processed

    dataHelpers.write_data(data, "data/finalData/coursesProcessed.json")
    dataHelpers.write_data(ABSENT_COURSES, "data/finalData/absentCourses.json")


def format_types(processed: dict) -> None:
    """ Converts things like UOC and Level to the right type (String->Int) """
    if processed["UOC"] is not None:
        processed["UOC"] = int(processed["UOC"])
    
    if processed["level"] is not None:
        processed["level"] = int(processed["level"])

def process_terms(processed: dict, formatted: dict) -> None:
    """ Processes terms: e.g. 'Summer Term, Term 2' to ["ST", "T2"]. 
    Terms that do not conform to this (e.g. 'Summer Canberra') are left
    as is and will be modified at a later stage """
    res = ""
    if formatted["calendar"] == "3+":
        res = re.sub("Term ", "T", formatted["terms"])
    elif formatted["calendar"] == "Semester":
        res = re.sub("Semester ", "S", formatted["terms"])

    res = re.sub("Summer Term", "ST", res)
    res = re.sub("Summer Canberra", "SC", res)
    res = res.split(',')
    res = [item.strip(' ') for item in res] # Strip any remaining spaces
    processed["terms"] = res

def process_gen_ed(processed: dict, formatted: dict) -> None:
    """ Processes whether the course is a gen ed. 0 for false and 1 for true """
    if formatted["gen_ed"] == "false":
        processed["gen_ed"] = 0
    else:
        processed["gen_ed"] = 1

# NOTE: ignoring attributes for now
# def process_attributes(processed: dict, formatted: dict) -> None:
#     """ Add any attributes to a list, excluding gen_ed since that is covered by 
#     the gen_ed key """
#     processed["attributes"] = []
#     for attribute in formatted["attributes"]:
#         if "general_education" in attribute["type"]:
#             continue
#         processed["attributes"].append(attribute["type"])

def process_enrolment_path(processed: dict, formatted: dict, data: dict) -> None:
    """ Adds pre-requisites to 'path_from' field and for each prereq, adds this
    processed course to their 'path_to' field in the main 'data' dict. This 
    allows for courses to be processed in one iteration through the data """
    global ABSENT_COURSES

    processed["path_from"] = dict()
    prereqs = re.findall("\W([A-Z]{4}\d{4})\W*", formatted["enrolment_rules"], re.ASCII)
    for prereq in prereqs:
        # Add each course code to 'path_from'
        processed["path_from"][prereq] = 1

        # Add each course code to the prereq's 'path_to' in data
        #  - If the prereq has already been processed, such that the entry in  
        #    the data dict has already been overwritten, then this will simply 
        #    add another entry into its 'path_to'. 
        #  - If not yet processed, then it will still be captured when it 
        #    is eventually processed via line 28.
        if prereq in data:
            if "path_to" not in data[prereq]:
                data[prereq]["path_to"] = dict() # Set up dict if not yet added
            data[prereq]["path_to"][processed["code"]] = 1
        else:
            # prereq not in data and is therefore absent from undergrad handbook
            ABSENT_COURSES[prereq] = 1

if __name__ == "__main__":
    process_courses()