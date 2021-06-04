# Scraping courses data and putting it inside coursesRaw.json
import Linking as nt
from Courses import *
import json

#data = runTheTest()
#print(data)


data = getCourses()

data = nt.json2string(data)
nt.write(data, 'coursesRaw.json')


data = getCourseData()

data = nt.json2string(data)
nt.write(data, 'coursesProcessed.json')


data = getERList()

data = nt.json2string(data)
nt.write(data, 'enrolmentRules.json')
