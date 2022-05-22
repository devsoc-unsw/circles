"""
Program processes the formatted data by editing and customising the data for
use on the frontend. See 'programsProcessed.json' for output.

Status: Currently works for all COMP programs and SENGAH. Query next
        set of programs to include.

Step in the data's journey:
    [   ] Scrape raw data (programScraper.py)
    [   ] Format scraped data (programFormatting.py)
    [ X ] Customise formatted data (programProcessing.py)
"""

import re
from collections import OrderedDict


from data.utility.data_helpers import read_data, write_data


FREE_ELECTIVE = "FE"
GENERAL_EDUCATION = "GE"
PRESCRIBED_ELECTIVE = "PE"
CORE_COURSE = "CC"
INFORMATION_RULE = "IR"
LIMIT_RULE = "LR"


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

def process_prg_data():
    """
    Read in programsFormattedRaw.json, process them and write to
    programsProcessed.json
    """
    # Read in ProgramsFormattedRaw File
    data = read_data("data/scrapers/programsFormattedRaw.json")

    processedData = {}
    for program in TEST_PROGS:
        # Get program specific data
        formattedData = data[program]
        programData = initialise_program(formattedData)

        # Loop through items in curriculum structure and add to the program data
        for item in formattedData["CurriculumStructure"]:
            addComponentData(programData, item)

        # Order dict alphabetically
        OrderedDict(sorted(programData["components"].items(), key=lambda t: t[0]))

        code = programData["code"]
        processedData[code] = programData

    write_data(processedData, "data/final_data/programsProcessed.json")


def initialise_program(program: dict) -> dict:
    """
    Initialises basic attributes of the specialisation.
    """
    programInfo = {}
    programInfo["title"] = program["title"]
    programInfo["code"] = program["code"]

    duration = re.search("(\d)", program["duration"])
    duration = duration.group(1)

    programInfo["duration"] = int(duration)
    programInfo["UOC"] = int(program["UOC"])
    programInfo["faculty"] = program["faculty"]
    programInfo["description"] = program["description"]
    programInfo["components"] = { # TODO: Document the structure
        GENERAL_EDUCATION: {},
        INFORMATION_RULE: [],
        LIMIT_RULE: [],
        "SpecialisationData": {},
        "NonSpecialisationData": [],
    }

    return programInfo


def addComponentData(programData: dict, item: dict, programName = None) -> None:
    if any(key not in item for key in ("vertical_grouping", "title")):
        return

    programName = findProgramName(programData, item) if programName is None else programName

    # Figure out what type of requirement we're looking at,
    # and add it to the appropriate spot in the program data
    if isGeneralEducation(item):
        addGeneralEducationData(programData, item)
    if isMajor(item):
        addSpecialisationData(programData, item, programName, "Minors")
    if isMinor(item):
        addSpecialisationData(programData, item, programName, "Majors")
    if isHonours(item):
        addSpecialisationData(programData, item, programName, "Honours")
    if isPrescribedElective(item):
        addPrescribedElectiveData(programData, item)
    if isCoreCourse(item):
        addCoreCourseData(programData, item)
    if isInformationRule(item):
        addRule(programData, INFORMATION_RULE, item)
    if isLimitRule(item):
        addRule(programData, LIMIT_RULE, item)
    if isOther(item):
        addOther(programData, item)

    # Recurse further down through the container nad the relationship list
    for next in item["relationship"]:
        addComponentData(programData, next, programName = programName)
    for next in item["container"]:
        addComponentData(programData, next, programName = programName)


def findProgramName(programData: dict, item: dict) -> str:
    # Split the title into it's single degrees and get rid of white space
    rawProgramNames = programData["title"].split("/")
    strippedProgramNames = list(map(lambda s: s.strip(), rawProgramNames))

    # Check if we even need to bother searching
    if len(strippedProgramNames) == 1:
        return strippedProgramNames[0]

    # Sort by longest length first
    sortedProgramNames = sorted(strippedProgramNames, key = lambda s: -len(s))

    # Print a warning if one of the strings is a substring of the other
    if sortedProgramNames[0] in sortedProgramNames[1] or sortedProgramNames[1] in sortedProgramNames[0]:
        print(f"Warning: One of {sortedProgramNames} is a substring of the other for program code {programData['code']}")

    # Search
    for programName in sortedProgramNames:
        if programName in item["title"]:
            return programName
        for container in item["container"]:
            if programName in container["title"]:
                return programName

    # Couldn't find a match :(
    print(f"Warning: Couldn't find any of names = {sortedProgramNames} for program code {programData['code']}")


