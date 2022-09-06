"""
General purpose utility functions for the server, that do not fit
specifically in any one function
"""


from typing import Any, Callable, List
import requests

def map_suppressed_errors(func: Callable, errors_log: List[Any], *args, **kwargs) -> Any:
    """
    Map a function to a list of arguments, and return the result of the function
    if no error is raised. If an error is raised, log the error and return None.
    """
    try:
        return func(*args, **kwargs)
    except Exception as e:
        errors_log.append((*args, e))
    return None

def get_core_courses(program: str, specialisations: list[str]):
    req = requests.get(f"http://127.0.0.1:8000/programs/getStructure/{program}/{'+'.join(specialisations)}").json()
    return sum(
            (
                sum((
                    list(value["courses"].keys())
                    for sub_group, value in spec["content"].items()
                    if 'core' in sub_group.lower()
                ), [])
            for spec_name, spec in req["structure"].items()
            if "Major" in spec_name or "Honours" in spec_name)
         , [])

