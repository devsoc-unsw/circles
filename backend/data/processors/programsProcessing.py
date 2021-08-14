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
import sys
from typing import Container, List, Iterable, Union, Optional 
from data.utility import dataHelpers
from collections import OrderedDict

TEST_PROGS = ["3778", "3707", "3970", "3502"]

def process_data():
    # Read in ProgramsFormattedRaw File
    data = dataHelpers.read_data("data/scrapers/programsFormattedRaw.json")
    # Final Data for all programs
    processedData = {}

    for program in TEST_PROGS:
        # Get program specific data
        formatted = data[program]
        # Initialise Processed data
        programData = {}
        # Add infomation about program (excluding ciriculum structure)
        programData = initialise_program(formatted)
        # Add curriculum structure
        addComponentData(formatted, programData)
        # Sort data alphabetically by key
        # Append processed program data to final data
        processedData[programData["code"]] = programData
        
    dataHelpers.write_data(processedData, "data/finalData/programsProcessedCompare.json")

def addComponentData(formatted, programData):
    components = {


        # "disciplinary_component" : {
        #     # "credits_to_complete" : 0,
        #     # "Majors" : {

        #     # }
        #     #"PE" : {
        #         #description
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
    for item in formatted["CurriculumStructure"]:
        if item["vertical_grouping"]["value"] == "FE":
            addFEData(components, item)

        if item["vertical_grouping"]["value"] == "GE":
            GE = {}
            GE["credits_to_complete"] = int(item["credit_points"])
            components["GE"] = GE
        
        if item["title"] == "Disciplinary Component":
            addDisciplineData(components, item)

        if item["vertical_grouping"]["value"] == "undergrad_minor":
            addMinorData(components, item)

    OrderedDict(sorted(components.items(), key=lambda t: t[0]))
    programData["components"] = components   
                

def addMinorData(components, item):
    minorData = {}
    for minor in item["relationship"]:
        if minor["academic_item_type"] and minor["academic_item_type"]["value"] == "minor":
            code = minor["academic_item_code"] 
            minorData[code] = 1
    components["Minors"] = minorData          


def addDisciplineData(components, item):
    Data = {}
    Data["credits_to_complete"] = int(item["credit_points"])


    if "container" in item and item["container"] != []:

        for container in item["container"]:
            if container["vertical_grouping"]["value"] == "undergrad_major" or container["vertical_grouping"]["value"] == "honours":
                majorData = {}
                for major in container["relationship"]:
                    if major["academic_item_type"]["value"] == "major" or major["academic_item_type"]["value"] == "honours": 
                        code = major["academic_item_code"] 
                        majorData[code] = 1
                Data["Majors"] = majorData

            if container["vertical_grouping"]["value"] == "undergrad_minor":
                minorData = {}
                for minor in container["relationship"]:
                    if minor["academic_item_type"]["value"] == "minor":
                        code = minor["academic_item_code"] 
                        minorData[code] = 1
                Data["Minors"] = minorData

            if container["vertical_grouping"]["value"] == "PE":
                PE = {}
                if container["relationship"] != []:
                    for course in container["relationship"]:
                        PE[course["academic_item_code"]] = 1
                    Data[container["title"]] = PE
                else:
                    for course in container["dynamic_relationship"]:
                        PE[course["description"]] = 1
                    Data[container["title"]] = PE

            if container["vertical_grouping"]["value"] == "CC":
                title = container["title"]
                CC = {}
                if container["credit_points"] != "":
                    CC["credits_to_complete"] = container["credit_points"]
                for course in container["relationship"]:
                    CC[course["academic_item_code"]] = 1

                Data[title] = CC    

    components["disciplinary_component"] = Data


def addFEData(components, item):
    FE = {}
    if item["credit_points"] != '':
        FE["credits_to_complete"] = int(item["credit_points"])
    else:
        FE["credits_to_complete"] = int(item["credit_points_max"])
    title = ""
    
    if item["container"] != []:
        title = "FE"
        for container in item["container"]:
            if container["vertical_grouping"]["value"] == "undergrad_minor":
                minorData = {}
                for minor in container["relationship"]:
                    if minor["academic_item_type"] and minor["academic_item_type"]["value"] == "minor":
                        code = minor["academic_item_code"] 
                        minorData[code] = 1
                FE["Minors"] = minorData

    elif item["relationship"] != []:
        title = item["title"]
        for elective in item['relationship']:
            FE[elective["academic_item_code"]] = 1

    elif item["dynamic_relationship"] != []:
        # Below if statement is an indication that it's not a real free elective
        if item["dynamic_relationship"][0]["description"] != "any course":
            title = item["title"]
            courses = {}
            for elective in item["dynamic_relationship"]:
                courses[elective["description"]] = 1
            FE["courses"] = courses
        # It is free elective
        else:
            title = "FE"
        
    components[title] = FE

def initialise_program(program): 
    """
    Initialises basic attributes of the specialisation.
    """
    program_info = {}
    program_info["title"] = program["title"]
    program_info["code"] = program["code"]

    duration = re.search("(\d)", program['duration'])
    duration = duration.group(1)

    program_info['duration'] = int(duration)
    program_info["UOC"] = int(program["UOC"])
    program_info["faculty"] = program["faculty"]
    program_info["components"] = {}

    return program_info

if __name__ == "__main__":
    process_data()