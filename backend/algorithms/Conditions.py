from json import dump
import json
import re

'''Keywords'''
AND = 1
OR = 2
IN = 3


class User:
    '''A user and their data which will be used to determine if they can take a course'''
    def __init__(self):
        self.courses = {}
        self.program = None # NOTE: For now this is only single degree
        self.specialisations = {}
        self.uoc = 0
        self.wam = 0
        self.year = 0 # TODO
        return

    def add_courses(self, courses):
        '''Adds courses to this user'''
        # TODO: In future, automatically determine which category this course fits into and update the UOC for that as well
        for course in courses:
            self.courses[course] = 1 # TODO: This should be UOC of the course
            
    def add_program(self, program):
        '''Adds a program to this user'''
        self.program # TODO: This should update to reflect UOC of user

    def add_specialisation(self, specialisation):
        '''Adds a specialisation to this user'''
        self.specialisations[specialisation] = 1 # TODO: This should update to reflect UOC of user
        
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
        self.connector = connector # Could be IN (only IN for now)

        # A list of UOC types attached to this object. If the connector is IN, then
        # UOC must be from within this conditional. E.g.
        # COMPA1 - courses within COMPA1
        # SENG - course codes starting with SENG
        # L4 - level 4 courses
        # CORE - core courses
        # And more...
        self.conditional = []

    def validate(self, user):
        if conditional == None:
            # Determine if the user has taken enough units
            return user.uoc >= uoc
        elif conditional == IN:
            # The user must have taken enough UOC in the given requirement
            




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


def create_requirement(tokens, n_parsed=0):
    '''Given the parsed logical tokens list, (assuming starting and ending bracket),
    return the requirement object. n_parsed tracks the number of tokens parsed at
    this depth level'''

    # Start off as a composite requirement
    result = CompositeRequirement()

    it = enumerate(tokens)
    for index, component in it:
        n_parsed += 1

        if component == '(':
            # Parse content in bracket 1 layer deeper
            sub_result, n_parsed = create_requirement(tokens[index + 1:], n_parsed)

            if sub_result == None:
                # Error. Return None
                return None, n_parsed
            else: 
                # Adjust the current position to scan the next token after this sub result
                [next(it, None) for _ in range(n_parsed)]
        elif component == ')':
            # End parsing and go up one layer
            return result, n_parsed
        elif component == "&&":
            # AND type logic. We will set it for clarity even though it is default
            result.set_logic(AND)
        elif component == "||":
            # Change logic to ||
            result.set_logic(OR)
        elif is_course(component):        
            # Requirement for a single course
            result.add_requirement(CourseRequirement(component))
        elif is_uoc_simple(component):
            # Simple UOC requirement (e.g. 144UOC)
            return # TODO
        else:
            # Unmatched component. Error
            return None, n_parsed
        
    
    # Simplify the result and return it
    return result.simplify(), n_parsed


'''HELPER FUNCTIONS TO DETERMINE THE TYPE OF A GIVEN TEXT'''


def is_course(text):
    if re.match(r'^[A-Z]{4}\d{4}$', text):
        # NOTE: Match on exact course for now but we might adjust this to match on lower case too
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