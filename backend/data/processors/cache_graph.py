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

def cache_graph():
    graph = construct_full_graph()
    write_data(graph, GRAPH_CACHE_FILE)

    return graph

def construct_full_graph():
    conditions_objects = construct_conditions_objects()
    graph = {}
    for k, v in conditions_objects.items():
        print("k: ", k)
        with suppress(AttributeError):
            try:
                v = json.loads(str(v))
                with suppress(KeyError):
                    print(v["children"])
            except json.JSONDecodeError:
                print("ERRORRRRR\n"*5)
                print(v)
                print("\n"*5)
    print(graph)


if __name__ == "__main__":
    cache_graph()

