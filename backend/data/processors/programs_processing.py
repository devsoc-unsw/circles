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

from multiprocessing.sharedctypes import Value
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

CS_PROGS = (
    "3673", # Ecomonics major is optional, no general education, program constraints(?), UNSW Business Electives
    "3674",
    "3778",
    "3781",
    "3782",
    "3783",
    "3784",
    "3785",
    "3786",
    "3789",
    "3791",
    "4515",
    "7003",
    "7022"
)

ENG_PROGS = (
    "3131",
    "3132",
    "3133",
    "3134",
    "3707",
    "3736",
    "3761",
    "3762",
    "3764",
    "3765",
    "3766",
    "3767",
    "3768",
    "3769",
    "3773",
    "3776",
    "3785",
    "3961",
    "4471",
    "4472",
    "4473",
    "4474",
    "4475",
    "4476",
    "4477",
    "4478",
    "4515"
)

OTH_PROGS = (
    "3502",
)

TESTING_MODE = True
TEST_PROGS = (CS_PROGS + OTH_PROGS)

def process_prg_data() -> None:
    """
    Read in INPUT_PATH, process them and write to OUTPUT_PATH
    """
    data = read_data(INPUT_PATH)

    processed_data = {}
    for program_code, formatted_data in data.items():
        # Get program specific data
        if not TESTING_MODE or program_code in TEST_PROGS:
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
        },
        "processing_warnings": [],
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
        add_information_rule(program_data, item)
    if is_limit_rule(item):
        add_limit_rule(program_data, item)
    if is_prescribed_elective(item):
        add_prescribed_elective(program_data, item)
        return
    if is_other(item):
        add_other(program_data, item)

    # Recurse further down through the container and the relationship list
    for next in item["relationship"]:
        add_component_data(program_data, next, program_name = program_name)
    for next in item["container"]:
        add_component_data(program_data, next, program_name = program_name)


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
    if is_substring(program_names[0], program_names[1]):
        add_warning(f"{program_names[0]} is a substring of {program_names[1]}", program_data, item)
    if is_substring(program_names[1], program_names[0]):
        add_warning(f"{program_names[1]} is a substring of {program_names[0]}", program_data, item)

    # Search
    for program_name in program_names:
        if program_name in item["title"]:
            return program_name
        for container in item["container"]:
            if program_name in container["title"]:
                return program_name

    # Couldn't find a match :(
    add_warning(f"Couldn't find any of names ({') or ('.join(program_names)})", program_data, item)


def is_substring(needle: str, haystack: str) -> bool:
    """
    Returns boolean whether needle is a substring of haystack
    (case insensitive)
    """
    needle_escaped = re.escape(needle)
    return bool(re.match(needle_escaped, haystack, flags = re.IGNORECASE))


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
        "credits_to_complete": get_container_credits(program_data, item),
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
    courses = {}
    add_course_tabs(program_data, courses, item)

    program_data["components"][CORE_COURSE_KEY].append({
        "courses": courses,
        "title": item["title"],
        "credits_to_complete": get_container_credits(program_data, item),
        "levels": [], # TODO
        "notes": item["description"],
    })


def add_information_rule(program_data: dict, item: dict) -> None:
    """
    Adds information rule data to the correct spot in program_data
    """
    program_data["components"][INFORMATION_RULE_KEY].append({
        "title": item["title"],
        "notes": item["description"],
    })


def add_limit_rule(program_data: dict, item: dict) -> None:
    """
    Adds limit rule data to the correct spot in program_data
    """
    # Split into description and requirements component
    description_lines = item["description"].split("\n")
    if len(description_lines) != 2:
        add_warning("Expected 1 newline for limit rule", program_data, item)
        return

    notes = description_lines[0]
    requirements_str = description_lines[1]

    # Process the limit rule descriptions to get credits and requirements
    credits_to_complete = get_string_credits(program_data, item, notes)
    requirements = format_course_strings(requirements_str)

    courses = {}
    process_any_requirements(program_data, courses, requirements, item)

    program_data["components"][LIMIT_RULE_KEY].append({
        "courses": courses,
        "title": item["title"],
        "credits_to_complete": credits_to_complete,
        "levels": [], # TODO
        "notes": notes,
    })


def add_prescribed_elective(program_data: dict, item: dict) -> None:
    """
    Adds prescribed elective data to the correct spot in program_data
    """
    courses = {}
    add_course_tabs(program_data, courses, item)
    program_data["components"][PRESCRIBED_ELECTIVE_KEY].append({
        "courses": courses,
        "title": item["title"],
        "credits_to_complete": get_container_credits(program_data, item),
        "levels": [], # TODO: What is this?
        "notes": item["description"],
    })


def add_other(program_data: dict, item: dict) -> None:
    """
    Adds 'other' data to the correct spot in program_data
    """
    courses = {}
    add_course_tabs(program_data, courses, item)
    program_data["components"][OTHER_KEY].append({
        "courses": courses,
        "title": item["title"],
        "credits_to_complete": get_container_credits(program_data, item),
        "levels": [], # TODO: What is this?
        "notes": item["description"],
    })


