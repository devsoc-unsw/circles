"""
Program extracts raw data for Programs and place data in file
'coursesPureRaw.json', ready for formatting.

Step in the data's journey:
    [ X ] Scrape raw data (coursesScraper.py)
    [   ] Format scraped data (coursesFormatting.py)
    [   ] Customise formatted data (coursesProcessing.py)
"""

import json

import requests
from data.scrapers.payload import create_payload, URL, HEADERS
from data.utility import data_helpers

TOTAL_COURSES = 10000


def scrape_course_data():
    """
    Retrieves data for all undergraduate courses
    Makes the request to the handbook, scrape the data and calls
    write_data to dump the json to an OUTPUT_FILE
    """

    r = requests.post(URL, data=json.dumps(create_payload(
        TOTAL_COURSES,
        content_type="unsw_psubject"
    )), headers=HEADERS)
    data_helpers.write_data(
        r.json()["contentlets"], "data/scrapers/coursesPureRaw.json"
    )


if __name__ == "__main__":
    scrape_course_data()
