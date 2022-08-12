"""
Constructs the course graph using the conditions objects and jumps it as a json file.

From `/backend`, run this as:
    `python3 -m data.processors.cache_graph`

Do NOT run this from it's current location.

TODO: This should be moved as a command that can be run by `run_processors.py`
"""

from contextlib import suppress
from data.config import GRAPH_CACHE_FILE
from data.processors.load_conditions import construct_conditions_objects
from data.utility.data_helpers import write_data
import json

CONDITONS = None

def cache_graph():
    graph = construct_full_graph()
    write_data(graph, GRAPH_CACHE_FILE)

    return graph

def construct_full_graph():
    conditions_objects = construct_conditions_objects()
    graph = {}
    fails = []
    for k, v in conditions_objects.items():
        try:
            pass
            # this is such a dumb hack; TODO: make actual __dict__ method
            real_v = json.loads(str(v))

            children = real_v.get("children", [])
            graph[k] = children
            # print(
            #         "k: ", k,
            #         json.loads(str(v))
            #     )
        except json.JSONDecodeError as e:
            if v is None:
                fails.append((v, e))
    # for f in fails:
    #     print(f)
    # print("len", len(fails))
    return graph

def initialisee_conditions():
    global CONDITIONS
    CONDITIONS = construct_conditions_objects()

if __name__ == "__main__":
    initialisee_conditions()
    cache_graph()

def get_paths_to():
    course_condition = CONDITIONS.get(course)
    if not course_condition:
        raise HTTPException(400, f"no course by name {course}")
    return {
        "original" : course,
        "courses" : [
            coursename for coursename, _ in CONDITIONS.items()
            if course_condition.is_path_to(coursename)
        ]
    }
