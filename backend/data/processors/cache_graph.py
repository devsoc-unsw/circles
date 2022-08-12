"""
Constructs the course graph using the conditions objects and jumps it as a json file.

From `/backend`, run this as:
    `python3 -m data.processors.cache_graph`

Do NOT run this from it's current location.

TODO: This should be moved as a command that can be run by `run_processors.py`
"""

from data.config import GRAPH_CACHE_FILE
from data.processors.load_conditions import construct_conditions_objects
from data.processors.log_broken import CONDITIONS_TOKENS_FILE
from data.utility.data_helpers import read_data, write_data

def cache_graph():
    graph = construct_full_graph()
    write_data(graph, GRAPH_CACHE_FILE)

    return graph

def construct_full_graph():
    conditions_objects = construct_conditions_objects()
    graph = {}
    for k, v in conditions_objects.items():
        print(k, v)
        # print(v.children)
        exit(0)


if __name__ == "__main__":
    cache_graph()

