'''Supporting classes for determining conditions. These are not requirement
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
        

# class UOCTypeSpecialisation

class UOCTypeCourse(UOCType):
    '''A 4 letter course type, e.g. COMP, SENG, MATH, ENGG'''
    def __init__(self, code):
        self.code = code
    
    def same_type(self, key):
        