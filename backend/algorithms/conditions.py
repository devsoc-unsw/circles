import sys
import json
import re

from json import dump

from categories import *

'''Keywords'''
AND = 1
OR = 2


'''CACHED'''



class User:
    '''A user and their data which will be used to determine if they can take a course'''

    def __init__(self):
        self.courses = {}
        self.program = None  # NOTE: For now this is only single degree
        self.specialisations = {}
        self.uoc = 0
        self.wam = None
        self.year = 0  # TODO

    def add_courses(self, courses):
        '''Given a dictionary of courses mapping course code to a (uoc, grade) tuple,
        adds the course to the user and updates the uoc/grade at the same time.
        NOTE: For now, this does not do anything for courses which the user has already taken
        '''
        for course in courses:
            if course not in self.courses:
                self.courses[course] = courses[course]

        # Determine the total wam (wam * uoc) of the user
        if self.wam != None:
            total_wam = self.wam * self.uoc
        else:
            total_wam = 0

        # Update the uoc and carefully update the wam for all the new given courses
        no_wam = True  # Flag to determine if the user has chosen to upload any wam
        for course, (uoc, grade) in courses.items():
            self.uoc += uoc

            if grade != None:
                no_wam = False
                total_wam += uoc * grade

        if no_wam == False:
            self.wam = total_wam / self.uoc

    def add_program(self, program):
        '''Adds a program to this user'''
        self.program = program # TODO: This should update to reflect UOC of user

    def add_specialisation(self, specialisation):
        '''Adds a specialisation to this user'''
        self.specialisations[specialisation] = 1  # TODO: This should update to reflect UOC of user

    def has_taken_course(self, course):
        '''Determines if the user has taken this course'''
        return course in self.courses

    def in_program(self, program):
        '''Determines if the user is in this program code'''
        return self.program == program

    def in_specialisation(self, specialisation):
        '''Determines if the user is in the specialisation'''
        return specialisation in self.specialisations

    def get_grade(self, course):
        '''Given a course which the student has taken, returns their grade (or None for no grade'''
        return self.courses[course][1]

class CourseCondition():
    '''Condition that the student has completed this course'''

    def __init__(self, course):
        self.course = course

    def get_course(self):
        return self.course

    def validate(self, user):
        '''Returns true if the user has taken this course before'''
        return user.has_taken_course(self.course)


class UOCCondition():
    '''UOC conditions such as "24UOC in COMP"'''

    def __init__(self, uoc):
        self.uoc = uoc

        # The conditional uoc category attached to this object.
        # If there is a cateogry, UOC must be from within this category. E.g.
        # COMPA1 - courses within COMPA1
        # SENG - course codes starting with SENG
        # L4 - level 4 courses
        # L2 MATH - level 2 courses starting with MATH
        # CORE - core courses
        # And more...
        self.category = None

    def set_category(self, category_classobj):
        self.category = category_classobj

    def validate(self, user):
        if self.category == None:
            # Simple UOC condition
            return user.uoc >= self.uoc
        else:
            # The user must have taken enough uoc in the given category
            return self.category.uoc(user) >= self.uoc


class WAMCondition():
    '''Handles WAM conditions such as 65WAM and 80WAM in'''

    def __init__(self, wam):
        self.wam = wam

        # The conditional wam category attached to this object.
        # If a category is attached, then the WAM must be from within this category. E.g.
        # 80WAM in COMP
        # NOTE: We will convert 80WAM in (COMP || BINH || SENG) to:
        # 80WAM in COMP || 80WAM in BINH || 80WAM in SENG
        # so that only one category is attached to this wam condition
        self.category = None

    def set_category(self, category_classobj):
        self.category = category_classobj

    def validate(self, user):
        '''
        Determines if the user has met the WAM condition for this category.

        Will always return True and a warning since WAM can fluctuate
        '''

        # Determine the wam we must figure out (whether it is the user's overall wam or a specific category)
        if self.category == None:
            applicable_wam = user.wam
        else:
            applicable_wam = self.category.wam(user)
        
        return True, self.get_warning(applicable_wam)

    def get_warning(self, applicable_wam):
        '''Returns an appropriate warning message or None if not needed'''
        if self.category == None:
            if applicable_wam == None:
                return f"Requires {self.wam} WAM. Your WAM has not been recorded"
            elif applicable_wam >= self.wam:
                return None
            else: 
                return f"Requires {self.wam} WAM. Your WAM is currently {applicable_wam:.3f}"
        else:
            if applicable_wam == None:
                return f"Requires {self.wam} WAM in {self.category}. Your WAM in {self.category} has not been recorded"
            elif applicable_wam >= self.wam:
                return None
            else:
                return f"Requires {self.wam} WAM in {self.category}. Your WAM in {self.category} is currently {applicable_wam:.3f}"

