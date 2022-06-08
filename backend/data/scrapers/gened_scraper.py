"""
Program extracts raw data for Programs and place data in file
'coursesPureRaw.json', ready for formatting.

Step in the data's journey:
    [ X ] Scrape raw data (gened_scraper.py)
    [   ] Format scraped data
    [   ] Customise formatted data
"""

import json

import requests
from data.scrapers.courses_scraper import TOTAL_COURSES
from data.scrapers.payload import HEADERS, create_payload_gened
from data.utility import data_helpers

URL = "https://www.handbook.unsw.edu.au/api/es/search?appliedFilters="

def scrape_gened_data(year=None):
    """
    Retrieves gen ed data for all undergraduate programs
    """
    #faculty_list = get_faculty_list()
    faculty_list = []
    #gened_raw = data_helpers.read_data("data/scrapers/genedPureRaw.json")
    gened_raw = {}
    cl_id = ""
    academicOrg = ""

    programs_formatted = data_helpers.read_data("data/scrapers/programsFormattedRaw.json")
    for program_code in programs_formatted:
        program = programs_formatted[program_code]
        faculty = program["faculty"]
        if faculty in faculty_list:
            continue
        else:
            faculty_list.append(faculty)

        if faculty == "Faculty of Arts, Design and Architecture" or faculty == "Faculty of Law and Justice":
            academicOrg = "academicOrg"
        else:
            academicOrg = "parentAcademicOrg"
        cl_id = program[academicOrg]
        r = requests.post(URL, data=json.dumps(
            create_payload_gened(
            TOTAL_COURSES,
            "unsw_psubject",
            cl_id,
            academicOrg,
            year
            )
        ), headers=HEADERS)
        new_gened_courses_raw = r.json()["contentlets"]
        new_gened_list = []
        for course in new_gened_courses_raw:
            new_gened_list.append(course.get("code"))
        #gen eds by program code
        gened_raw[program["code"]] = new_gened_list

    data_helpers.write_data(
        gened_raw,
        "data/scrapers/genedPureRaw.json"
        if year is None else
        f"data/final_data/archive/raw/{year}.json"
    )

if __name__ == "__main__":
    scrape_gened_data()
