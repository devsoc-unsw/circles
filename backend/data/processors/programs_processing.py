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

"""
TODO: Get rid of this before merging
Joels notes
- Science (3970) is a little weird because underneath the disciplinary component it has 'science electives'
- Fix mix of camel/snake case
- What's the best way to deal with cases like Biotechnology (Honours) (3053) where under Disciplinary Component/Level 1 core course there's the 'one of the following'? Seperate requirements?
- Commerce (3502) has some courses that are 0UOC but are core?
- Do we actually need to store free elective stuff? Some programs don't even have it, so the algorithm is going to have to deal with not having access to it anyways.
"""


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

def recAddComponentData(programData, item):
    if any(key not in item.keys() for key in ("vertical_grouping", "title")):
        return

    if item["vertical_grouping"]["value"] == "GE":
        addGEData(programData, item)

    # If item is part of core disciplinary
    if "Disciplinary Component" in item["title"]:
        addDisciplineData(programData, item)

    # If item is part of minor
    if item["vertical_grouping"]["value"] == "undergrad_minor":
        addMinorData(programData, item)

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
        recAddComponentData(programData, rel_item)
    for con_item in item["container"]:
        recAddComponentData(programData, con_item)


def addGEData(programData, item):
    # Double check we haven't somehow already added the GE stuff already
    GE = programData["components"]["GE"]
    if "credits_to_complete" in GE.keys():
        raise ValueError("Already added GE credits to this program")
    GE["credits_to_complete"] = getCredits(item)


def getCredits(item):
    if item["credit_points"] == "":
        return None

    try:
        return int(item["credit_points"])
    except ValueError:
        return int(item["credit_points_max"])


def addMinorData(programData, item):
    # Loop through list of minors
    minorData = {}
    for minor in item["relationship"]:
        # If item is a minor, add it to list
        if isMinor(minor):
            code = minor["academic_item_code"]
            minorData[code] = minor["academic_item_name"]
    # Append to minor data
    programData["components"]["SpecialisationData"]["Minors"] = minorData


def isMinor(minor):
    return minor["academic_item_type"] and minor["academic_item_type"]["value"] == "minor"


def findProgramName(programData, item):
    programName = item["title"]
    programNames = programData["title"].split("/")
    for programName in programNames:
        if programName in item["title"]:
            return programName.strip()
        for container in item["container"]:
            if programName in container["title"]:
                return programName.strip()
    return programName.strip()

# TODO: Clean this function
def addDisciplineData(programData, item):
    components = programData["components"]
    components.setdefault("SpecialisationData", {})
    components.setdefault("NonSpecialisationData", [])

    SpecialisationData = components["SpecialisationData"]
    # Initialise NonSpecialisation Data (explained in wiki)
    NonSpecialisationData = components["NonSpecialisationData"]

    programName = findProgramName(programData, item)
    if "container" in item and item["container"] != []:
        # Loop through items in disciplinary component
        for container in item["container"]:
            # If item is a major, loop through and add data to major
            if container["vertical_grouping"]["value"] == "undergrad_major":
                majorData = {}
                for major in container["relationship"]:
                    if (
                        major["academic_item_type"]["value"] == "major"
                        or major["academic_item_type"]["value"] == "honours"
                    ):
                        code = major["academic_item_code"]
                        majorData[code] = major["academic_item_name"]

                SpecialisationData.setdefault("Majors", {}).update({programName: majorData})

            # If item is honours loop through and add data to honours
            if container["vertical_grouping"]["value"] == "honours":
                honoursData = {}
                for major in container["relationship"]:
                    if (
                        major["academic_item_type"]["value"] == "major"
                        or major["academic_item_type"]["value"] == "honours"
                    ):
                        code = major["academic_item_code"]
                        honoursData[code] = major["academic_item_name"]
                SpecialisationData.setdefault("Honours", {}).update(honoursData)

            # If item is minor loop through and add data to minors
            if container["vertical_grouping"]["value"] == "undergrad_minor":
                minorData = {}
                for minor in container["relationship"]:
                    if minor["academic_item_type"]["value"] == "minor":
                        code = minor["academic_item_code"]
                        minorData[code] = minor["academic_item_name"]
                SpecialisationData.setdefault("Minors", {}).update(minorData)

            # If item is a prescribed elective, loop through and add data to nonspecialisationdata
            if container["vertical_grouping"]["value"] == "PE":
                PE = {
                    "courses": {},
                    "title": container["title"],
                    "credits_to_complete": getCredits(container),
                    "core": False,
                }

                # Figure out if there are sub relations
                if container["relationship"] != []:
                    for course in container["relationship"]:
                        code = course["academic_item_code"]
                        PE["courses"][code] = course["academic_item_name"]
                else:
                    for course in container["dynamic_relationship"]:
                        PE["courses"][course["description"]] = 1

                # Append this new requirement
                NonSpecialisationData.append(PE) # TODO: [container["title"]]

            # If item is a core course
            if container["vertical_grouping"]["value"] == "CC":
                CC = {
                    "core": True,
                    "title": container["title"],
                    "credits_to_complete": getCredits(container),
                    "courses": {},
                    "levels": [], # TODO
                    "notes": container["description"],
                }

                # If there are multiple courses
                if container["container"] != []:
                    # Loop through and find all courses and add them
                    for item in container["container"]:
                        for course in item["relationship"]:
                            code = course["academic_item_code"]
                            CC["courses"][code] = course["academic_item_name"]
                else:
                    for course in container["relationship"]:
                        code = course["academic_item_code"]
                        CC["courses"][code] = course["academic_item_name"]

                NonSpecialisationData.append(CC)


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
    program_info["components"] = {}

    return program_info


if __name__ == "__main__":
    process_prg_data()
