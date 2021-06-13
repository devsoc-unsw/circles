# Scraping courses data and putting it inside coursesRaw.json
import Linking as nt
from Courses import *
import json

#data = runTheTest()
#print(data)

'''
data = getCourses()

data = nt.json2string(data)
nt.write(data, 'coursesRaw.json')


data = getCourseData()

data = nt.json2string(data)
nt.write(data, 'coursesProcessed.json')

data = getERList()

data = nt.json2string(data)
nt.write(data, 'enrolmentRules.json')
'''

data = getEnrolmentRules()

for i,v in enumerate(data):
    if v is None:
        continue
    if "enrolled in" in data[i]:
        data[i] = ""
    if "Enrolment in" in data[i]:
        data[i] = ""
    if "language placement approval" in data[i]:
        data[i] = ""
    if "Completed 72 UOC" in data[i]:
        data[i] = ""
    if "24 units of credit at Level 1" in data[i]:
        data[i] = ""
    if "96 unit of credits completed" in data[i]:
        data[i] = ""
    '''
    data[i] = data[i].replace('Completed 72 UOC', '')
    data[i] = data[i].replace('24 units of credit at Level 1', '')
    data[i] = data[i].replace('96 unit of credits completed', '')
    '''
    data[i] = data[i].strip()

old_data = data
data = []
for i,v in enumerate(old_data):
    if v is not None and v != "":
        data.append(v)

data = nt.json2string(data)
nt.write(data, 'enrolmentRules.json')