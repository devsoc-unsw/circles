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
from data.scrapers.payload import create_payload, URL, HEADERS
from data.scrapers.payloadGened import create_payload_gened, HEADERS
from data.utility import data_helpers

TOTAL_PGRMS = 249
URL = "https://www.handbook.unsw.edu.au/api/es/search"
#URL = "https://www.handbook.unsw.edu.au/api/es/search?appliedFilters="
#URL = "https://www.handbook.unsw.edu.au/search?appliedFilters=eyJzZWFyY2giOnsiZXMiOnsicXVlcnkiOnsiYm9vbCI6eyJmaWx0ZXIiOlt7InRlcm1zIjp7ImNvbnRlbnR0eXBlIjpbInVuc3dfcHN1YmplY3QiXX19LHsidGVybSI6eyJsaXZlIjp0cnVlfX1dLCJtdXN0IjpbeyJxdWVyeV9zdHJpbmciOnsiZmllbGRzIjpbInVuc3dfcHN1YmplY3QuY3NUYWdzIl0sInF1ZXJ5IjoiKjk2ZDliYWU0ZGIyZDQ4MTBmYzkzNjRlNzA1OTYxOTNhKiJ9fSx7InF1ZXJ5X3N0cmluZyI6eyJmaWVsZHMiOlsidW5zd19wc3ViamVjdC5zdHVkeUxldmVsVmFsdWUiXSwicXVlcnkiOiJ1Z3JkIn19LHsicXVlcnlfc3RyaW5nIjp7ImZpZWxkcyI6WyJ1bnN3X3BzdWJqZWN0LmltcGxlbWVudGF0aW9uWWVhciJdLCJxdWVyeSI6IjIwMjIifX1dLCJtdXN0X25vdCI6W3sicXVlcnlfc3RyaW5nIjp7ImZpZWxkcyI6WyJ1bnN3X3BzdWJqZWN0LmFjYWRlbWljT3JnIl0sInF1ZXJ5IjoiZTM4ZWE5MmIxYjNlZTgxMGQwNDRmZmJiZGM0YmNiOGIifX0seyJxdWVyeV9zdHJpbmciOnsiZmllbGRzIjpbInVuc3dfcHN1YmplY3QuY29kZSJdLCJxdWVyeSI6IkZBREE2NzAwIn19XX19LCJzb3J0IjpbeyJ1bnN3X3BzdWJqZWN0LmNvZGVfZG90cmF3IjoiYXNjIn1dLCJmcm9tIjowLCJzaXplIjoxNX0sInByZWZpeCI6InVuc3dfcCJ9LCJkZXNjcmlwdGlvbiI6ImFueSBHZW5lcmFsIEVkdWNhdGlvbiBjb3Vyc2UiLCJ2ZXJzaW9uIjoiMjAyMi4wNCIsImNvZGUiOiIzMzMyIiwidGl0bGUiOiJDb25zdHJ1Y3Rpb24gTWFuYWdlbWVudCBhbmQgUHJvcGVydHkiLCJydWxlSWQiOiJkYzhjNWI3ZWRiYzg4OTEwNTk1ODUwZDhmNDk2MTljYyIsInNvdXJjZVVSTCI6Ii91bmRlcmdyYWR1YXRlL3Byb2dyYW1zLzIwMjIvMzMzMiIsInNvdXJjZVVSTFRleHRLZXkiOiJjc193aWxkY2FyZF9zb3VyY2VfYmFja19saW5rdGV4dCIsInNvdXJjZVR5cGUiOiJQcm9ncmFtIn0="
TOTAL_COURSES = 461
def scrape_gened_data(year=None):
    """
    Retrieves gen ed data for all undergraduate programs
    """
    r = requests.post(URL, data=json.dumps(
        create_payload(
        TOTAL_COURSES,
        "unsw_psubject",
        year
        )
    ), headers=HEADERS)
    data_helpers.write_data(
        r.json()["contentlets"], "data/scrapers/genedPureRaw.json"
    )


if __name__ == "__main__":
    scrape_gened_data()
