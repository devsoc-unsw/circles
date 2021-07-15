"""
Program extracts raw data for specialisations and place data in file
'specialisationsPureRaw.json', ready for formatting.

Step in the data's journey:
    [ X ] Scrape raw data (specialisationScraper.py)
    [   ] Format scraped data (specialisationFormatting.py)
    [   ] Customise formatted data (specialisationProcessing.py)
"""

import requests
import json
from datetime import date
from utility import dataHelpers

THIS_YEAR = str(date.today().year) # Ensures request remains up-to-date
TOTAL_SPNS = 500 # Update if number of specialisations increases

# Note as at May 2021, there are 365 specialisations
PAYLOAD = {
    "query":{
        "bool":{
            "must":[
                {
                "term":{
                    "live":True
                }
                },
                [
                {
                    "bool":{
                        "minimum_should_match":"100%",
                        "should":[
                            {
                            "query_string":{
                                "fields":[
                                    "unsw_paos.implementationYear"
                                ],
                                "query":f"*{THIS_YEAR}*"
                            }
                            }
                        ]
                    }
                },
                {
                    "bool":{
                        "minimum_should_match":"100%",
                        "should":[
                            {
                            "query_string":{
                                "fields":[
                                    "unsw_paos.studyLevelValue"
                                ],
                                "query":"*ugrd*"
                            }
                            }
                        ]
                    }
                },
                {
                    "bool":{
                        "minimum_should_match":"100%",
                        "should":[
                            {
                            "query_string":{
                                "fields":[
                                    "unsw_paos.active"
                                ],
                                "query":"*1*"
                            }
                            }
                        ]
                    }
                }
                ]
            ],
            "filter":[
                {
                "terms":{
                    "contenttype":[
                        "unsw_paos"
                    ]
                }
                }
            ]
        }
    },
    "sort":[
        {
            "unsw_paos.code_dotraw":{
                "order":"asc"
            }
        }
    ],
    "from":0,
    "size":TOTAL_SPNS,
    "track_scores":True,
    "_source":{
        "includes":[
            "*.code",
            "*.name",
            "*.award_titles",
            "*.keywords",
            "urlmap",
            "contenttype"
        ],
        "excludes":[
            "",
            None
        ]
    }
}

def scrape_spn_data():
    """ Retrieves data for all undergraduate specialisations """

    url = "https://www.handbook.unsw.edu.au/api/es/search"
    headers = {
        "content-type": "application/json",
    }

    r = requests.post(url, data=json.dumps(PAYLOAD), headers=headers)

    dataHelpers.write_data(r.json()["contentlets"], 'scrapers/specialisationsPureRaw.json')

if __name__ == "__main__":
    scrape_spn_data()