"""
Program processes the formatted data by editing and customising the data for 
use on the frontend. See 'specialisationsProcessed.json' for output.

NOTE: "spn" == "specialisation"

Status: Currently works for all COMP specialisations and SENGAH. Query next
        set of specialisations to include.

Step in the data's journey:
    [   ] Scrape raw data (specialisationScraper.py)
    [   ] Format scraped data (specialisationFormatting.py)
    [ X ] Customise formatted data (specialisationProcessing.py)
"""

import re 
from typing import List, Iterable, Union, Optional 
from data.utility import dataHelpers

# TODO: add more specialisations as we expand scope of Circles
TEST_SPNS = ["COMPA1", "COMPAH", "COMPBH", "SENGAH", "COMPD1", "COMPD1", 
             "COMPE1", "COMPI1", "COMPJ1", "COMPN1", "COMPS1", "COMPY1", 
             "COMPZ1"]

CODE_MAPPING = dataHelpers.read_data("data/utility/programCodeMappings.json")["title_to_code"]

def customise_spn_data():

    data = dataHelpers.read_data("data/scrapers/specialisationsFormattedRaw.json")

    customised_data = {} # Dictionary for all customised data
    for spn in TEST_SPNS:

        print(f"Processing {spn} . . .")

        formatted = data[spn]
        customised_data[spn] = {}
        initialise_spn(customised_data[spn], formatted)
        
        curriculum = []
        constraints = []
        for container in formatted["structure"]: 
            # Build curriculum data and locate any constraints within curriculum

            if container["description"] and not container["courses"] and not container["structure"]:
                # If container lists not courses and has no nested curriculum
                # 'structure', then there is likely to be a constraint in the
                # 'description' field
                constraints.append(get_constraint(container))

            else:
                # Otherwise, the container includes course data which must be
                # parsed and extracted
                curriculum_item = {
                    "courses": {},
                    "title": container["title"],
                }
                curriculum_item["credits_to_complete"] = int(get_credits(container))
                curriculum_item["type"] = get_type(curriculum_item["title"].lower())
                curriculum_item["levels"] = get_levels(curriculum_item["title"].lower())
                curriculum_item["notes"] = get_notes(container["description"])

                if container["structure"]:
                    # Nested container exists containing curriculum data
                    get_nested_data(container["structure"], curriculum_item)
                else:
                    # No nested container containing curriculum data
                    get_courses(curriculum_item["courses"], container["courses"], 
                                container["description"])

                # Add item to curriculum  
                curriculum.append(curriculum_item)
        
        customised_data[spn]["course_constraints"] = constraints
        customised_data[spn]["curriculum"] = curriculum
        print("Processing complete :)\n")
    
    dataHelpers.write_data(customised_data, "data/finalData/specialisationsProcessed.json")

def get_constraint(constraint_data: dict) -> dict:
    """
    Returns dict containing title and description of curriculum constraint;
    e.g. where students must complete at least X level 4 courses (such courses
    already being captured in the curriculum data)
    """
    return {
        "title": constraint_data["title"],
        "description": constraint_data["description"]
    }

def initialise_spn(spn: dict, data: dict) -> None:
    """
    Initialises basic attributes of the specialisation.
    """
    spn["programs"] = data["programs"]
    spn["name"] = data["title"]
    spn["type"] = data["level"]
    spn["UOC"] = int(data["credit_points"])
    spn["code"] = data["code"]

def get_credits(container: dict) -> str:
    """
    Adds credit point requirements to curriculum item dict.
    Credit points exist either explicitly in the container's field 
    "credit_points" or must be parsed from the "description" field.
    """
    if container["credit_points"]:
        return container["credit_points"]
    else:
        # No data in "credit_points" field, so parse plaintext "description"
        # Catches XX UOC, XX credits, XX Credit, etc.
        credits = re.search("(\d+) UOC|[cC]redit", container["description"])
        return credits.group(1)

def get_type(title: str) -> str:
    """ 
    Parses 'title' to get curriculum type of specialisation item .
    Curriculum type is one of {"elective", "core", "other"}.
    """
    if "elective" in title:
        return "elective"
    elif "core" in title:
        return "core"
    else:
        return "other"

