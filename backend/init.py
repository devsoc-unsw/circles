'''The central point from where we will initialise our data and servers. For now,
just make it dump data into a local mongo database'''

import sys
import json
import pymongo

#TODO: Set up proper env variables to share with javascript files
URI = 'mongodb://localhost:27017'

# Connect to the client, writing in:
# database - Main
# collections - Programs, Specialisations, Courses
client = pymongo.MongoClient(URI)
db = client['Main']
programs = db['Programs']
specialisations = db['Specialisations']
courses = db['Courses']

# Remove any pre-existing collections to overwrite them
programs.drop()
specialisations.drop()
courses.drop()

# Overwrite the collections
with open('./finalData/programsProcessed.json') as f:
    file_data = json.load(f)
    programs.insert_one(file_data)

with open('./finalData/specialisationsProcessed.json') as f:
    file_data = json.load(f)
    specialisations.insert_one(file_data)

with open('./finalData/coursesProcessed.json') as f:
    file_data = json.load(f)
    courses.insert_one(file_data)

print("Finished overwriting collections!")

client.close()





