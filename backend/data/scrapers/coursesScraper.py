"""
Program extracts raw data for Programs and place data in file
'coursesPureRaw.json', ready for formatting.

Step in the data's journey:
    [ X ] Scrape raw data (coursesScraper.py)
    [   ] Format scraped data (coursesFormatting.py)
    [   ] Customise formatted data (coursesProcessing.py)
"""

import requests
import json
from data.utility import dataHelpers

THIS_YEAR = "2022"
TOTAL_COURSES = 10000

PAYLOAD = {
    "query": {
        "bool": {
            "must": [
                {
                    "term": {
                        "live": True
                    }
                },
                [
                    {
                        "bool": {
                            "minimum_should_match": "100%",
                            "should": [
                                {
                                    "query_string": {
                                        "fields": ["unsw_psubject.implementationYear"],
                                        "query":f"*{THIS_YEAR}*"
                                    }
                                }
                            ]
                        }
                    },
                    {
                        "bool": {
                            "minimum_should_match": "100%",
                            "should": [
                                {
                                    "query_string": {
                                        "fields": [
                                            "unsw_psubject.studyLevelValue"
                                        ],
                                        "query":"*ugrd*"
                                    }
                                }
                            ]
                        }
                    },
                    {
                        "bool": {
                            "minimum_should_match": "100%",
                            "should": [
                                {
                                    "query_string": {
                                        "fields": ["unsw_psubject.active"],
                                        "query":"*1*"
                                    }
                                }
                            ]
                        }
                    }
                ]
            ],
            "filter": [
                {
                    "terms": {
                        "contenttype": ["unsw_psubject"]
                    }
                }
            ]
        }
    },
    "sort": [
        {
            "unsw_psubject.code_dotraw": {
                "order": "asc"
            }
        }
    ],
    "from": 0,
    "size": TOTAL_COURSES,
    "track_scores": True,
    "_source": {
        "includes": ["*.code", "*.name", "*.award_titles", "*.keywords", "urlmap", "contenttype"],
        "excludes": ["", None]
    }
}

'''
Retrieves data for all undergraduate courses
'''


def scrape_courses():
    url = "https://www.handbook.unsw.edu.au/api/es/search"
    headers = {
        "content-type": "application/json",
    }
    r = requests.post(url, data=json.dumps(PAYLOAD), headers=headers)
    dataHelpers.write_data(
        r.json()["contentlets"], "data/scrapers/coursesPureRaw.json")


if __name__ == "__main__":
    scrape_courses()
