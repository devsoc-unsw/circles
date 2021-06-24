from Enrolment import *

cond = Condition()
cond.select('MTRN2500')
cond.select('COMP1911')
print(cond.selected)

text = "COMP1917 OR COMP1921 OR COMP1511 OR DPST1091 OR COMP1521 OR DPST1092 OR (COMP1911 AND MTRN2500)"

data = text.split()

data = parseRequirement(data)
data.show()
data = data.validate(cond)
print(data)