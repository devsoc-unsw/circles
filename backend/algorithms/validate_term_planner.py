from algorithms.objects.user import User
from server.routers.model import CONDITIONS, CACHED_HANDBOOK_NOTE, ValidPlannerData

def validate_terms(data: ValidPlannerData):
    emptyUserData = {
        "program": data.program,
        "specialisations": data.specialisations,
        "courses": {},  # Start off the user with an empty year
    }
    user = User(emptyUserData)
    # State of courses on the term planner
    coursesState = {}

    currYear = data.mostRecentPastTerm["Y"]
    pastTerm = data.mostRecentPastTerm["T"]

    for yearIndex, year in enumerate(data.plan):
        # Go through all the years
        for termIndex, term in enumerate(year):
            user.add_current_courses(term)

            for course in term:
                is_answer_accurate = CONDITIONS.get(course) is not None
                unlocked, warnings = (
                    CONDITIONS[course].validate(user)
                    if is_answer_accurate
                    else (True, [])
                )
                coursesState[course] = {
                    "is_accurate": is_answer_accurate,
                    "handbook_note": CACHED_HANDBOOK_NOTE.get(course, ""),
                    "unlocked": unlocked,
                    "warnings": warnings,
                    "supressed": yearIndex + 1 < currYear or (yearIndex + 1 == currYear and termIndex <= pastTerm)
                }
            # Add all these courses to the user in preparation for the next term
            user.empty_current_courses()
            user.add_courses(term)
    return coursesState