def isGeneralEducation(item: dict) -> bool:
    return item["vertical_grouping"]["value"] == GENERAL_EDUCATION


def isMajor(item: dict) -> bool:
    return item["vertical_grouping"]["value"] == "undergrad_major"


def isMinor(item: dict) -> bool:
    return item["vertical_grouping"]["value"] == "undergrad_minor"


def isHonours(item: dict) -> bool:
    return item["vertical_grouping"]["value"] == "honours"


def isPrescribedElective(item: dict) -> bool:
    return item["vertical_grouping"]["value"] == PRESCRIBED_ELECTIVE


def isCoreCourse(item: dict) -> bool:
    return item["vertical_grouping"]["value"] == CORE_COURSE


def isInformationRule(item: dict) -> bool:
    return item["vertical_grouping"]["value"] == INFORMATION_RULE


def isLimitRule(item: dict) -> bool:
    return item["vertical_grouping"]["value"] == LIMIT_RULE


def isOther(item: dict) -> bool:
    return (
        item["dynamic_relationship"]
        and item["title"] != "Free Electives"
        and item["vertical_grouping"]["value"] in (FREE_ELECTIVE, PRESCRIBED_ELECTIVE)
    )


def addGeneralEducationData(programData: dict, item: dict) -> None:
    # Double check we haven't somehow already added the general education stuff already
    if programData["components"][GENERAL_EDUCATION] != {}:
        raise ValueError("Already added GE to this program")

    programData["components"][GENERAL_EDUCATION] = {
        "notes": item["description"],
        "credits_to_complete": getCredits(item),
    }


def addSpecialisationData(programData: dict, item: dict, programName: str, field: str) -> None:
    SpecialisationData = programData["components"]["SpecialisationData"]
    data = {
        "notes": item["description"],
    }
    for specialisation in item["relationship"]:
        code = specialisation["academic_item_code"]
        if code is not None:
            data[code] = specialisation["academic_item_name"]

    SpecialisationData.setdefault(field, {}).update({programName: data})


def addPrescribedElectiveData(programData: dict, item: dict) -> None:
    # If item is a prescribed elective, loop through and add data to nonspecialisationdata
    NonSpecialisationData = programData["components"]["NonSpecialisationData"]
    pe = {
        "courses": {},
        "title": item["title"],
        "credits_to_complete": getCredits(item),
        "core": False,
        "levels": [], # TODO
        "notes": item["description"],
    }

    # Figure out if there are sub relations
    if item["relationship"] != []:
        for course in item["relationship"]:
            code = course["academic_item_code"]
            pe["courses"][code] = course["academic_item_name"]
    else:
        for course in item["dynamic_relationship"]:
            pe["courses"][course["description"]] = 1

    # Append this new requirement
    NonSpecialisationData.append(pe)

def addCoreCourseData(programData: dict, item: dict) -> None:
    # If item is a core course
    NonSpecialisationData = programData["components"]["NonSpecialisationData"]
    cc = {
        "courses": {},
        "title": item["title"],
        "credits_to_complete": getCredits(item),
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

    NonSpecialisationData.append(cc)


def addRule(programData: dict, ruleType: str, item: dict) -> None:
    programData["components"][ruleType].append({
        "title": item["title"],
        "notes": item["description"],
    })


def addOther(programData: dict, item: dict) -> None:
    NonSpecialisationData = programData["components"]["NonSpecialisationData"]

    NonSpecialisationData.append({
        "courses": [ rel["description"] for rel in item["dynamic_relationship"] ],
        "title": item["title"],
        "credits_to_complete": getCredits(item),
        "core": isCoreCourse(item),
        "levels": [], # TODO: What is this?
        "notes": item["description"],
    })



def getCredits(item: dict) -> int:
    if item["credit_points"] != "":
        try:
            return int(item["credit_points"])
        except ValueError:
            return int(item["credit_points_max"])


if __name__ == "__main__":
    process_prg_data()