class GRADECondition():
    '''Handles GRADE conditions such as 65GRADE and 80GRADE in [A-Z]{4}[0-9]{4}'''

    def __init__(self, grade, course):
        self.grade = grade

        # Course code
        self.course = course

    def validate(self, user):
        '''
        Determines if the user has met the GRADE condition for this course.\n
        Not taken the course - Return False\n
        Taken the course but no mark provided - Return True and add warning\n
        Taken the course but mark too low - Return False\n
        Taken the course and sufficient mark - Return True\n
        '''
        if self.course not in user.courses:
            return False, None
        
        user_grade = user.get_grade(self.course)
        if user_grade == None:
            return True, self.get_warning()
        elif user_grade < self.grade:
            return False, None
        else:
            return True, None

    def get_warning(self):
        return f"Requires {self.grade} mark in {self.course}. You mark has not been recorded"

class ProgramCondition():
    '''Handles Program conditions such as 3707'''

    def __init__(self, program):
        self.program = program

    def validate(self, user):
        return user.in_program(self.program)


class SpecialisationCondition():
    '''Handles Specialisation conditions such as COMPA1'''

    def __init__(self, specialisation):
        self.specialisation = specialisation

    def validate(self, user):
        return user.in_specialisation(self.specialisation)


class CompositeCondition():
    '''Handles AND/OR clauses comprised of condition objects.'''

    def __init__(self, logic=AND):
        # NOTE: By default, logic should be OR. This will ensure that empty conditions
        # evaluate as True due to the way we implement validate
        self.conditions = []
        self.logic = logic

    def add_condition(self, condition_classobj):
        '''Adds a condition object'''
        self.conditions.append(condition_classobj)

    def set_logic(self, logic):
        '''AND or OR'''
        self.logic = logic

    def is_unlocked(self, user):
        '''The first level check which returns the result and a warning. Call this
        with the appropriate user data to determine if a course is unlocked or not.
        Will return an object containing the result and a list of warnings'''
        warnings = []
        
        unlocked = self.validate(user, warnings)
        result = {
            "result": unlocked,
            "warnings": warnings
        }
        
        return result

    def validate(self, user, warnings=[]):
        # Ensure we add all the warnings. 
        # NOTE: Remember that warnings are only returned
        # along with True by validate() method. In other words, checking a warning 
        # is != None is the equivalent of checking that validate() returned True
        
        if self.conditions == []:
            # Empty condition returns True by default
            return True
        
        if self.logic == AND:
            satisfied = True
        else:
            satisfied = False

        for cond in self.conditions:
            if isinstance(cond, (GRADECondition, WAMCondition)):
                # Special type of condition which can return warnings
                unlocked, warning = cond.validate(user)

                if warning != None:
                    warnings.append(warning)
            elif isinstance(cond, CompositeCondition):
                # Need to pass in the warnings list to collate all the warnings
                unlocked = cond.validate(user, warnings)
            else:
                unlocked = cond.validate(user)

            if self.logic == AND:
                satisfied = satisfied and unlocked
            else:
                satisfied = satisfied or unlocked

        return satisfied


def create_condition(tokens):
    '''
    The main wrapper for make_condition so we don't get 2 returns.
    Given the parsed logical tokens list (assuming starting and ending bracket),
    Returns the condition
    '''
    return make_condition(tokens)[0]

