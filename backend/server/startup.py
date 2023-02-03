"""
This module is used to initialise assets that are used in the application.

This is very helpful for initialising resources on startup, seperate
from their usage as to prevent circular imports.

Distinct from `config.py` as that file relates to statically defined
values, whereas the contents of this file require further intialisation

This should be initialised AFTER the database has been initialised
"""

from typing import Literal, Mapping, Sequence
from algorithms.objects.helper import read_data

from server.database import archivesDB, coursesCOL
from data.config import ARCHIVED_YEARS, GRAPH_CACHE_FILE

def initialise_all_courses() -> Mapping[str, str]:
    """
    This function is used to initailise the `ALL_COURSES` variable.
    """
    # Observe that we create this as a `dict` but return it as a `Mapping`
    # We need dict's mutability to add to it, but we don't want to expose
    # that to the rest of the application. Mapping is a read-only interface.
    courses = {}
    for course in coursesCOL.find():
        courses[course["code"]] = course["title"]

    for year in sorted(ARCHIVED_YEARS, reverse=True):
        for course in archivesDB[str(year)].find():
            if course["code"] not in courses:
                courses[course["code"]] = course["title"]

    return courses

# def initialise_code_mapping

CODE_TO_TITLE_MAPPING: Mapping[str, str] = initialise_all_courses()
GRAPH: Mapping[Literal["incoming_adjacency_list"], Mapping[str, Sequence[str]]] = read_data(GRAPH_CACHE_FILE)
INCOMING_ADJACENCY: Mapping[str, Sequence[str]] = GRAPH.get("incoming_adjacency_list", {})
TITLE_TO_CODE: Mapping[str, str] = read_data("data/utility/programCodeMappings.json")["title_to_code"]
