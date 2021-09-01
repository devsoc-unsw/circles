from json import dump
import json
import re

from uoc_types import *

'''Keywords'''
AND = 1
OR = 2
IN = 3


class User:
    '''A user and their data which will be used to determine if they can take a course'''

    def __init__(self):
        self.courses = {}
        self.program = None  # NOTE: For now this is only single degree
        self.specialisations = {}
        self.uoc = 0
        self.wam = 0
        self.year = 0  # TODO
        return

    def add_courses(self, courses):
        '''Adds courses to this user'''
        # TODO: In future, automatically determine which category this course fits into and update the UOC for that as well
        for course in courses:
            self.courses[course] = 1  # TODO: This should be UOC of the course

    def add_program(self, program):
        '''Adds a program to this user'''
        self.program  # TODO: This should update to reflect UOC of user

    def add_specialisation(self, specialisation):
        '''Adds a specialisation to this user'''
        self.specialisations[specialisation] = 1  # TODO: This should update to reflect UOC of user

    def has_taken_course(self, course):
        '''Determines if the user has taken this course'''
        return course in self.courses

    # TODO: WAM and UOC


class Requirement:
    '''The base requirement object from which other requirements stem from'''

    def __init__(self):
        return

    def validate(self, user):
        '''Default value is true for something with no prerequisites'''
        return True

    def show(self):
        print("empty!")


class CourseRequirement(Requirement):
    '''Requirement that the student has completed this course'''

    def __init__(self, course):
        self.course = course

    def validate(self, user):
        '''Returns true if the user has taken this course before'''
        return user.has_taken_course(self.course)


class UOCRequirement(Requirement):
    '''UOC requirements such as "24UOC in/including...'''

    def __init__(self, uoc, connector=None):
        self.uoc = uoc
        self.connector = connector  # Could be IN (only IN for now)

        # The conditional uoc type attached to this object. If the connector is IN, then
        # UOC must be from within this conditional. E.g.
        # COMPA1 - courses within COMPA1
        # SENG - course codes starting with SENG
        # L4 - level 4 courses
        # L2 MATH - level 2 courses starting with MATH
        # CORE - core courses
        # And more...
        self.uoc_type = None

    def set_uoc_type(self, uoc_type_classobj):
        self.uoc_type = uoc_type_classobj

    def validate(self, user):
        if self.connector == None:
            # Determine if the user has taken enough units
            return user.uoc >= self.uoc
        elif self.connector == IN:
            # The user must have taken enough UOC in the given conditional
            return self.uoc_type.uoc_taken(user) >= self.uoc
        else:
            # NOTE: No case for this but let's just return true for now
            return True


class CompositeRequirement(Requirement):
    '''Handles AND/OR clauses comprised of requirement objects.
    NOTE: This will not handle clauses including BOTH && and || as it is assumed
    that brackets will have been used to prevent ambiguity'''

    def __init__(self, logic=AND):
        self.requirements = []
        self.logic = logic

    def add_requirement(self, requirement_classobj):
        '''Adds a requirement object'''
        self.requirements.append(requirement_classobj)

    def set_logic(self, logic):
        '''AND or OR'''
        self.logic = logic

    def simplify(self):
        '''Simplifies unnecessary nesting'''
        if not self.requirements:
            return Requirement()

        if len(self.requirements) == 1:
            return self.requirements[0]

        return self

    def validate(self, user):
        if self.logic == AND:
            # All requirements must be true
            for req in self.requirements:
                if req.validate(user) == False:
                    return False
            return True
        elif self.logic == OR:
            # Only a single requirement needs to be true
            for req in self.requirements:
                if req.validate(user) == True:
                    return True
            return False


def create_requirement(tokens):
    '''Given the parsed logical tokens list, (assuming starting and ending bracket),
    return the requirement object and the index of that (sub) token list'''

    # Start off as a composite requirement
    result = CompositeRequirement()

    # ( a ( b ( c ( d . . . ) ) ) )
    #           0 1 2 3 4 5 6 7
    #               0 1 2 3 4

    it = enumerate(tokens)
    for index, token in it:
        if token == '(':
            # Parse content in bracket 1 layer deeper
            sub_result, sub_index = create_requirement(tokens[index + 1:])
            if sub_result == None:
                # Error. Return None
                return None, sub_index
            else:
                # Adjust the current position to scan the next token after this sub result
                result.add_requirement(sub_result)
                [next(it) for _ in range(sub_index + 1)]
        elif token == ')':
            # End parsing and go up one layer
            return result, index
        elif token == "&&":
            # AND type logic. We will set it for clarity even though it is default
            result.set_logic(AND)
        elif token == "||":
            # Change logic to ||
            result.set_logic(OR)
        elif is_course(token):
            # Requirement for a single course
            result.add_requirement(CourseRequirement(token))
        elif is_uoc(token):
            uoc = get_uoc(token)
            # Check the next word to determine logic. NOTE: This will never go
            # out of bounds since the last token is always a ')'
            if tokens[index + 1] == "in":
                # In connector
                uoc_req = UOCRequirement(uoc, IN)
                next(it)  # Skip "in" keyword

                # Get the type of the uoc condition
                uoc_type, sub_index = create_uoc_type(tokens[index + 2:])

                if uoc_type == None:
                    # Error. Return None. (Could also potentially set the uoc type
                    # to just the default UOCType which returns true and 1000 uoc taken)
                    return None, index
                else:
                    # Add the type to the uoc and adjust the current index position
                    uoc_req.set_uoc_type(uoc_type)
                    [next(it) for _ in range(sub_index + 1)]
            else:
                # No connector. Simple UOC requirement
                uoc_req = UOCRequirement(uoc)

            result.add_requirement(uoc_req)
        else:
            # Unmatched token. Error
            return None, index

    # Simplify the result and return it
    return result.simplify(), index


'''HELPER FUNCTIONS TO DETERMINE THE TYPE OF A GIVEN TEXT'''


def is_course(text):
    if re.match(r'^[A-Z]{4}\d{4}$', text, flags=re.IGNORECASE):
        return True
    return False


def is_uoc(text):
    '''If the text is UOC'''
    if re.match(r'^\d+UOC$', text, flags=re.IGNORECASE):
        return True
    return False


def is_uoc_simple(text):
    '''If the text is just the UOC only'''
    if re.match(r'^\d+UOC$', text, flags=re.IGNORECASE):
        return True
    return False


def is_uoc_complex(text):
    '''If the text is the UOC with some following condition'''
    if re.match(r'\d+UOC.+', text, flags=re.IGNORECASE):
        return True

    return False


def get_uoc(text):
    '''Given a text in the format of \dUOC, will extract the uoc and return as an int'''
    uoc_str = re.match(r'(\d+)UOC', text, flags=re.IGNORECASE).group(1)

    return int(uoc_str)


# tokens = ["(", "COMP1511", "&&", "(", "COMP1521", "||", "COMP1531", ")", ")"]
# user = User()
# user.add_courses(["COMP1511", "COMP1531"])

# req, index = create_requirement(tokens)
# # print(req.to_str())
# print(req.validate(user))

# user.uoc = 12
# user.courses = {
#     "COMP1511": 6,
#     "COMP1521": 6,
#     "COMP1531": 6
# }

# tokens = ["(", "12UOC", "in", "MATH", ")"]

# req, index = create_requirement(tokens)

# print(req.validate(user))
