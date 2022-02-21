'''
Contains the Conditions classes
'''
import json
from algorithms.objects.helper import is_course, is_program
from algorithms.objects.categories import AnyCategory


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


CACHED_PRGORAM_MAPPINGS_FILE = "./algorithms/cache/programMappings.json"
with open(CACHED_PRGORAM_MAPPINGS_FILE) as f:
    CACHED_PRGORAM_MAPPINGS = json.load(f)
    f.close()

class CourseCondition():
    '''Condition that the student has completed this course before the current term'''

    def __init__(self, course):
        self.course = course

    def get_course(self):
        return self.course

    def validate(self, user):
        '''Returns true if the user has taken this course before'''
        return user.has_taken_course(self.course)


class CoreqCoursesCondition():
    """Condition that the student has completed the course/s in or before the current term"""

    def __init__(self):
        # An example corequisite is [COMP1511 || COMP1521 || COMP1531]. The user
        # must have taken one of these courses either before or in the current term
        self.courses = []
        self.logic = AND # by default it'll be AND
    
    def add_course(self, course):
        self.courses.append(course)

    def set_logic(self, logic):
        self.logic = logic
    
    def validate(self, user):
        """Returns true if the user is taking these courses in the same term"""
        if self.logic == AND:
            return all(user.has_taken_course(course) or user.is_taking_course(course) for course in self.courses)
        elif self.logic == OR:
            return any(user.has_taken_course(course) or user.is_taking_course(course) for course in self.courses)
        
        # Error, logic should either be AND or OR
        print("Conditions Error: validation was not of type AND or OR")
        return True


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
        self.category = AnyCategory()

    def set_category(self, category_classobj):
        self.category = category_classobj

    def validate(self, user):
            return user.uoc(self.category) >= self.uoc

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
        self.category = AnyCategory()

    def set_category(self, category_classobj):
        self.category = category_classobj

    def validate(self, user):
        '''
        Determines if the user has met the WAM condition for this category.

        Will always return True and a warning since WAM can fluctuate
        '''
        return True, self.get_warning(user.wam(self.category))

    def get_warning(self, applicable_wam):
        '''Returns an appropriate warning message or None if not needed'''
        if type(self.category) is AnyCategory:
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
        return f"Requires {self.grade} mark in {self.course}. Your mark has not been recorded"

class ProgramCondition():
    '''Handles Program conditions such as 3707'''

    def __init__(self, program):
        self.program = program

    def validate(self, user):
        return user.in_program(self.program)

class ProgramTypeCondition():
    '''
    Handles program type conditions, which specify that your program has to be some collection of programs.\n
    for example - be enrolled in Actuarial studies implies that your program must be any one of a few programs (actl + double degree codes).\n
    '''
    def __init__(self, programType):
        self.programType = programType
    
    def validate(self, user):
        return user.program in CACHED_PRGORAM_MAPPINGS[self.programType]

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

    def is_unlocked(self, user) -> dict:
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




