"""
The recommendation system. It will combine different weights of functions 
to create an overall score for each course and return the top X courses.

NOTE: For now, we will access the data inside the ./finalData folder. Later on,
we will cache the relevant data inside our algorithms/cache.

NOTE: For now, run inside backend folder with python3 -m algorithms.recommendations

NOTE: ENSURE YOU HAVE BRANCHED OFF!!!

NOTE: For sample user data, look at exampleUsers.json to get an idea of the structure
"""

def get_unlocked_courses(user):
    """
    Given a user's data, returns a list of all the unlocked courses which are
    ACCURATE. Refer to the getAllUnlocked() API for an example of how this works. 

    OUTPUT: [COMP1511, COMP1521, COMP1531...]
    """
    pass

def get_courses_path_to():
    """
    Returns a dictionary mapping courses to how many courses
    they can potentially unlock inside their path_to.
    (e.g. COMP2521 unlocks a lot of courses).

    OUTPUT: {
        "ACCT2511": 2,
        "ACCT2522": 1
    }
    """
    pass

def get_courses_in_faculty(user):
    """
    Given a user's data, determine the faculty of their program/specialisations 
    and returns a list of courses inside their faculty
    """
    pass

def get_courses_in_school(user):
    """
    Given a user's data, determine the school of their program/specialisations 
    and returns a list of courses inside their school
    """
    pass

def get_courses_in_core(user):
    """
    Given a user's data, returns a list of courses which explicitly appear inside
    their CORE courses within their specialisation/program (i.e. the course code
    itself is mentioned)
    """
    pass

def get_course_by_level(level):
    """
    Matches all courses to their levels.

    OUTPUT = {
        "COMP1511": 1,
        "COMP2521": 2,
        ...
    } 
    """
    pass

if __name__ == "__main__":
    pass