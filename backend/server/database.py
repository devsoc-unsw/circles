'''Contains all the database and collection instances which can be exported to
other files. Also contains helper functions to read and write from db upon
initialisation'''
import sys
import json
from pymongo import MongoClient
from server.config import URI, FINAL_DATA_PATH


'''Export these as needed'''
client = MongoClient(URI)

db = client["Main"]
programsCOL = db["Programs"]
specialisationsCOL = db["Specialisations"]
coursesCOL = db["Courses"]


'''Helper functions'''
# Give it the collection name to overwrite: 'Programs', 'Specialisations', 'Courses'


def overwrite_collection(collection_name):
    file_name = FINAL_DATA_PATH + collection_name.lower() + "Processed.json"

    with open(file_name) as f:
        try:
            db[collection_name].drop()

            file_data = json.load(f)
            for key in file_data:
                db[collection_name].insert_one(file_data[key])

            print(f"Finished overwriting {collection_name}")
        except:
            print(f"Failed to load and overwrite {collection_name}")
