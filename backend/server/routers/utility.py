"""
General purpose utility functions for the server, that do not fit
specifically in any one function
"""

def map_suppressed_errors(func: callable, errors_log: list[any], *args, **kwargs) -> any:
    """
    Map a function to a list of arguments, and return the result of the function
    if no error is raised. If an error is raised, log the error and return None.
    """
    try:
        return func(*args, **kwargs)
    except Exception as e:
        errors_log.append((*args, e))
    return None

