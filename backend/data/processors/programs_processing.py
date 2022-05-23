"""
Program processes the formatted data by editing and customising the data for
use on the frontend. See 'programs_processed.json' for output.

Status: Currently works for all COMP programs and SENGAH. Query next
        set of programs to include.

Step in the data's journey:
    [   ] Scrape raw data (program_scraper.py)
    [   ] Format scraped data (program_formatting.py)
    [ X ] Customise formatted data (program_processing.py)
"""

import re
from collections import OrderedDict


from data.utility.data_helpers import read_data, write_data

INPUT_PATH = "data/scrapers/programsFormattedRaw.json"
OUTPUT_PATH = "data/final_data/programsProcessed.json"

FREE_ELECTIVE = "FE"
GENERAL_EDUCATION = "GE"
MAJOR = "undergrad_major"
MINOR = "undergrad_minor"
HONOURS = "honours"
PRESCRIBED_ELECTIVE = "PE"
CORE_COURSE = "CC"
INFORMATION_RULE = "IR"
LIMIT_RULE = "LR"

SPEC_KEY = "spec_data"
NON_SPEC_KEY = "non_spec_data"
GENERAL_EDUCATION_KEY = "general_education"
MAJOR_KEY = "majors"
MINOR_KEY = "minors"
HONOURS_KEY = "honours"
INFORMATION_RULE_KEY = "information_rule"
LIMIT_RULE_KEY = "limit_rule"


# Set of current course codes in programs_processed.json
TEST_PROGS = (
    "3778",
    "3707",
    "3970",
    "3502",
    "3053",
    "3979",
    "3959",
    "3181",
    "3543",
    "3586",
    "3805",
    "3871",
    "3956",
    "3789", # Science/CompSci
    "3781", # Advanced Maths/ CompSci
    "3784", # Commerce/CompSci
    "3785", # Engineering(Honours)/CompSci
    "3783", # CompSci / Arts
    "3786", # CompSci / Law
)


def process_prg_data() -> None:
    """
    Read in INPUT_PATH, process them and write to OUTPUT_PATH
    """
    data = read_data(INPUT_PATH)

    processed_data = {}
    for program in TEST_PROGS:
        # Get program specific data
        formatted_data = data[program]
        program_data = initialise_program(formatted_data)

        # Loop through items in curriculum structure and add to the program data
        for item in formatted_data["structure"]:
            add_component_data(program_data, item)

        # Order dict alphabetically
        OrderedDict(sorted(program_data["components"].items(), key=lambda t: t[0]))

        code = program_data["code"]
        processed_data[code] = program_data

    write_data(processed_data, OUTPUT_PATH)


def initialise_program(program: dict) -> dict:
    """
    Initialises basic attributes of the specialisation.
    """
    duration = re.search("(\d)", program["duration"]).group(1)

    return { # TODO: Document the structure
        "title": program["title"],
        "code": program["code"],
        "duration": int(duration),
        "UOC": int(program["UOC"]),
        "faculty": program["faculty"],
        "description": program["description"],
        "components": {
            GENERAL_EDUCATION_KEY: {},
            INFORMATION_RULE_KEY: [],
            LIMIT_RULE_KEY: [],
            SPEC_KEY: {},
            NON_SPEC_KEY: [],
        }
    }


def add_component_data(program_data: dict, item: dict, program_name = None) -> None:
    """
    Adds data within a given item to a given program recursively
    """
    if any(key not in item for key in ("vertical_grouping", "title")):
        return

    program_name = find_program_name(program_data, item) if program_name is None else program_name

    # Figure out what type of requirement we're looking at,
    # and add it to the appropriate spot in the program data
    if is_general_education(item):
        add_general_education_data(program_data, item)
    if is_major(item):
        add_specialisation_data(program_data, item, program_name, MAJOR_KEY)
    if is_minor(item):
        add_specialisation_data(program_data, item, program_name, MINOR_KEY)
    if is_honours(item):
        add_specialisation_data(program_data, item, program_name, HONOURS_KEY)
    if is_core_course(item):
        add_core_course_data(program_data, item)
    if is_information_rule(item):
        add_rule(program_data, item, INFORMATION_RULE_KEY)
    if is_limit_rule(item):
        add_rule(program_data, item, LIMIT_RULE_KEY)
    if is_other(item):
        add_other(program_data, item)

    # Recurse further down through the container and the relationship list
    for next in item["relationship"]:
        add_component_data(program_data, next, program_name = program_name)
    for next in item["container"]:
        add_component_data(program_data, next, program_name = program_name)


# TODO: Fix remaining issues with this function
def find_program_name(program_data: dict, item: dict) -> str:
    """
    Find the program name (if possible).
    Returns a string with the program name if found,
    else returns None
    """
    # Split the title into it's single degrees and get rid of white space
    program_names = program_data["title"].split("/")
    program_names = list(map(lambda s: s.strip(), program_names))

    # Check if we even need to bother searching
    if len(program_names) == 1:
        return program_names[0]

    # Sort by longest length first
    program_names = sorted(program_names, key = lambda s: -len(s))

    # Print a warning if one of the strings is a substring of the other
    if (program_names[0] in program_names[1]) or (program_names[1] in program_names[0]):
        print(f"Warning: One of {program_names} is a substring of the other for program code {program_data['code']}")

    # Search
    for program_name in program_names:
        if program_name in item["title"]:
            return program_name
        for container in item["container"]:
            if program_name in container["title"]:
                return program_name

    # Couldn't find a match :(
    print(f"Warning: Couldn't find any of names = {program_names} for program code {program_data['code']}")


