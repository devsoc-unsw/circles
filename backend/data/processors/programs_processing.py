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

        # Add infomation about program (excluding ciriculum structure)
        programData = initialise_program(formattedData)

        # Add curriculum structure
        addComponentData(formattedData, programData)

        # Append processed program data to final data
        processedData[programData["code"]] = programData

    write_data(processedData, "data/final_data/programsProcessed.json")


def addComponentData(formatted, programData):
    # TODO: Properly document how it's structured
    programData["components"] = {
        "GE": {},
        "SpecialisationData": {},
        "NonSpecialisationData": [],
    }

    # Loop through items in curriculum structure
    for item in formatted["CurriculumStructure"]:
        recAddComponentData(programData, item)

    # Order dict alphabetically
    OrderedDict(sorted(programData["components"].items(), key=lambda t: t[0]))

def recAddComponentData(programData, item, programName = ""):
    if any(key not in item for key in ("vertical_grouping", "title")):
        return

    programName = findProgramName(programData, item) if programName == "" else programName

    if item["vertical_grouping"]["value"] == "GE":
        addGEData(programData, item)

    if item["vertical_grouping"]["value"] == "undergrad_major":
        addSpecialisationData(programData, item, programName, "Majors")

    if item["vertical_grouping"]["value"] == "honours":
        addSpecialisationData(programData, item, programName, "Honours")

    if item["vertical_grouping"]["value"] == "undergrad_minor":
        addSpecialisationData(programData, item, programName, "Minors")

    if item["vertical_grouping"]["value"] == "PE":
        addPEData(programData, item)

    if item["vertical_grouping"]["value"] == "CC":
        addCCData(programData, item)

    # Add anything from dynamic relationship unless it's a gened/free elective
    if item["dynamic_relationship"] and item["title"] != "Free Electives" and item["vertical_grouping"]["value"] in ("FE", "PE"):
        programData["components"]["NonSpecialisationData"].append({
            "courses": [rel["description"] for rel in item["dynamic_relationship"]],
            "title": item["title"],
            "credits_to_complete": getCredits(item),
            "core": item["vertical_grouping"]["value"] == "CC", # TODO: Make a function for this that's more comprehensive
            "levels": [], # TODO: What is this?
            "notes": item["description"],
        })

    # Recurse further down
    for rel_item in item["relationship"]:
        recAddComponentData(programData, rel_item, programName)
    for con_item in item["container"]:
        recAddComponentData(programData, con_item, programName)


def addGEData(programData, item):
    # Double check we haven't somehow already added the GE stuff already
    GE = programData["components"]["GE"]
    if "credits_to_complete" in GE:
        raise ValueError("Already added GE credits to this program")

    GE["credits_to_complete"] = getCredits(item)


def getCredits(item):
    if item["credit_points"] != "":
        try:
            return int(item["credit_points"])
        except ValueError:
            return int(item["credit_points_max"])


def addMinorData(programData, item):
    # Loop through list of minors
    minorData = {}
    for minor in item["relationship"]:
        # If item is a minor, add it to list
        if minor["academic_item_type"] and minor["academic_item_type"]["value"] == "minor":
            code = minor["academic_item_code"]
            minorData[code] = minor["academic_item_name"]

    # Append to minor data
    SpecialisationData = programData["components"]["SpecialisationData"]
    if "Minors" not in SpecialisationData:
        SpecialisationData["Minors"] = {}

    programName = findProgramName(programData, item)
    SpecialisationData["Minors"][programName] = minorData


# TODO: This function doesn't work properly. Must make it more robust (see my attempt below)
def findProgramName(programData, item):
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


def addSpecialisationData(programData, container, programName, field):
    SpecialisationData = programData["components"]["SpecialisationData"]
    data = {
        "notes": container["description"],
    }
    for specialisation in container["relationship"]:
        code = specialisation["academic_item_code"]
        if code is not None:
            data[code] = specialisation["academic_item_name"]

    SpecialisationData.setdefault(field, {}).update({programName: data})

def addPEData(programData, container):
    # If item is a prescribed elective, loop through and add data to nonspecialisationdata
    NonSpecialisationData = programData["components"]["NonSpecialisationData"]
    pe = {
        "courses": {},
        "title": container["title"],
        "credits_to_complete": getCredits(container),
        "core": False,
        "levels": [], # TODO
        "notes": container["description"],
    }

    # Figure out if there are sub relations
    if container["relationship"] != []:
        for course in container["relationship"]:
            code = course["academic_item_code"]
            pe["courses"][code] = course["academic_item_name"]
    else:
        for course in container["dynamic_relationship"]:
            pe["courses"][course["description"]] = 1

    # Append this new requirement
    NonSpecialisationData.append(pe) # TODO: [container["title"]]

def addCCData(programData, container):
    # If item is a core course
    NonSpecialisationData = programData["components"]["NonSpecialisationData"]
    cc = {
        "courses": {},
        "title": container["title"],
        "credits_to_complete": getCredits(container),
        "core": True,
        "levels": [], # TODO
        "notes": container["description"],
    }

    # If there are multiple courses
    if container["container"] != []:
        # Loop through and find all courses and add them
        for item in container["container"]:
            for course in item["relationship"]:
                code = course["academic_item_code"]
                cc["courses"][code] = course["academic_item_name"]
    else:
        for course in container["relationship"]:
            code = course["academic_item_code"]
            cc["courses"][code] = course["academic_item_name"]

    NonSpecialisationData.append(cc)


def initialise_program(program):
    """
    Initialises basic attributes of the specialisation.
    """
    program_info = {}
    program_info["title"] = program["title"]
    program_info["code"] = program["code"]

    duration = re.search("(\d)", program["duration"])
    duration = duration.group(1)

    program_info["duration"] = int(duration)
    program_info["UOC"] = int(program["UOC"])
    program_info["faculty"] = program["faculty"]
    program_info["notes"] = program["description"]
    program_info["components"] = {}

    return program_info


if __name__ == "__main__":
    process_prg_data()
