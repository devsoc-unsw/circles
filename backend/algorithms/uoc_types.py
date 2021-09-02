'''Supporting classes for determining Requirements. These are not requirement
objects themselves.'''

import re


class UOCType:
    '''The base UOCType class from which more detailed UOC type classes stem from'''

    def __init__(self):
        return

    def same_type(self, key):
        '''Given a specific key, determine if this key belongs to this uoc type'''
        # Default value is true
        return True

    def uoc_taken(self, user):
        '''Given a user, returns the number of units they have taken for this uoc type'''
        # Default is 1000 to ensure requirement is always met on error
        return 1000

# class UOCTypeSpecialisation


class UOCTypeCourse(UOCType):
    '''A 4 letter course type, e.g. COMP, SENG, MATH, ENGG'''

    def __init__(self, code):
        self.code = code

    def same_type(self, key):
        if key.startswith(self.code):
            return True
        return False

    def uoc_taken(self, user):
        result = 0
        for course, uoc in user.courses.items():
            if re.match(rf'{self.code}\d{{4}}', course):
                result += uoc
        return result


def create_uoc_type(tokens, n_parsed=0):
    '''Given a list of tokens starting from after the connector keyword, create
    and return the uoc type object matching the type, as well as the current index
    of the token list.'''

    # At most we will only parse 1 or 2 tokens so no need for an iterator
    if re.match(r'^[A-Z]{4}$', tokens[0], flags=re.IGNORECASE):
        # Course type
        return UOCTypeCourse(tokens[0]), 0

    # TODO: Levels (e.g. L2 MATH, SPECIALISATIONS, PROGRAM)

    # Did not match any uoc_type condition. Return None and assume only 1 token
    # was matched on
    return None, 0
