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
from data.config import LIVE_YEAR
from data.utility import data_helpers

TOTAL_PGRMS = 249

PAYLOAD = {
    "query": {
        "bool": {
            "must": [
                {"term": {"live": True}},
                [
                    {
                        "bool": {
                            "minimum_should_match": "100%",
                            "should": [
                                {
                                    "query_string": {
                                        "fields": ["unsw_pcourse.studyLevelValue"],
                                        "query": "*ugrd*",
                                    }
                                }
                            ],
                        }
                    },
                    {
                        "bool": {
                            "minimum_should_match": "100%",
                            "should": [
                                {
                                    "query_string": {
                                        "fields": ["unsw_pcourse.implementationYear"],
                                        "query": f"*{LIVE_YEAR}*",
                                    }
                                }
                            ],
                        }
                    },
                    {
                        "bool": {
                            "minimum_should_match": "100%",
                            "should": [
                                {
                                    "query_string": {
                                        "fields": ["unsw_pcourse.active"],
                                        "query": "*1*",
                                    }
                                }
                            ],
                        }
                    },
                ],
            ],
            "filter": [{"terms": {"contenttype": ["unsw_pcourse", "unsw_pcourse"]}}],
        }
    },
    "sort": [{"unsw_pcourse.code_dotraw": {"order": "asc"}}],
    "from": 0,
    "size": 249,
    "track_scores": True,
    "_source": {
        "includes": [
            "*.code",
            "*.name",
            "*.award_titles",
            "*.keywords",
            "urlmap",
            "contenttype",
        ],
        "excludes": ["", None],
    },
}


def scrape_prg_data():
    """
    Retrieves data for all undergraduate programs
    """
    url = "https://www.handbook.unsw.edu.au/api/es/search"
    headers = {
        "content-type": "application/json",
    }
    r = requests.post(url, data=json.dumps(PAYLOAD), headers=headers)
    data_helpers.write_data(
        r.json()["contentlets"], "data/scrapers/programsPureRaw.json"
    )


if __name__ == "__main__":
    scrape_prg_data()
