"""
Constructs the course graph using the conditions objects and jumps it as a json file.

From `/backend`, run this as:
    `python3 -m data.processors.cache_graph`

Do NOT run this from it's current location.

TODO: This should be moved as a command that can be run by `run_processors.py`
"""

from typing import Dict, List
from data.config import GRAPH_CACHE_FILE
from data.processors.load_conditions import construct_conditions_objects
from data.utility.data_helpers import write_data

CONDITONS = None

def cache_graph():
    graph = construct_full_graph()
    write_data(graph, GRAPH_CACHE_FILE)

    return graph

def construct_full_graph():
    # TODO: Other processors should cache a courselist
    # courses: List[str] = CONDITIONS.keys()

    incoming_adj = {
            course: incoming_list(course) for course, cond in CONDITIONS.items()
            if cond is not None
        }

    return {
            "incoming_adjacency_list": incoming_adj,
    }


def incoming_list(course: str) -> List[str]:
    """
    Returns a list of courses which can be used to satisfy 'course'
    eg 2521 -> 1511

    TODO: Integrate this properly as a method in the `Condition` class
    """
    return get_path_from(course)["courses"]

def get_path_from(course: str) -> dict[str, str | list[str]]:
    """
    fetches courses which can be used to satisfy 'course'
    eg 2521 -> 1511
    """
    course_condition = CONDITIONS.get(course)

    return {
        "original" : course,
        "courses" : [
            coursename for coursename, _ in CONDITIONS.items()
            if course_condition.is_path_to(coursename)
        ]
    }

def initialise_conditions():
    global CONDITIONS
    CONDITIONS = construct_conditions_objects()

if __name__ == "__main__":
    initialise_conditions()
    cache_graph()

def proto_edges_to_edges(proto_edges: List[Dict[str, str]]) -> List[Dict[str, str]]:
    """
    Take the proto-edges created by calls to `path_from` and convert them into
    a full list of edges of form.
    [
        {
            "source": (str) - course_code, # This is the 'original' value
            "target": (str) - course_code, # This is the value of 'courses'
        }
    ]
    Effectively, turning an adjacency list into a flat list of edges
    """
    edges: List = []
    for proto_edge in proto_edges:
        # Incoming: { original: str,  courses: List[str]}
        # Outcome:  { "src": str, "target": str }
        if not proto_edge or not proto_edge["courses"]:
            continue
        for course in proto_edge["courses"]:
            edges.append({
                    "source": course,
                    "target": proto_edge["original"],
                }
            )
    return edges
