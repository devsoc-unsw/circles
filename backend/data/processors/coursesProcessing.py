"""
Step in the course data's journey:
    [   ] Scrape raw data (coursesScraper.py)
    [   ] Format scraped data (coursesFormatting.py)
    [ X ] Customise formatted data (coursesProcessing.py)
"""

import re 
from data.utility import dataHelpers

# Fields to keep in the processed file without modification from coursesFormattedRaw.json
KEEP_UNEDITED = ["title", "code", "UOC", "level", "description", 
                "equivalents", "exclusions", "path_to"]

PROCESSED_COURSES = {}
ABSENT_COURSES = {} # Courses that appear in enrolment rules but do not exist
                    # in the 2021 Undergraduate handbook, either because the
                    # code is a typo, it has been discontinued, or is
                    # a postgraduate course #TODO: check with James

# TODO: Query inclusion of ATTRIBUTES
"""
introductory_course = "This course is usually taken in the early part of a program and may be required as a pre-requisite before taking a more advanced course."

plus_alliance_outgoing = "This course is part of PLuS Alliance offerings. UNSW students enrol in this course at the relevant PLuS Alliance partner university. Please visit <a title=\"PLuS Alliance website\" href=\"http://plusalliance.unsw.edu.au/\" target=\"_blank\" rel=\"noopener noreferrer nofollow\">PLuS Alliance website</a>\u00a0for more information."

work_integrated_learning = "This course involves work learning experiences where students work directly in or with an industry or community organisation to gain real-world experience in preparation for a future career. Please visit <a title=\"WIL website\" href=\"https://www.wil.unsw.edu.au/\" target=\"_blank\" rel=\"noopener noreferrer nofollow\">WIL website</a> for more information."

multi-term_course = "This course is taught across multiple terms or is a member of a group of courses taken across multiple terms. In either case a final grade is withheld until the final course is completed."
"""

def process_courses():

    data = dataHelpers.read_data("data/scrapers/coursesFormattedRaw.json")

    for code, course in data.items():
        processed = {k:v for k,v in course.items() if k in KEEP_UNEDITED}
        
        if "path_to" not in processed:
            # If this course does not yet have a 'path_to' field, set up
            # dict in anticipation of courses being added
            processed["path_to"] = dict()

        process_terms(processed, course)
        process_gen_ed(processed, course)
        process_attributes(processed, course)
        process_enrolment_path(processed, course, data)

        # Overwrite data file entry with the newly processed info
        data[code] = processed

    dataHelpers.write_data(data, "data/finalData/coursesProcessed.json")
    dataHelpers.write_data(ABSENT_COURSES, "data/finalData/absentCourses.json")


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
    res = res.split(',')
    res = [item.strip(' ') for item in res] # Strip any remaining spaces
    processed["terms"] = res

def process_gen_ed(processed: dict, formatted: dict) -> None:
    """ Processes whether the course is a gen ed. 0 for false and 1 for true """
    if formatted["gen_ed"] == "false":
        processed["gen_ed"] = 0
    else:
        processed["gen_ed"] = 1

def process_attributes(processed: dict, formatted: dict) -> None:
    """ Add any attributes to a list, excluding gen_ed since that is covered by 
    the gen_ed key """
    processed["attributes"] = []
    for attribute in formatted["attributes"]:
        if "general_education" in attribute["type"]:
            continue
        processed["attributes"].append(attribute["type"])

def process_enrolment_path(processed: dict, formatted: dict, data: dict) -> None:
    """ Adds pre-requisites to 'path_from' field and for each prereq, adds this
    processed course to their 'path_to' field in the main formatted 'data'
    dict, in anticipation of looping over that course when it is processed. 
    This allows for courses to be processed in one iteration through the data """
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