"""Contains all the database and collection instances which can be exported to
other files. Also contains helper functions to read and write from db upon
initialisation.

NOTE: The helper functions must be run from the backend directory due to their paths
"""

from contextlib import suppress
import json
import os
from sys import exit
from wsgiref.validate import validator

from data.config import ARCHIVED_YEARS
from pymongo import MongoClient, errors

from server.config import ARCHIVED_DATA_PATH, FINAL_DATA_PATH

# Export these as needed
try:
    client: MongoClient = MongoClient(f'mongodb://{os.environ["MONGODB_USERNAME"]}:{os.environ["MONGODB_PASSWORD"]}@{os.environ["MONGODB_SERVICE_HOSTNAME"]}:27017')
    print('Connected to database.')
except: # pylint: disable=bare-except
    print("Unable to connect to database.")
    exit(1)

db = client["Main"]
programsCOL = db["Programs"]
specialisationsCOL = db["Specialisations"]
coursesCOL = db["Courses"]

archivesDB = client["Archives"]

usersDB = client["Users"]


def overwrite_collection(collection_name):
    """Overwrites the specific database via reading from the json files.
    Collection names can be: Programs, Specialisations, Courses"""
    file_name = FINAL_DATA_PATH + collection_name.lower() + "Processed.json"

    with open(file_name, encoding="utf8") as f:
        try:
            db[collection_name].drop()

            file_data = json.load(f)
            for key in file_data:
                db[collection_name].insert_one(file_data[key])

            print(f"Finished overwriting {collection_name}")
        except (KeyError, IOError, OSError):
            print(f"Failed to load and overwrite {collection_name}")


def overwrite_archives():
    """Overwrite all the archived data for all the years that we have archived"""
    for year in ARCHIVED_YEARS:
        file_name = ARCHIVED_DATA_PATH + str(year) + ".json"

        with open(file_name, encoding="utf8") as f:
            try:
                archivesDB[str(year)].drop()

                file_data = json.load(f)
                for key in file_data:
                    archivesDB[str(year)].insert_one(file_data[key])

                print(f"Finished overwriting {year} archive")
            except (KeyError, IOError, OSError):
                print(f"Failed to load and overwrite {year} archive")

def create_dynamic_db():
    usersDB.create_collection('users',
        validator={
            '$jsonSchema': {
                'bsonType': 'object',
                'required': ['degree', 'planner'],
                'properties': {
                    'degree': {
                        'bsonType': 'object',
                        'required': ['programCode', 'specs'],
                        'properties': {
                            'programCode': {
                                'bsonType': 'string',
                                'description': 'the code of program taken'
                            },
                            'specs': {
                                'bsonType': 'array',
                                'description': 'an array of all the specialisations taken',
                                'items': {
                                    'bsonType': 'string'
                                }
                            },
                        }
                    },
                    'planner': {
                        'bsonType': 'object',
                        'description': 'Set to default value',
                        'required': ['unplanned', 'startYear', 'numYears', 'isSummerEnabled', 'plan'],
                        'properties': {
                            "unplanned": {
                                'bsonType': 'array',
                                'items': {
                                    'bsonType': 'string'
                                }
                            },
                            "startYear": {
                                'bsonType': 'int'
                            },
                            "numYears": {
                                'bsonType': 'int'
                            },
                            "isSummerEnabled": {
                                'bsonType': 'bool'
                            },
                            "plan": {
                                'bsonType': 'array',
                                'items': {
                                    'bsonType': 'object',
                                    'required': ['T0', 'T1', 'T2', 'T3'],
                                    'properties': {
                                        'T0': {
                                            'bsonType': 'array',
                                            'items': {
                                                'bsonType': 'string'
                                            }
                                        },
                                        'T1': {
                                            'bsonType': 'array',
                                            'items': {
                                                'bsonType': 'string'
                                            }
                                        },
                                        'T2': {
                                            'bsonType': 'array',
                                            'items': {
                                                'bsonType': 'string'
                                            }
                                        },
                                        'T3': {
                                            'bsonType': 'array',
                                            'items': {
                                                'bsonType': 'string'
                                            }
                                        }
                                    }
                                }
                            },
                        }
                    }
                }
            }
        })
    usersDB.create_collection('tokens', validator={
        '$jsonSchema': {
            'bsonType': 'object',
            'required': ['token', 'objectId'],
            'properties': {
                'token': {
                    'description': 'token given by FE',
                    'bsonType': 'int'
                },
                'objectId': {
                    'description': 'objectId for the user object we are storing',
                    'bsonType': 'int'
                }
            }
        }
    })
    # example insertion
    # usersDB['users'].insert_one({
    #     'degree': {
    #         "programCode":"3778",
    #         "programName":"Computer Science",
    #         "specs":["COMPA1"]
    #     },
    #     'planner': {
    #         "unplanned":[],
    #         "startYear": 2021,
    #         "numYears": 4,
    #         "isSummerEnabled": False,
    #         "plan": [
    #             {
    #             "T0":[],
    #             "T1":["COMP1511"],
    #             "T2":["COMP1521"],
    #             "T3":["COMP1531"],
    #             }
    #         ],
    #     }
    # })

def overwrite_all():
    """Singular execution point to overwrite the entire database including the archives"""
    overwrite_collection("Courses")
    overwrite_collection("Specialisations")
    overwrite_collection("Programs")
    overwrite_archives()

def optionally_create_new_data():
    with suppress(errors.CollectionInvalid):
        create_dynamic_db()
