"""
Program extracts raw data for Programs and place data in file
'programsRaw.json', ready for formatting.

Step in the data's journey:
    [ X ] Scrape raw data (programScraper.py)
    [   ] Format scraped data (programFormatting.py)
    [   ] Customise formatted data (programProcessing.py)
"""
import json

import requests
from data.scrapers.payload import create_payload, HEADERS, URL
from data.utility import data_helpers

TOTAL_PGRMS = 249


def scrape_prg_data():
    """
    Retrieves data for all undergraduate programs
    """
    r = requests.post(URL, data=json.dumps(create_payload(
        TOTAL_PGRMS, content_type="unsw_pcourse")), headers=HEADERS)
    data_helpers.write_data(
        r.json()["contentlets"], "data/scrapers/programsPureRaw.json"
    )


if __name__ == "__main__":
    scrape_prg_data()
