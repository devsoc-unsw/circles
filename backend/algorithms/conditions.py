from json import dump
import json
import re

from categories import *

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

    def add_courses(self, courses):
        '''Given a dictionary of courses mapping course code to a (uoc, grade) tuple,
        adds the course to the user and updates the uoc/grade at the same time.
        NOTE: It is assumed that the user has not taken any of these courses yet
        '''
        self.courses = courses.copy()

        # Determine the total wam (wam * uoc) of the user
        total_wam = self.wam * self.uoc

        # Update the uoc and carefully update the wam for all the new given courses
        for course, (uoc, grade) in courses.item():
            self.uoc += uoc

            if grade != None:
                total_wam += uoc * grade

        self.wam = total_wam / self.uoc

    def add_program(self, program):
        '''Adds a program to this user'''
        self.program  # TODO: This should update to reflect UOC of user

    def add_specialisation(self, specialisation):
        '''Adds a specialisation to this user'''
        self.specialisations[specialisation] = 1  # TODO: This should update to reflect UOC of user

    def has_taken_course(self, course):
        '''Determines if the user has taken this course'''
        return course in self.courses


class Condition:
    '''The base condition object from which other conditions stem from'''

    def __init__(self):
        return

    def validate(self, user):
        '''Default value is true for something with no prerequisites'''
        return True

    def show(self):
        print("empty!")


class CourseCondition(Condition):
    '''Condition that the student has completed this course'''

    def __init__(self, course):
        self.course = course

    def validate(self, user):
        '''Returns true if the user has taken this course before'''
        return user.has_taken_course(self.course)


class UOCRequirement(Requirement):
    '''UOC requirements such as "24UOC in COMP"'''

    def __init__(self, uoc, connector=None):
        self.uoc = uoc
        self.connector = connector  # Could be IN (only IN for now)

        # The conditional uoc category attached to this object. If the connector is IN, then
        # UOC must be from within this conditional. E.g.
        # COMPA1 - courses within COMPA1
        # SENG - course codes starting with SENG
        # L4 - level 4 courses
        # L2 MATH - level 2 courses starting with MATH
        # CORE - core courses
        # And more...
        self.uoc_category = None

    def set_uoc_category(self, uoc_category_classobj):
        self.uoc_category = uoc_category_classobj

    def validate(self, user):
        if self.connector == None:
            # Determine if the user has taken enough units
            return user.uoc >= self.uoc
        elif self.connector == IN:
            # The user must have taken enough UOC in the given conditional
            return self.uoc_category.uoc(user) >= self.uoc
        else:
            # NOTE: No case for this but let's just return true for now
            return True


class WAMRequirement(Requirement):
    '''Handles WAM requirements such as 65WAM and 80WAM in'''

    def __init__(self, wam):
        self.wam = wam

        # The conditional wam category attached to this object. If the connector is in,
        # then the WAM must be from within this conditional. E.g.
        # 80WAM in (COMP || BINH || SENG)
        # NOTE: For now we assume OR condition
        self.categories = []

    def validate(self, user):
        # TODO: Make this return some warning in the future so WAM conditions do
        # not gate keep the user
        if user.wam == None:
            # Default is False
            return False

        if not self.categories:
            # Simple WAM requirement
            return user.wam >= self.wam
        else:
            # If a single WAM conditional is met, we return true
            for category in self.categories:
                category_wam = category.wam(user)
                if category_wam == None:
                    continue
                elif category_wam >= self.wam:
                    return True
            return False


class CompositeRequirement(Requirement):
    '''Handles AND/OR clauses comprised of requirement objects.
    NOTE: This will not handle clauses including BOTH && and || as it is assumed
    that brackets will have been used to prevent ambiguity'''

    def __init__(self, logic=AND):
        self.conditions = []
        self.logic = logic

    def add_condition(self, condition_classobj):
        '''Adds a condition object'''
        self.conditions.append(condition_classobj)

    def set_logic(self, logic):
        '''AND or OR'''
        self.logic = logic

    def simplify(self):
        '''Simplifies unnecessary nesting'''
        if not self.conditions:
            return Condition()

        if len(self.conditions) == 1:
            return self.conditions[0]

        return self

    def validate(self, user):
        if self.logic == AND:
            # All conditions must be true
            for cond in self.conditions:
                if cond.validate(user) == False:
                    return False
            return True
        elif self.logic == OR:
            # Only a single condition needs to be true
            for cond in self.conditions:
                if cond.validate(user) == True:
                    return True
            return False


def create_condition(tokens):
    '''Given the parsed logical tokens list, (assuming starting and ending bracket),
    return the condition object and the index of that (sub) token list'''

    # Start off as a composite condition
    result = CompositeCondition()

    it = enumerate(tokens)
    for index, token in it:
        if token == '(':
            # Parse content in bracket 1 layer deeper
            sub_result, sub_index = create_condition(tokens[index + 1:])
            if sub_result == None:
                # Error. Return None
                return None, sub_index
            else:
                # Adjust the current position to scan the next token after this sub result
                result.add_condition(sub_result)
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
            # Condition for a single course
            result.add_condition(CourseCondition(token))
        elif is_uoc(token):
            uoc = get_uoc(token)
            # Check the next word to determine logic. NOTE: This will never go
            # out of bounds since the last token is always a ')'
            if tokens[index + 1] == "in":
                # In connector
                uoc_cond = UOCCondition(uoc, IN)
                next(it)  # Skip "in" keyword

                # Get the category of the uoc condition
                uoc_category, sub_index = create_category(tokens[index + 2:])

                if uoc_category == None:
                    # Error. Return None. (Could also potentially set the uoc category
                    # to just the default Category which returns true and 1000 uoc taken)
                    return None, index
                else:
                    # Add the category to the uoc and adjust the current index position
                    uoc_req.set_uoc_category(uoc_category)
                    [next(it) for _ in range(sub_index + 1)]
            else:
                # No connector. Simple UOC condition
                uoc_cond = UOCCondition(uoc)

            result.add_requirement(uoc_req)
        elif is_wam(token):
            wam = get_wam(token)
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


def get_uoc(text):
    '''Given a text in the format of \d+UOC, will extract the uoc and return as an int'''
    uoc_str = re.match(r'^(\d+)UOC$', text, flags=re.IGNORECASE).group(1)

    return int(uoc_str)


def is_wam(text):
    '''If the text is WAM'''
    if re.match(r'^\d+WAM$', text, flags=re.IGNORECASE):
        return True
    return False


def get_wam(text):
    '''Given a text in the format of \d+WAM, will extract the wam and return as a int'''
    wam_str = re.match(r'^(\d+)WAM$', text, flags=re.IGNORECASE).group(1)

    return int(wam_str)

# tokens = ["(", "COMP1511", "&&", "(", "COMP1521", "||", "COMP1531", ")", ")"]
# user = User()
# user.add_courses(["COMP1511", "COMP1531"])

# cond, index = create_condition(tokens)
# # print(cond.to_str())
# print(cond.validate(user))

# user.uoc = 12
# user.courses = {
#     "COMP1511": 6,
#     "COMP1521": 6,
#     "COMP1531": 6
# }

# tokens = ["(", "12UOC", "in", "MATH", ")"]

# cond, index = create_condition(tokens)

# print(cond.validate(user))