def get_levels(title: str) -> List[int]:
    """
    Parses 'title' to get curriculum levels of specialisation item.
    Level can be any combination of {1, 2, 3, 4, 5, 6, 7, 8, 9}.
    """
    levels = []
    # s? \d[^ ]* captures cases like "Level 1/2", "Levels 1,2,3" and "Level 1-2"
    res = re.search("[Ll]evels? (\d[^ ]*)", title)

    if res:
        found_level = int(res.group(1))
        levels.append(found_level)

        # Looks for 'higher' within 0 - 2 words of the level
        if re.match("[Ll]evels? (\d[^ ]*) ([^ ]+ ){0,2}higher", title):
            seq = [num for num in range(found_level + 1, 10)]
            levels.extend(seq)
        
    return levels

def get_notes(description: str) -> str:
    """ Extracts any unique notes in the container description. While most 
    course containers state 'Students must take X UOC of the following courses.',
    some include extra info after this line: e.g. 'Counting further VIP courses
    is only possible if etc.' """

    # Non-greedy search to catch anything after first matching line
    res = re.search("Students must.*?following courses\.(.+)", description)
    if res: # Unique notes found
        return res.group(1)
    else:
        return ""

def get_nested_data(container: dict, curriculum_item: dict) -> None:
    """
    Adds curriculum data from nested container (the 'sub_container') into
    the curriculum item dict.
    """
    for sub_container in container: 

        # Student may choose one of two courses
        if sub_container["title"] == "One of the following:":
            get_one_of_courses(sub_container["courses"], curriculum_item["courses"])

        # Sub container title matches parent container title, so simply 
        # extract courses to put into your curriculum dict
        elif sub_container["title"] == curriculum_item["title"]:
            get_courses(curriculum_item["courses"], sub_container["courses"], 
                        sub_container["description"])

def get_one_of_courses(container_courses: List[str], curriculum_courses: dict) -> None:
    """
    Since tuples are not supported by JSON, current approach to 'one of
    the following' courses is to convert to key-value pair
    "COURSE1 or COURSE2": 2, the '2' representing that the key contains
    2 courses.
    """
    one_of_courses = ""
    course_added = False # Flag value to identify where 'or' needs to be added
    for course in container_courses:
        if course_added:
            one_of_courses += " or "

        one_of_courses += course
        course_added = True
    
    curriculum_courses[one_of_courses] = 2

def get_courses(curriculum_courses: dict, container_courses: List[str], 
                description: str) -> None:
    """ 
    Adds courses from container to the customised curriculum course dict.
    """
    for course in container_courses:
        if "any level" in course: 
            # e.g. modify "any level 4 COMP course" to "COMP4"
            course = process_any_level(course) 
        curriculum_courses[course] = 1

    # TODO: Below is the old code parsing description for course codes. It
    # may come in handy later, but if not then delete
    # Captures course codes and strings like 'any level X course offered by ... ' 
        # if not container_courses:
        # res = re.findall("[A-Z]{4}[0-9]{4}|any level[^<]+", description)
        # print(res)
        # for course in res:
        #     if "any level" in course:
        #         course = process_any_level(course) 
        #     curriculum_courses[course] = 1

def process_any_level(unprocessed_course: str) -> str:
    """
    Processes 'any level X PROGRAM NAME course' into 'CODEX'
    """
    try:
        # group 1 contains level number and group 2 contains program title
        # Note ?: means inner parentheses is non-capturing group
        res = re.search("level (\d) ((?:[^ ]+ )+)course", unprocessed_course)
        course_level = res.group(1).strip()
        program_title = res.group(2).strip()

        # Removes any "(CODE)" text in program title 
        # e.g. changes "Computer Science (COMP) "
        program_title = re.sub("\([A-Z]{4}\)", "", program_title)

        # Find CODE mapping; if unsuccessful, do nothing
        program_code = CODE_MAPPING.get(program_title, program_title)
        processed_course = program_code + course_level

        return processed_course
    except:
        # plaintext does not fit above pattern; e.g. it might say "any level 4
        # course offered by School of Computer Science and Engineering". In that
        # case, do not process. Manual customisation may be needed.
        print(f"Unable to process course: {unprocessed_course}")
        return unprocessed_course

if __name__ == "__main__":
    customise_spn_data()