def add_course_tabs(program_data: dict, courses: dict, item: dict) -> None:
    """
    Adds a single given drop down tab to the core courses requirements
    """
    if item["dynamic_relationship"]:
        requirements = [ course["description"] for course in item["dynamic_relationship"] ]
        process_any_requirements(program_data, courses, requirements, item)
    elif item["vertical_grouping"]["value"] == "one_of_the_following":
        # Check if it's a 'one of the following' requirement or single course requirements
        combined_key = " or ".join([ course["academic_item_code"] for course in item["relationship"] ])
        courses[combined_key] = [ course["academic_item_name"] for course in item["relationship"] ]
    else:
        for course in item["relationship"]:
            # Check if it's just a normal course
            if course["academic_item_code"] is not None:
                # Normal course, add it
                code = course["academic_item_code"]
                courses[code] = course["academic_item_name"]
            else:
                # It's of the form 'any course matching the pattern ########'
                code = course["parent_record"][-8:].rstrip("#")
                courses[code] = course["parent_record"][-40:]

    # Recurse further down in case we've missed something
    for next in item["container"]:
        add_course_tabs(program_data, courses, next)


def process_any_requirements(program_data: dict, courses: dict, requirements: list[str], item: dict) -> None:
    """
    Processes list of course (as strings) requirements
    that are of the form 'any <faculty or type of course> course'
    """
    for requirement in requirements:
        stripped = strip_any_requirement_description(requirement)
        level = get_any_requirement_level(stripped)

        try:
            codes = get_any_requirement_codes(stripped, level)
        except ValueError as e:
            add_warning(e, program_data, item)
            continue

        for code in codes:
            courses[code] = requirement


def format_course_strings(requirements_str: str) -> list[str]:
    """
    Format limit rule requirement string to match other rules format
    by making it into a list of strings of the form 'any <faculty> course'
    """
    # Get rid of useless keywords, codes and double spaces
    requirements_str = re.sub(r"(course|offered by|\([A-Z]{4}\))", " ", requirements_str, flags = re.IGNORECASE)
    requirements_str = re.sub(r"\s+", " ", requirements_str, flags = re.IGNORECASE)

    # Split into different requirements
    courses = re.split(r"\s*any\s*", requirements_str, flags = re.IGNORECASE)

    # Format
    courses = list(map(lambda s: s.strip(), courses))
    courses = list(filter(lambda s: s != "", courses))
    courses = list(map(lambda s: f"any {s} course", courses))

    return courses


def strip_any_requirement_description(requirement: str) -> str:
    """
    Get only the useful bit of any requirements.
    I.e., if requirement is of the form 'any <faculty> course'
    or 'any course offered by <faculty>' then get '<faculty>'
    """
    search_result = re.search(r"any (.+) course", requirement, flags = re.IGNORECASE)
    if search_result is None:
        search_result = re.search(r"any course offered by (.+)", requirement, flags = re.IGNORECASE)

    return search_result.group(1)


def get_any_requirement_level(requirement: str) -> str:
    """
    Finds the level requirement (if there is any).
    If there isn't, returns empty string
    """
    search_result = re.search(r"level (\d)", requirement, flags = re.IGNORECASE)
    if search_result is not None:
        return search_result.group(1)
    return ""


def get_any_requirement_codes(stripped: str, level: str) -> list[str]:
    """
    Generates code from stripped requirement and level.
    Raises a ValueError if the faculty isn't in facultyCodesProcessed.json
    """
    # Find the faculty (if there is any)
    search_result = re.search(r"([a-zA-Z]\D+)$", stripped, flags = re.IGNORECASE)
    if search_result is None:
        # There is no faculty, return generic code
        return [f"....{level}"]

    # There is a faculty/school.
    # Format the faculty properly and get the mappings from faculties -> codes
    faculty = faculty_manual_fixes(search_result.group(1))
    mappings = read_data(FACULTY_CODE_PATH)

    try:
        faculty_codes = mappings[faculty]
    except KeyError:
        raise ValueError(f"Can't figure out what abbreviated code(s) are for {faculty}")

    return list(map(lambda c: f"{c}{level}", faculty_codes))


def faculty_manual_fixes(faculty: str) -> str:
    """
    Manual fixes to format keys into the
    form seen in facultyCodesProcessed.json
    """
    faculty = faculty.replace("School of", "S")
    faculty = faculty.replace("Faculty of", "F")

    # Manual fixes
    faculty = faculty.replace("S Medical Sciences", "S Medical")
    faculty = faculty.replace("F Medicine and Health", "F Medicine")
    # TODO: More manual fixes, but not sure what these are meant to become
    # General Education - F Business -> ????
    # Arts and Social Sciences -> ????
    return faculty


def get_credits_decorator(func):
    def wrapper(program_data, item, *args, **kwargs):
        try:
            return func(item, *args, **kwargs)
        except ValueError as e:
            add_warning(e, program_data, item)
            return 0
    return wrapper

@get_credits_decorator
def get_container_credits(item: dict) -> int:
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
        raise ValueError("Couldn't find the number of credits for item")


@get_credits_decorator
def get_string_credits(_: dict, notes: str) -> int:
    """
    Search for UOC conditions in the notes section of a limit rule
    TODO: Is this method robust enough?
    """
    search_result = re.search(r"(\d+) *UOC", notes, flags = re.IGNORECASE)
    if search_result is not None:
        return int(search_result.group(1))
    raise ValueError("Couldn't find the number of credits for item")


def add_warning(w: Exception | str, program_data: dict, item: dict) -> None:
    warning = f"{w} in program {program_data['title']} ({program_data['code']}) in section titled '{item['title']}'"
    program_data["processing_warnings"].append(warning)
    print(f"Warning: {warning}")


if __name__ == "__main__":
    process_prg_data()
