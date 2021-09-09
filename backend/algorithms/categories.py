'''Supporting classes for Requirements which have some condition attached to a
specific cateogry'''

import re


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
        for course, uoc in user.courses.items():
            for course, (uoc, grade) in user.courses.items():
                if grade != None and re.match(rf'{self.code}\d{{4}}', course):
                    total_uoc += uoc
                    total_wam += uoc * grade

        # Either no courses matched this or no wam was entered for those courses
        if total_uoc == 0:
            return None

        return total_wam / total_uoc


def create_category(tokens):
    '''Given a list of tokens starting from after the connector keyword, create
    and return the category object matching the category, as well as the current index
    of the token list.'''

    # At most we will only parse 1 or 2 tokens so no need for an iterator
    if re.match(r'^[A-Z]{4}$', tokens[0], flags=re.IGNORECASE):
        # Course type
        return CourseCategory(tokens[0]), 0

    # TODO: Levels (e.g. L2 MATH, SPECIALISATIONS, PROGRAM)

    # Did not match any category. Return None and assume only 1 token was consumed
    return None, 0
