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
from data.scrapers.payload import HEADERS
from data.scrapers.payloadGened import create_payload_gened
from data.utility import data_helpers 

URL = "https://www.handbook.unsw.edu.au/api/es/search?appliedFilters="

def scrape_gened_data(year=None):
    """
    Retrieves gen ed data for all undergraduate programs
    """
    
    r = requests.post(URL, data=json.dumps(
        create_payload_gened(
        TOTAL_COURSES,
        "unsw_psubject",
        #"882a15a31bfae810d044ffbbdc4bcb53", #design
        "7c2459ef1bbae810d044ffbbdc4bcbd4", #vision science
        #"57a56ceb4f0093004aa6eb4f0310c7ae",
        "parentAcademicOrg",
        year
        )
    ), headers=HEADERS)
    data_helpers.write_data(
        r.json()["contentlets"],
        "data/scrapers/genedPureRaw.json"
        if year is None else
        f"data/final_data/archive/raw/{year}.json"
    )
    print(get_faculty_list())

def get_faculty_list():
    faculty_list = []
    with open('data/final_data/programsProcessed.json') as json_file:
        data = json.load(json_file)
    for program in data.values():
        faculty_list.append(program["faculty"])
    faculty_list = set(faculty_list)
    return faculty_list

if __name__ == "__main__":
    scrape_gened_data()
    