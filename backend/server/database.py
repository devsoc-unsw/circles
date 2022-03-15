"""Contains all the database and collection instances which can be exported to
other files. Also contains helper functions to read and write from db upon
initialisation.

NOTE: The helper functions must be run from the backend directory due to their paths
"""

import json
import os
from sys import exit

from data.config import ARCHIVED_YEARS
from pymongo import MongoClient

from server.config import ARCHIVED_DATA_PATH, FINAL_DATA_PATH

# Export these as needec
try:
    # client = MongoClient("mongodb://localhost:27017/")
    client = MongoClient(
        f'mongodb://{os.environ["MONGODB_USERNAME"]}:{os.environ["MONGODB_PASSWORD"]}@{os.environ["MONGODB_DATABASE"]}:27017'
    )
    print("Connected to database.")
except:
    print("Unable to connect to database.")
    exit(1)

db = client["Main"]
programsCOL = db["Programs"]
specialisationsCOL = db["Specialisations"]
coursesCOL = db["Courses"]

archivesDB = client["Archives"]


def overwrite_collection(collection_name):
    """Overwrites the specific database via reading from the json files.
    Collection names can be: Programs, Specialisations, Courses"""
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


def overwrite_archives():
    """Overwrite all the archived data for all the years that we have archived"""
    for year in ARCHIVED_YEARS:
        file_name = ARCHIVED_DATA_PATH + str(year) + ".json"

        with open(file_name) as f:
            try:
                archivesDB[str(year)].drop()

                file_data = json.load(f)
                for key in file_data:
                    archivesDB[str(year)].insert_one(file_data[key])

                print(f"Finished overwriting {year} archive")
            except:
                print(f"Failed to load and overwrite {year} archive")


def overwrite_all():
    """Singular execution point to overwrite the entire database including the archives"""
    overwrite_collection("Courses")
    overwrite_collection("Specialisations")
    overwrite_collection("Programs")
    overwrite_archives()
