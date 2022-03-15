"""
Program processes the formatted data by editing and customising the data for
use on the frontend. See 'programsProcessed.json' for output.

NOTE: "program" == "program"

Status: Currently works for all COMP programs and SENGAH. Query next
        set of programs to include.

Step in the data's journey:
    [   ] Scrape raw data (programScraper.py)
    [   ] Format scraped data (programFormatting.py)
    [ X ] Customise formatted data (programProcessing.py)
"""

import re
from data.utility import data_helpers

# Set of current course codes in programs_processed.json
TEST_PROGS = ["3778", "3707"]


def process_prg_data_type1():
    # Read in ProgramsFormattedRaw File
    data = data_helpers.read_data("data/scrapers/programsFormattedRaw.json")
    # Final Data for all programs
    processedData = {}

    for program in TEST_PROGS:
        # Get program specific data
        formattedData = data[program]
        # Initialise Processed data
        programData = {}
        # Add infomation about program (excluding ciriculum structure)
        programData = initialise_program(formattedData)
        # Add curriculum structure
        addComponentData(formattedData, programData)
        # Sort data alphabetically by key
        # Append processed program data to final data
        processedData[programData["code"]] = programData

    data_helpers.write_data(
        processedData, "data/final_data/programsProcessedType1.json"
    )


def addComponentData(formatted, programData):
    components = {
        # "disciplinary_component" : {
        #     # "credits_to_complete" : 0,
        #     # "Majors" : {
        #     # }
        # },
        # "FE" : {
        #     # "credits_to_complete" : 0,
        #     # "Minors" : {
        #     # }
        # },
        # "GE" : {
        #     # "credits_to_complete" : 0
        # },
    }
    # Loop through items in curriculum structure
    for item in formatted["CurriculumStructure"]:
        # If item is a free elective
        if item["vertical_grouping"]["value"] == "FE":
            addFEData(components, item)
        # If item is general education
        if item["vertical_grouping"]["value"] == "GE":
            GE = {}
            GE["credits_to_complete"] = int(item["credit_points"])
            components["GE"] = GE
        # If item is part of core disciplinary
        if item["title"] == "Disciplinary Component":
            addDisciplineData(components, item)
        # If item is part of minor
        if item["vertical_grouping"]["value"] == "undergrad_minor":
            addMinorData(components, item)
    programData["components"] = components


def addMinorData(components, item):
    # Initialise data
    minorData = {}
    # Loop through list of minors
    for minor in item["relationship"]:
        # If item is a minor, add it to list
        if (
            minor["academic_item_type"]
            and minor["academic_item_type"]["value"] == "minor"
        ):
            code = minor["academic_item_code"]
            minorData[code] = 1
    # Append to minor data
    components["Minors"] = minorData


def addDisciplineData(components, item):
    # Initialise Specialisation Data (explained in wiki)
    Data = {}

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
                Data["Majors"] = majorData
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
                Data["Honours"] = honoursData

    components["DisciplineData"] = Data


def addFEData(components, item):
    FE = {}
    if item["credit_points"] != "":
        FE["credits_to_complete"] = int(item["credit_points"])
    else:
        FE["credits_to_complete"] = int(item["credit_points_max"])
    title = ""

    # If container is not empty, add data to minors
    if item["container"] != []:
        title = "FE"
        for container in item["container"]:
            if container["vertical_grouping"]["value"] == "undergrad_minor":
                minorData = {}
                for minor in container["relationship"]:
                    if (
                        minor["academic_item_type"]
                        and minor["academic_item_type"]["value"] == "minor"
                    ):
                        code = minor["academic_item_code"]
                        minorData[code] = minor["academic_item_name"]
                FE["Minors"] = minorData

    components[title] = FE


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
    process_prg_data_type1()
