class Condition:
    def __init__(self):
        self.selected = []
        self.Program = []
        self.UoC = 0
        self.WaM = 0
        return
    
    def select(self, course):
        self.selected += course

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
        if self.type == 'and':
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

bad = False

#This function cannot work properly with more than one leading '('s
#The correct method is to add white spaces on the both side of parentheses and treat them seperately
#But the data source is simple and here's no such cases, so I remain the code unchanged
#At least it works well now
def parseRequirement(text, isCalled = False, tracedBack = False):
    result = Requirement()
    #If empty, always True
    if len(text) == 0:
        result = Requirement()
    #If only one element, simply add a CourseRequirement
    elif len(text) == 1:
        result = CourseRequirement(text[0])
    #Add a compositeRequirement instead
    else:
        result = CompositeRequirement()
        for index, i in enumerate(text):

            if tracedBack:
                if len(i) >= 9 and i[8] == ')':
                    tracedBack = False
                continue

            # Modify later to a more complicated condition
            if len(i) == 8:
                newCourse = CourseRequirement(i)
                result.addComponent(newCourse)
            elif len(i) >= 9:
                if i[0] == '(':
                    if isCalled:
                        newCourse = CourseRequirement(i[1:])
                        result.addComponent(newCourse)
                        isCalled = False
                    else:
                        result.addComponent(parseRequirement(text[index:], True))
                        tracedBack = True
                elif i[8] == ')':
                    newCourse = CourseRequirement(i[:8])
                    result.addComponent(newCourse)
                    return result
            elif orLike(i):
                result.switchType()
            elif andLike(i):
                pass
            else:
                bad = True
                return
                #print('Unknown type: ', i)
                # can print or log to error.txt so we can check what to fix

    return result

'''
comp2511_requirement_class.validate(userData) = True/False

Comp1511_Req_Object = parseRequirements("aklsdfjaksldfjklsadfkjasld")

comp1511_req.validate(userData)

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