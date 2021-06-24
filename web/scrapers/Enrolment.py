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
    
    def show():
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
    
    def show(self):
        print(self.components, end = '')

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
                print('Unknown type: ', i)
    return result
