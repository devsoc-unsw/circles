from Enrolment import *
import json


# put selected Courses here
selectedCourses = ['COMP1531', 'MATH1081']
# Text is the enrolmentRules
text = "( MATH1081 and WAM75 and ( COMP1531 or COMP2041 ) )"
text = "( MATH1081 )"
text = ""
#Should return empty
text = "( ( ( ) ) )"


cond = Condition()
cond.select(selectedCourses)


data = text.split()
data, errCode = parseRequirement(data)
if errCode == -1:
    data.show()
else:
    data.show()
    data = data.validate(cond)
    print(data)




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