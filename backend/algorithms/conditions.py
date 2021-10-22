'''
Contains the User and Conditions classes as well as the function to create Conditions
from their logical tokens.
'''
import sys
import json
import re
import json

from .categories import *

'''Keywords'''
AND = 1
OR = 2

'''CACHED'''
# Load in cached exclusions
CACHED_EXCLUSIONS_PATH = "./algorithms/cache/exclusions.json"
with open(CACHED_EXCLUSIONS_PATH) as f:
    CACHED_EXCLUSIONS = json.load(f)
    f.close()

CACHED_CONDITIONS_TOKENS_PATH = "./data/finalData/conditionsTokens.json"
with open(CACHED_CONDITIONS_TOKENS_PATH) as f:
    CACHED_CONDITIONS_TOKENS = json.load(f)
    f.close()


# Load in cached condition objects
# NOTE: Does not work due to how pickle works with imports
# Instead, we will load the condition tokens, then load the necessary condition
# objects inside our functions
# CACHED_CONDITIONS_PATH = "./algorithms/conditions.pkl"
# with open(CACHED_CONDITIONS_PATH, "rb") as f:
#     CACHED_CONDITIONS = pickle.load(f)
#     f.close()


class User:
    '''A user and their data which will be used to determine if they can take a course'''

    def __init__(self, data=None):
        # Will load the data if any was given
        self.courses = {}
        self.program = None  # NOTE: For now this is only single degree
        self.specialisations = {}
        self.uoc = 0
        self.wam = None
        self.year = 0  # TODO

        if data != None:
            # Data was provided
            self.load_json(data)


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

    def load_json(self, data):
        '''Given the user data, correctly loads it into this user class'''
        
        self.program = data['program']
        self.specialisations = data['specialisations']
        self.courses = data['courses']
        self.year = data['year']

        '''calculate wam and uoc'''
        # Subtract uoc of the courses without mark when dividing
        uocfixer = 0
        for c in self.courses:
            self.uoc += self.courses[c][0]
            if type(self.courses[c][1]) != type(1):
                uocfixer += self.courses[c][0]
                continue
            if self.wam is None:
                self.wam = 0
            self.wam += self.courses[c][0] * self.courses[c][1]
        if self.wam is not None:
            self.wam /= (self.uoc - uocfixer)
        
        return

    def get_grade(self, course):
        '''Given a course which the student has taken, returns their grade (or None for no grade'''
        return self.courses[course][1]

    def update_wam_uoc(self):
        """Calculates and sets the overall wam and uoc of the user from their courses. 
        NOTE: This actually changes the user's wam, not simply a getter method"""
        if not self.courses:
            # No courses
            self.wam = None
            self.uoc = 0
            return
        
        total_wam = 0
        eligible_uoc = 0 # uoc which counts towards wam
        self.uoc = 0 # Resets the uoc
        for course, (uoc, grade) in self.courses.items():
            # Update the uoc as we go whils getting the total and eligible uoc
            self.uoc += uoc
            if total_wam is not None:
                eligible_uoc += uoc
                total_wam += uoc * grade
        
        if eligible_uoc == 0:
            self.wam = None
        else:
            # Divide to get the overall wam
            self.wam = total_wam / eligible_uoc


    def unselect_course(self, target, locked):
        """Given a course to unselect and a list of locked courses, remove the courses
        from the user and return a list of courses which would be affected by the unselection"""
        if not self.has_taken_course(target):
            # Nothing would be affected by unselecting this course since we never
            # took this course in the first place...
            return []

        # Load all the necessary conditions
        cached_conditions = {} # Mapping course to condition object
        for course in self.courses:
            if course in locked:
                # Do not bother creating condition for a locked course
                continue
            else:
                cached_conditions[course] = create_condition(CACHED_CONDITIONS_TOKENS[course], course)
                
        # First remove this course from our database (updating overall UOC and WAM)
        del self.courses[target]
        self.update_wam_uoc()

        affected_courses = []
        # Brute force loop through all courses and if we find a course which is
        # no longer unlocked, we unselect it, add it to the affected course list,
        # then restart loop.

        while True:
            for course in self.courses:
                if course in cached_conditions and cached_conditions[course] != None:
                    # The course is not locked and there exists a condition
                    cond = cached_conditions[course]
                    if (cond.is_unlocked(self))["result"] is False:
                        # This course is no longer selectable due to our unselection
                        affected_courses.append(course)
                        del self.courses[course]
                        self.update_wam_uoc()
                        break
            # Reaching this point means all the courses remaining are either locked
            # courses or can still be selected.
            break
        
        # return affected_courses.sort()
        return sorted(affected_courses)

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

    def validate(self, user, warnings=[]):
        '''A helper function to be called by is_unlocked. The purpose of separating
        them is for easy warning implementation'''
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


class FirstCompositeCondition(CompositeCondition):
    '''The highest level composite condition (the outermost one). This is given
    special treatment as this is the "entry point" to our algorithm'''
    def __init__(self, course=None, logic=AND):
        # The course which this condition applies to. Default value is None for testing purposes
        self.course = course 
        super().__init__()

    def is_unlocked(self, user):
        '''The highest level check which returns the result and a warning. Call this
        with the appropriate user data to determine if a course is unlocked or not.
        Will return an object containing the result and a list of warnings'''
        warnings = []
        
        if self.course is not None:
            result = {
                "result": False,
                "warnings": warnings
            }
            for exclusion in CACHED_EXCLUSIONS[self.course].keys():
                
                if is_course(exclusion) and user.has_taken_course(exclusion):
                    return result
                elif is_program(exclusion) and user.in_program(exclusion):
                    return result
                else:
                    # Not able to parse this type of  exclusion
                    continue
        
        unlocked = self.validate(user, warnings)
        
        return {
            "result": unlocked,
            "warnings": warnings
        }


def create_condition(tokens, course=None):
    '''
    The main wrapper for make_condition so we don't get 2 returns.
    Given the parsed logical tokens list (assuming starting and ending bracket),
    and optionally a course for which this condition applies to,
    Returns the condition
    '''
    return make_condition(tokens, True, course)[0]

def make_condition(tokens, first=False, course=None):
    '''
    To be called by create_condition
    Given the parsed logical tokens list, (assuming starting and ending bracket),
    return the condition object and the index of that (sub) token list
    '''

    # Everything is wrapped in a CompositeCondition
    if first == True:
        result = FirstCompositeCondition(course=course)
    else:
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
    if re.match(r'^\d{4}', text) or re.match(r'^[A-Z]{5}\d{5}', text):
        # Matches standard program codes such as 3707 and also co-op program codes
        # which we most likely won't be dealing with but I've included here so
        # it at least creates the condition object instead of erroring
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
    
