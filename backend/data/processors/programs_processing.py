"""
Program processes the formatted data by editing and customising the data for
use on the frontend. See 'programsProcessed.json' for output.

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
FACULTY_CODE_PATH = "data/final_data/facultyCodesProcessed.json"

GENERAL_EDUCATION = "GE"
MAJOR = "undergrad_major"
MINOR = "undergrad_minor"
HONOURS = "honours"
CORE_COURSE = "CC"
INFORMATION_RULE = "IR"
LIMIT_RULE = "LR"
PRESCRIBED_ELECTIVE = "PE"
FREE_ELECTIVE = "FE"

SPEC_KEY = "spec_data"
GENERAL_EDUCATION_KEY = "general_education"
MAJOR_KEY = "majors"
MINOR_KEY = "minors"
HONOURS_KEY = "honours"
CORE_COURSE_KEY = "core_courses"
INFORMATION_RULE_KEY = "information_rules"
LIMIT_RULE_KEY = "limit_rules"
PRESCRIBED_ELECTIVE_KEY = "prescribed_electives"
OTHER_KEY = "other"


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
    duration = re.search(r"(\d)", program["duration"]).group(1)

    return { # TODO: Document the structure
        "title": program["title"],
        "code": program["code"],
        "duration": int(duration),
        "UOC": int(program["UOC"]),
        "faculty": program["faculty"],
        "overview": program["overview"],
        "structure_summary": program["structure_summary"],
        "components": {
            GENERAL_EDUCATION_KEY: {},
            SPEC_KEY: {},
            CORE_COURSE_KEY: [],
            INFORMATION_RULE_KEY: [],
            LIMIT_RULE_KEY: [],
            PRESCRIBED_ELECTIVE_KEY: [],
            OTHER_KEY: [],
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
        return
    if is_information_rule(item):
        add_rule(program_data, item, INFORMATION_RULE_KEY)
    if is_limit_rule(item):
        add_rule(program_data, item, LIMIT_RULE_KEY)
    if is_prescribed_elective(item):
        add_prescribed_elective(program_data, item)
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


def is_prescribed_elective(item: dict) -> bool:
    """
    Returns boolean depending on if the given container is a prescribed elective
    """
    return item["vertical_grouping"]["value"] == PRESCRIBED_ELECTIVE


def is_other(item: dict) -> bool:
    """
    Returns boolean depending on if the given container is a 'other'
    """
    return item["title"] != "Free Electives" and item["vertical_grouping"]["value"] == FREE_ELECTIVE


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
        "specs": {},
    }
    for specialisation in item["relationship"]:
        code = specialisation["academic_item_code"]
        if code is not None:
            data["specs"][code] = specialisation["academic_item_name"]

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

    # Are there multiple drop down tabs?
    if item["container"]:
        for container in item["container"]:
            add_core_course_tab(cc, container)
    else:
        add_core_course_tab(cc, item)

    program_data["components"][CORE_COURSE_KEY].append(cc)

def add_core_course_tab(cc:dict, item: dict) -> None:
    # Check if it's a 'one of the following' requirement or single course requirements
    if item["vertical_grouping"]["value"] == "one_of_the_following":
        combined_key = " or ".join([ course["academic_item_code"] for course in item["relationship"] ])
        cc["courses"][combined_key] = [ course["academic_item_name"] for course in item["relationship"] ]
    else:
        for course in item["relationship"]:
            code = course["academic_item_code"]
            cc["courses"][code] = course["academic_item_name"]


def add_rule(program_data: dict, item: dict, rule_type: str) -> None:
    """
    Adds rule data to the correct spot in program_data given a rule type
    """
    program_data["components"][rule_type].append({
        "title": item["title"],
        "notes": item["description"],
    })


def add_prescribed_elective(program_data: dict, item: dict) -> None:
    program_data["components"][PRESCRIBED_ELECTIVE_KEY].append({
        "courses": process_any_course_requirement(program_data, [ course["description"] for course in item["dynamic_relationship"] ]),
        "title": item["title"],
        "credits_to_complete": get_credits(program_data, item),
        "core": False,
        "levels": [], # TODO: What is this?
        "notes": item["description"],
    })


def add_other(program_data: dict, item: dict) -> None:
    """
    Adds 'other' data to the correct spot in program_data
    """
    program_data["components"][OTHER_KEY].append({
        "courses": process_any_course_requirement(program_data, [ course["description"] for course in item["dynamic_relationship"] ]),
        "title": item["title"],
        "credits_to_complete": get_credits(program_data, item),
        "core": False,
        "levels": [], # TODO: What is this?
        "notes": item["description"],
    })


def process_any_course_requirement(program_data: dict, descriptions: list[str]) -> dict:
    """
    Processes list of course (as strings) requirements
    that are of the form 'any <faculty or type of course> course'
    """
    courses = {}
    mappings = read_data(FACULTY_CODE_PATH)

    for description in descriptions:
        search_result = re.search(r"any (.+) course", description, flags = re.IGNORECASE)
        if search_result is None:
            search_result = re.search(r"any course offered by (.+)", description, flags = re.IGNORECASE)

        stripped = search_result.group(1)

        # Find the level requirement (if there is any)
        if bool(re.match(r"level \d", stripped, flags = re.IGNORECASE)):
            search_result = re.search(r"level (\d) (.+)", stripped, flags = re.IGNORECASE)
            level = search_result.group(1)
            faculty = search_result.group(2)
        else:
            level = "?"
            faculty = stripped

        try:
            code = f"{mappings[faculty]}{level}???"
        except KeyError:
            print(f"Warning: Can't figure out what the code is for {faculty} in program {program_data['code']}")
            continue

        courses[code] = description
    return courses


def get_credits(program_data: dict, item: dict) -> int:
    """
    Get the number of credits in this requirement.
    If there are no attached credits, returns 0
    """
    try:
        return int(item["credit_points"])
    except ValueError:
        pass

    try:
        return int(item["credit_points_max"])
    except ValueError:
        print(f"Warning: Couldn't find the number of credits for an item in program {program_data['code']}")

    return 0


if __name__ == "__main__":
    process_prg_data()
