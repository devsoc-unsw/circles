from Enrolment import *
import json


# put selected Courses here
selectedCourses = ['COMP1531', 'MATH1081']
# Text is the enrolmentRules
'''
text = "( MATH1081 and WAM75 and ( COMP1531 or COMP2041 ) )"
text = "( MATH1081 )"
text = ""
#Should return empty
text = "( ( ( ) ) )"
'''
f = open('../data/finalData/conditionsParsedLogic.json', 'rb')
data = json.load(f)
f.close()
unmatched = []

for i in data:
    result, errCode = parseRequirement(data[i])
    if errCode == -1:
        unmatched.append(i)
print(len(unmatched), "of", len(data), "Requirements unmatched")
unmatched = json.dumps(unmatched, sort_keys=True, indent=4, separators=(',', ':'))
fp = open('unmatched.json', "w", encoding='utf-8')
fp.write(unmatched)
fp.close()


'''
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