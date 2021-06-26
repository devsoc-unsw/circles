from Enrolment import *
import json


# put selected Courses here
selectedCourses = ['COMP1531', 'MATH1081']
# Text is the enrolmentRules
text = "(MATH1081 and (COMP1531 or COMP2041))"

cond = Condition()
cond.select(selectedCourses)

'''
with open('./enrolmentRules.json') as f:
  dict = json.load(f)

for d in dict:
    data = d.split()
    data = parseRequirement(data)
    if bad:
        bad = False
        continue
    data.show(True)
'''

data = text.split()
data = parseRequirement(data)
data.show()
data = data.validate(cond)
print(data)
