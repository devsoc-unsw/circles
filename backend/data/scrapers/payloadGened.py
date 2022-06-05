"""
The payload dict object is used by the course, program and specialisation
scraper and is (so far) the exact same between all three files, except
for the size of the payload. This module centralises creation of the payload
The module also defines the url and headers for the scrapers
"""

from data.config import LIVE_YEAR

URL = "https://www.handbook.unsw.edu.au/api/es/search"
HEADERS = {
    "content-type": "application/json",
}


def create_payload_gened(size, content_type, cl_id, academic_org, year=LIVE_YEAR):
    """
    Create a payload of the given size
    content_type will be used as a prefix for the query fields
    Note: If changing any of the keys and passing them in as an argument,
    ensure that you add a default value for the argument so as to not
    break the payload for the other files
    """

    # Might get passed None as default value by the calling function
    if year is None:
        year = LIVE_YEAR

    return {
        "query":
            {"bool":
                {"filter": [{"terms": {"contenttype": [content_type]}},
                            {"term": {"live": True}}],
                    "must": [
                    {"query_string":
                        {"fields": [f"{content_type}.csTags"], "query":"*96d9bae4db2d4810fc9364e70596193a*"}},
                    {"query_string":
                        {"fields": [f"{content_type}.studyLevelValue"],
                         "query":"ugrd"}},
                    {"query_string":
                        {"fields": [f"{content_type}.implementationYear"],
                         "query":f"*{year}*"}}],
                    "must_not": [
                    {"query_string":
                        {"fields": [f"{content_type}.{academic_org}"], "query":cl_id}},

                    ]}},
        "sort": [{f"{content_type}.code_dotraw": "asc"}],
        "from": 0, "size": size,
    }