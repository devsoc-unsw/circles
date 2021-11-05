'''Supporting classes for Requirements which have some condition attached to a
specific cateogry'''

import re
import json

# Preload the mappings to school and faculty
CACHED_MAPPINGS = {}

with open("./algorithms/cache/courseMappings.json") as f:
    CACHED_MAPPINGS = json.load(f)
    f.close()


class Category:
    '''The base Category class from which more detailed Category classes stem from'''

    def __init__(self):
        return

    def uoc(self, user):
        '''Given a user, returns the number of units they have taken for this uoc category'''
        # Default is 1000 to ensure requirement is always met on error
        return 1000

    def wam(self, user):
        '''Given a user, returns the wam they have for this category)'''
        # Default is None
        return None


class CourseCategory(Category):
    '''A 4 letter course category, e.g. COMP, SENG, MATH, ENGG'''

    def __init__(self, code):
        self.code = code

    def uoc(self, user):
        '''The number of uoc belonging to courses matching the code'''
        result = 0
        for course, (uoc, grade) in user.courses.items():
            if re.match(rf'{self.code}\d{{4}}', course):
                result += uoc
        return result

    def wam(self, user):
        '''The wam of courses matching the code or None if no wams were entered
        or no courses matched'''
        total_wam = 0
        total_uoc = 0
        for course, (uoc, grade) in user.courses.items():
            if grade != None and re.match(rf'{self.code}\d{{4}}', course):
                total_uoc += uoc
                total_wam += uoc * grade

        # Either no courses matched this or no wam was entered for those courses
        if total_uoc == 0:
            return None

        return total_wam / total_uoc


class LevelCategory(Category):
    '''A simple level category. e.g. L2'''

    def __init__(self, level):
        # A number representing the level
        self.level = level

    def uoc(self, user):
        '''The number of uoc belonging to the courses matching the level'''
        result = 0
        for course, (uoc, grade) in user.courses.items():
            if course[4] == str(self.level):
                result += uoc
        return result

    def wam(self, user):
        '''The wam of courses matching the level or None if no wams were entered or
        no courses matched'''
        total_wam = 0
        total_uoc = 0
        for course, (uoc, grade) in user.courses.items():
            if grade != None and course[4] == str(self.level):
                total_uoc += uoc
                total_wam += uoc * grade

        # Either no courses matched this level or no wam was entered for those courses
        if total_uoc == 0:
            return None

        return total_wam / total_uoc


class LevelCourseCategory(Category):
    '''A level category for a certain type of course (e.g. L2 MATH)'''

    def __init__(self, level, code):
        # A number representing the level
        self.level = level

        # A 4 letter course code
        self.code = code

    def uoc(self, user):
        '''The number of uoc belonging to the courses matching the code and the level'''
        result = 0
        for course, (uoc, grade) in user.courses.items():
            if re.match(rf'{self.code}\d{{4}}', course) and course[4] == str(self.level):
                # The first 4 letters match the code and the level is correct:
                result += uoc
        
        return result

    def wam(self, user):
        '''The wam of courses matching the code and level or None if no wams were entered
        or no courses matched'''
        total_wam = 0
        total_uoc = 0
        for course, (uoc, grade) in user.courses.items():
            if grade != None and re.match(rf'{self.code}\d{{4}}', course) and course[4] == str(self.level):
                # There exists a grade and the first 4 letters match the code and the level is correct
                total_uoc += uoc
                total_wam += uoc * grade

        # Either no courses matched this or no wam was entered for those courses
        if total_uoc == 0:
            return None

        return total_wam / total_uoc


class SchoolCategory(Category):
    '''Category for courses belonging to a school (e.g. S Mech)'''
    def __init__(self, school):
        self.school = school # The code for the school (S Mech)

    def uoc(self, user):
        """The number of uoc belonging to courses in this school"""
        result = 0
        for course, (uoc, grade) in user.courses.items():
            if course in CACHED_MAPPINGS[self.school]:
                result += uoc
        
        return result
    

    def wam(self, user):
        """The overall wam belongining to courses in this school"""
        total_wam = 0
        total_uoc = 0
        for course, (uoc, grade) in user.courses.items():
            if course in CACHED_MAPPINGS[self.school]:
                if grade != None:
                    total_uoc += uoc
                    total_wam += uoc * grade
        
        if total_uoc == 0:
            return None

        return total_wam / total_uoc

class FacultyCategory(Category):
    '''Category for courses belonging to a faculty (e.g. F Business)'''
    def __init__(self, faculty):
        self.faculty = faculty # The code for the faculty (F Business)

    def uoc(self, user):
        """The number of uoc belonging to courses in this faculty"""
        result = 0
        for course, (uoc, grade) in user.courses.items():
            if course in CACHED_MAPPINGS[self.faculty]:
                result += uoc
        
        return result
    

    def wam(self, user):
        """The overall wam belongining to courses in this faculty"""
        total_wam = 0
        total_uoc = 0
        for course, (uoc, grade) in user.courses.items():
            if course in CACHED_MAPPINGS[self.faculty]:
                if grade != None:
                    total_uoc += uoc
                    total_wam += uoc * grade
        
        if total_uoc == 0:
            return None

        return total_wam / total_uoc


def create_category(tokens):
    '''Given a list of tokens starting from after the connector keyword, create
    and return the category object matching the category, as well as the current index
    of the token list.'''

    # At most we will only parse 1 or 2 tokens so no need for an iterator
    # NOTE: There will always be at least 2 tokens due to a closing ")" bracket
    # so it is safe to check tokens[1]
    if re.match(r'^[A-Z]{4}$', tokens[0], flags=re.IGNORECASE):
        # Course type
        return CourseCategory(tokens[0]), 0
    elif re.match(r'^L[0-9]$', tokens[0], flags=re.IGNORECASE):
        # Level category. Get the level, then determine next token if there is one
        level = int(re.match(r'^L([0-9])$', tokens[0],
                    flags=re.IGNORECASE).group(1))

        if re.match(r'^[A-Z]{4}$', tokens[1], flags=re.IGNORECASE):
            # Level Course Category. e.g. L2 MATH
            course_code = re.match(r'^([A-Z]{4})$', tokens[1], flags=re.IGNORECASE).group(1)

            return LevelCourseCategory(level, course_code), 1
        else:
            # There are no tokens after this. Simple level category
            return LevelCategory(level), 0
    elif re.match(r'^S$', tokens[0], flags = re.IGNORECASE):
        # School category
        return SchoolCategory(f"{tokens[0]} {tokens[1]}"), 1
    elif re.match(r'^F$', tokens[0], flags=re.IGNORECASE):
        # Faculty category
        return FacultyCategory(f"{tokens[0]} {tokens[1]}"), 1

    # TODO: Levels (e.g. SPECIALISATIONS, PROGRAM)

    # Did not match any category. Return None and assume only 1 token was consumed
    return None, 0
