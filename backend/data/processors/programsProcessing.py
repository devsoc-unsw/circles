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


TEST_PROGS = ["3778"]

def process_data():
    data = dataHelpers.read_data("data/scrapers/programsFormattedRaw.json")
    processedData = {}

    for program in TEST_PROGS:
        formatted = data[program]

        programData = {}
        programData = initialise_program(formatted)
        addComponentData(formatted, programData)

        processedData[programData["code"]] = programData
        
    dataHelpers.write_data(processedData, "data/finalData/programsProcessedd.json")

def addComponentData(formatted, programData):
    components = {
            "disciplinary_component" : {
            "credits_to_complete" : 0,
            "Majors" : {

            }
        },

        "FE" : {
            "credits_to_complete" : 0,
            "Minors" : {

            }
        },

        "GE" : {
            "credits_to_complete" : 0
        }
    }
    for item in formatted["CurriculumStructure"]:
        if item["vertical_grouping"]["value"] == "FE":
            addFEData(components, item)

        if item["vertical_grouping"]["value"] == "GE":
            components["GE"]["credits_to_complete"] =  int(item["credit_points"])
        
        if item["title"] == "Disciplinary Component":
            addDisciplineData(components, item)

    programData["components"] = components   
                
def addDisciplineData(components, item):
    components["disciplinary_component"]["credits_to_complete"] = int(item["credit_points"])
    if "container" in item and item["container"] != []:
        for container in item["container"]:
            if container["vertical_grouping"]["value"] == "undergrad_major":
                for major in container["relationship"]:
                    if major["academic_item_type"]["value"] == "major":
                        code = major["academic_item_code"] 
                        components["disciplinary_component"]["Majors"][code] = 1



def addFEData(components, item):
    components["FE"]["credits_to_complete"] = int(item["credit_points"])
    if "container" in item and item["container"] != []:
        for container in item["container"]:
            if container["vertical_grouping"]["value"] == "undergrad_minor":
                for minor in container["relationship"]:
                    if minor["academic_item_type"] and minor["academic_item_type"]["value"] == "minor":
                        code = minor["academic_item_code"] 
                        components["FE"]["Minors"][code] = 1


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