def make_condition(tokens):
    '''
    To be called by create_condition
    Given the parsed logical tokens list, (assuming starting and ending bracket),
    return the condition object and the index of that (sub) token list
    '''

    # Start off as a composite condition
    result = CompositeCondition()

    it = enumerate(tokens)
    for index, token in it:
        if token == '(':
            # Parse content in bracket 1 layer deeper
            sub_result, sub_index = make_condition(tokens[index + 1:])
            if sub_result == None:
                # Error. Return None
                return None, sub_index
            else:
                # Adjust the cur/rent position to scan the next token after this sub result
                result.add_condition(sub_result)
                [next(it) for _ in range(sub_index + 1)]
        elif token == ')':
            # End parsing and go up one layer
            return result, index
        elif token == "&&":
            # AND type logic
            result.set_logic(AND)
        elif token == "||":
            # OR type logic
            result.set_logic(OR)
        elif is_course(token):
            # Condition for a single course
            result.add_condition(CourseCondition(token))
        elif is_uoc(token):
            # Condition for UOC requirement
            uoc = get_uoc(token)
            uoc_cond = UOCCondition(uoc)

            if tokens[index + 1] == "in":
                # Create category according to the token after 'in'
                next(it)  # Skip "in" keyword

                # Get the category of the uoc condition
                category, sub_index = create_category(tokens[index + 2:])

                if category == None:
                    # Error. Return None. (Could also potentially set the uoc category
                    # to just the default Category which returns true and 1000 uoc taken)
                    return None, index
                else:
                    # Add the category to the uoc and adjust the current index position
                    uoc_cond.set_category(category)
                    [next(it) for _ in range(sub_index + 1)]

            result.add_condition(uoc_cond)
        elif is_wam(token):
            # Condition for WAM requirement
            wam = get_wam(token)
            wam_cond = WAMCondition(wam)

            if tokens[index + 1] == "in":
                # Create category according to the token after 'in'
                next(it)  # Skip "in" keyword
                category, sub_index = create_category(tokens[index + 2:])

                if category == None:
                    # If can't parse the category, return None(raise an error)
                    return None, index
                else:
                    # Add the category and adjust the current index position
                    wam_cond.set_category(category)
                    [next(it) for _ in range(sub_index + 1)]

            result.add_condition(wam_cond)
        elif is_grade(token):
            # Condition for GRADE requirement (mark in a single course)
            grade = get_grade(token)

            if tokens[index + 1] == "in":
                # Next token is "in" or else there has been an error
                next(it)  # Skip "in" keyword and course code
                next(it)

                result.add_condition(GRADECondition(grade, tokens[index + 2]))

                # NOTE: Don't need to create a category since I think grade ONLY applies to coursecode
                # grade_category, sub_index = create_category(tokens[index + 2:])
                # categories.append(grade_category)
            else:
                # Error
                return None, index
        elif is_program(token):
            result.add_condition(ProgramCondition(token))
        elif is_specialisation(token):
            result.add_condition(SpecialisationCondition(token))
        else:
            # Unmatched token. Error
            return None, index

    return result, index


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
    '''Given a text in the format of ???UOC, will extract the uoc and return as an int'''
    uoc_str = re.match(r'^(\d+)UOC$', text, flags=re.IGNORECASE).group(1)

    return int(uoc_str)


def is_wam(text):
    '''If the text is WAM'''
    if re.match(r'^\d+WAM$', text, flags=re.IGNORECASE):
        return True
    return False


def get_wam(text):
    '''Given a text in the format of ???WAM, will extract the wam and return as a int'''
    wam_str = re.match(r'^(\d+)WAM$', text, flags=re.IGNORECASE).group(1)

    return int(wam_str)


def is_grade(text):
    '''If the text is GRADE'''
    if re.match(r'^\d+GRADE$', text, flags=re.IGNORECASE):
        return True
    return False


def get_grade(text):
    '''Given a text in the format of ???GRADE, will extract the grade and return as a int'''
    grade_str = re.match(r'^(\d+)GRADE$', text, flags=re.IGNORECASE).group(1)

    return int(grade_str)


def is_program(text):
    '''Determines if the text is a program code'''
    if re.match(r'^\d{4}', text):
        return True
    return False


def is_specialisation(text):
    '''Determines if the text is a specialisation code'''
    if re.match(r'^[A-Z]{5}\d$', text, flags=re.IGNORECASE):
        return True
    return False


'''HELPER FUNCTIONS FOR UTILITY PURPOSES'''


def read_data(file_name):
    '''Reads data from a json file and returns it'''
    try:
        with open(file_name, "r") as input_file:
            return json.load(input_file)
    except:
        print(f"File {file_name} not found")
        sys.exit(1)
        

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