def is_general_education(item: dict) -> bool:
    """
    Returns boolean depending on if the given container is a general education requirement
    """
    return item["vertical_grouping"]["value"] == GENERAL_EDUCATION


def is_major(item: dict) -> bool:
    """
    Returns boolean depending on if the given container is a major requirement
    """
    return item["vertical_grouping"]["value"] == MAJOR


def is_minor(item: dict) -> bool:
    """
    Returns boolean depending on if the given container is an optional minor
    """
    return item["vertical_grouping"]["value"] == MINOR


def is_honours(item: dict) -> bool:
    """
    Returns boolean depending on if the given container is an honours requirement
    """
    return item["vertical_grouping"]["value"] == HONOURS


def is_core_course(item: dict) -> bool:
    """
    Returns boolean depending on if the given container is a core course requirement
    """
    return item["vertical_grouping"]["value"] == CORE_COURSE


def is_information_rule(item: dict) -> bool:
    """
    Returns boolean depending on if the given container is an information rule
    """
    return item["vertical_grouping"]["value"] == INFORMATION_RULE


def is_limit_rule(item: dict) -> bool:
    """
    Returns boolean depending on if the given container is a limit rule
    """
    return item["vertical_grouping"]["value"] == LIMIT_RULE


def is_other(item: dict) -> bool:
    """
    Returns boolean depending on if the given container is some 'other' requirement
    (except for free electives)
    """
    return (
        (item["dynamic_relationship"] or item["relationship"])
        and item["title"] != "Free Electives"
        and item["vertical_grouping"]["value"] in (FREE_ELECTIVE, PRESCRIBED_ELECTIVE)
    )


def add_general_education_data(program_data: dict, item: dict) -> None:
    """
    Adds general education data to the correct spot in program_data
    """
    # Double check we haven't somehow already added the general education stuff already
    if program_data["components"][GENERAL_EDUCATION_KEY] != {}:
        raise ValueError("Already added GE to this program")

    program_data["components"][GENERAL_EDUCATION_KEY] = {
        "notes": item["description"],
        "credits_to_complete": get_credits(program_data, item),
    }


def add_specialisation_data(program_data: dict, item: dict, program_name: str, field: str) -> None:
    """
    Adds specialisation data to the correct spot in program_data given a field and name of program
    """
    data = {
        "notes": item["description"],
    }
    for specialisation in item["relationship"]:
        code = specialisation["academic_item_code"]
        if code is not None:
            data[code] = specialisation["academic_item_name"]

    program_data["components"][SPEC_KEY].setdefault(field, {}).update({program_name: data})


def add_core_course_data(program_data: dict, item: dict) -> None:
    """
    Adds core course data to the correct spot in program_data
    """
    # If item is a core course
    cc = {
        "courses": {},
        "title": item["title"],
        "credits_to_complete": get_credits(program_data, item),
        "core": True,
        "levels": [], # TODO
        "notes": item["description"],
    }

    # If there are multiple courses
    if item["container"] != []:
        # Loop through and find all courses and add them
        for item in item["container"]:
            for course in item["relationship"]:
                code = course["academic_item_code"]
                cc["courses"][code] = course["academic_item_name"]
    else:
        for course in item["relationship"]:
            code = course["academic_item_code"]
            cc["courses"][code] = course["academic_item_name"]

    program_data["components"][NON_SPEC_KEY].append(cc)


def add_rule(program_data: dict, item: dict, rule_type: str) -> None:
    """
    Adds rule data to the correct spot in program_data given a rule type
    """
    program_data["components"][rule_type].append({
        "title": item["title"],
        "notes": item["description"],
    })


def add_other(program_data: dict, item: dict) -> None:
    """
    Adds 'other' data to the correct spot in program_data
    """
    new_requirement = {
        "courses": None,
        "title": item["title"],
        "credits_to_complete": get_credits(program_data, item),
        "core": is_core_course(item),
        "levels": [], # TODO: What is this?
        "notes": item["description"],
    }

    if item["dynamic_relationship"]:
        new_requirement["courses"] = [rel["description"] for rel in item["dynamic_relationship"]]
    else:
        new_requirement["courses"] = {}
        for course in item["relationship"]:
            code = course["academic_item_code"]
            new_requirement["courses"][code] = course["academic_item_name"]

    program_data["components"][NON_SPEC_KEY].append(new_requirement)


def get_credits(program_data: dict, item: dict) -> int:
    """
    Get the number of credits in this requirement.
    If there are no attached credits, returns None
    """
    try:
        return int(item["credit_points"])
    except ValueError:
        pass

    try:
        return int(item["credit_points_max"])
    except ValueError:
        print(f"Warning: Couldn't find the number of credits for an item in program {program_data['code']}")


if __name__ == "__main__":
    process_prg_data()
