from json import dump
import json
import re

class Requirement:
    def __init__(self):
        return

    #default value is True
    def validate(self, Condition):
        return True
    
    def show(self, newLine = True):
        print('empty!')

class CourseRequirement(Requirement):
    def __init__(self, courseCode = None):
        self.components = courseCode

    def addComponent(self, newComponent):
        self.components = newComponent

    def validate(self, Condition):
        if self.components != None:
            satisfied = self.components in Condition.selected
        else:
            satisfied = True
        return satisfied
    
    def show(self, newLine = False):
        print(self.components, end = '')
        if newLine:
            print()

class WamRequirement(Requirement):
    def __init__(self, wam = None):
        self.components = 0

    def addComponent(self, newWam):
        self.components = newWam

    def validate(self, Condition):
        if self.components != None:
            satisfied = self.components >=Condition.Wam
        else:
            satisfied = True
        return satisfied
    
    def show(self, newLine = False):
        print('Wam:' + self.components, end = '')
        if newLine:
            print()

class CompositeRequirement(Requirement):
    def __init__(self):
        self.components = []
        self.type = 'and'

    def addComponent(self, newComponent):
        self.components.append(newComponent)

    # To or
    def switchType(self):
        self.type = 'or'

    def validate(self, Condition):
        if self.type == 'and':
            satisfied = True
            for c in self.components:
                satisfied = satisfied and c.validate(Condition)
        else:
            satisfied = False
            for c in self.components:
                satisfied = satisfied or c.validate(Condition)
        return satisfied
    
    def show(self, newLine = False):
        print('(', end = '')
        if self.components == []:
            pass
        elif self.type == 'and':
            satisfied = True
            for c in self.components[:-1]:
                c.show()
                print(' and', end = ' ')
            self.components[-1].show() 
        else:
            satisfied = False
            for c in self.components[:-1]:
                c.show()
                print(' or', end = ' ')     
            self.components[-1].show() 
        print(')', end = '')
        if newLine:
            print()
    
    def unitize(self):
        if len(self.components) == 0:
            return Requirement()
        if len(self.components) == 1:
            return self.components[0]
        return self

class UocRequirement(Requirement):
    # Does or condition exist?
    def __init__(self, uoc = 0, program = []):
        self.components = program
        self.uoc = uoc
    
    def validate(self, condition):
        pass

    # Can be used by validate or externally
    def getUoc(self):
        return self.uoc
        
    def show(self, newLine = False):
        print(self.uoc, 'UOC', end = '')
        if newLine:
            print()

# The field of methods for matching elements
def orLike(text):
    result = False
    if text.lower() == 'or':
        result = True
    if '|' in text:
        result = True
    return result

def andLike(text):
    result = False
    if text.lower() == 'and':
        result = True
    if '&' in text:
        result = True
    return result

def isCourse(text):
    if re.match("[a-zA-Z]{4}\s*\d{4}", text):
        return True
    return False

def isWam(text):
    pass

def getWam(text):
    pass

def pickCourses(text):
    pass

def isUoc(text):
    if 'UOC' in text:
        return True
    pass

def getUoc(text, ith = 0):
    return re.findall(r"(\d+)UOC", text)[ith]

def pickProgram(text):
    pass

dumping = []

#Not considering and or clauses wihtout parenthesis
def parseRequirement(text, elapsed = 0):
    result = CompositeRequirement()
    move = 0
    for index, i in enumerate(text):
        unmatched = True
        elapsed += 1
        #Skip the contents in the parenthesis
        if move > 0:
            continue
        #Parse the content int the bracket by calling a sub method
        if i == '(':
            unmatched = False
            subResult, move = parseRequirement(text[index + 1:], elapsed)
            result.addComponent(subResult)
            if move == -1:
                result = result.unitize()
                return result, -1
        #End this parsing method
        if i == ')':
            unmatched = False
            result = result.unitize()
            return result, elapsed
        if isCourse(i):
            unmatched = False
            result.addComponent(CourseRequirement(i))
        if isUoc(i):
            unmatched = False
            uoc = getUoc(i)
            program = []
            if 'by' in i or 'at' in i or 'of' in i:
                unmatched = True
            if ' in ' in i and 'course' in i and not 'WAM' in i:
                dumping.append(i)
                unmatched = json.dumps(dumping, sort_keys=True, indent=4, separators=(',', ':'))
                fp = open('in.json', "w", encoding='utf-8')
                fp.write(unmatched)
                fp.close()
                unmatched = True
            result.addComponent(UocRequirement(uoc, program))
            
        if orLike(i): 
            unmatched = False
            result.switchType()
        if andLike(i):
            unmatched = False
        if unmatched:
            print(i, 'Unmatched')
            return result, -1
    #Unitize befor any return
    result = result.unitize()
    return result, elapsed
    


'''
DATA WILL BE PREPROCESSED IN CONDITIONS:
- and/or/AND/OR --> && ||
- Enrolled in Software Engineering --> SENGAH
- Completing a Bachelor of Computer Science --> 3778
- Completion of 126UOC --> UOC 126
- Completion of 72UOC in Computer Science --> UOC 72 COMP
- MATH1141, MATH1151 with a mark of at least 75 --> GRADE 75 MATH1141, ||, GRADE 75 MATH1151 
- WAM of 75+ --> WAM 75
- Don't worry about exclusion courses
    
EXAMPLES
    "ACTL2101 and enrolment in program 3587",
--> [(, ACTL2021, &&, 3587, )]

    "ACCT1501 AND 65+ WAM or COMM1140  AND 65+ WAM",
--> [(, (, ACCT1501, &&, WAM 65, ), ||, ...)]

    "SENG1031 or COMP1531, and enrolment in a BE or BE(Hons) Software Engineering major.",
--> [(, SENG1031, ||, COMP1531, &&, SENGAH, )]


VALIDATE TAKES IN USERDATA DICTIONARY
.validate(userData)

- Courses the student has taken
- Specialisations the student is doing
- Program student is enrolled in
- other stuff
userData = {
    COMP1511: 1,
    COMP1521: 1,
    COMP1531: 1,
    SENGAH: 1,
    3707: 1,
    YEAR: 3,
    UOC: 126,
    WAM
}





Pickling later
'''
