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
from typing import List, Iterable, Union, Optional 
import dataHelpers

def process_data():
    data = dataHelpers.read_data("programsFormattedRaw.json")
    processedData = {}

    for program in data:
        programData = initialise_program(program)



def initialise_program(program): 
    """
    Initialises basic attributes of the specialisation.
    """
    program_info = {}
    program_info["title"] = program["title"]
    program_info["code"] = program["code"]
    program_info['duration'] = program['duration']
    program_info["UOC"] = program["UOC"]
    program_info["faculty"] = program["faculty"]
    
    program_info["disciplinary_component"] = []
    program_info["free_elective "] = []
    program_info["Prescribed Elective"] = []
    program_info["general_education"] = []

if __name__ == "__main__":
    process_data()