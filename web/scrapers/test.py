from Enrolment import *

# put selected Courses here
selectedCourses = ['MTRN2500', 'COMP1911']
# Text is the enrolmentRules
text = "(MATH1081 and (COMP1531 or COMP2041))"

cond = Condition()
cond.select(selectedCourses)

data = text.split()

data = parseRequirement(data)
data.show(True)
data = data.validate(cond)
print(data)
