"""
Program extracts raw data for specialisations and place data in file
'specialisationsPureRaw.json', ready for formatting.

Step in the data's journey:
    [ X ] Scrape raw data (specialisationsScraper.py)
    [   ] Format scraped data (specialisationFormatting.py)
    [   ] Customise formatted data (specialisationProcessing.py)
"""

import json
import requests
from data.scrapers.payload import create_payload, HEADERS, URL
from data.utility import data_helpers

# Note as at May 2021, there are 365 specialisations
TOTAL_SPNS = 1000


def scrape_spn_data():
    """Retrieves data for all undergraduate specialisations"""

    res = requests.post(URL, data=json.dumps(create_payload(
        TOTAL_SPNS, content_type="unsw_paos")), headers=HEADERS)

    data_helpers.write_data(
        res.json()["contentlets"], "data/scrapers/specialisationsPureRaw.json"
    )


if __name__ == "__main__":
    scrape_spn_data()
