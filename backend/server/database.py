"""Contains all the database and collection instances which can be exported to
other files. Also contains helper functions to read and write from db upon
initialisation.

NOTE: The helper functions must be run from the backend directory due to their paths
"""

import datetime
import json
import os
from sys import exit
from typing import TypedDict, Union

from bson import CodecOptions

from data.config import ARCHIVED_YEARS
from pymongo import MongoClient
from pymongo.collection import Collection
from server.config import ARCHIVED_DATA_PATH, FINAL_DATA_PATH

class RefreshTokenInfoDict(TypedDict):
    token: str
    sid: str
    expiresAt: datetime.datetime

class SessionInfoOIDCInfoDict(TypedDict):
    accessToken: str
    refreshToken: str
    rawIdToken: str
    validatedIdToken: dict

class SessionInfoDict(TypedDict):
    sid: str
    uid: str
    currRefreshToken: str
    oidcInfo: SessionInfoOIDCInfoDict
    expiresAt: datetime.datetime

class NotSetupSessionInfoDict(TypedDict):
    sid: str
    uid: str
    expiresAt: datetime.datetime

# Export these as needed
try:
    client: MongoClient = MongoClient(f'mongodb://{os.environ["MONGODB_USERNAME"]}:{os.environ["MONGODB_PASSWORD"]}@{os.environ["MONGODB_SERVICE_HOSTNAME"]}:27017')
    print('Connected to database.')
except:  # pylint: disable=bare-except
    print("Unable to connect to database.")
    exit(1)

db = client["Main"]
programsCOL = db["Programs"]
specialisationsCOL = db["Specialisations"]
coursesCOL = db["Courses"]

archivesDB = client["Archives"]

usersDB = client["Users"]
sessionsNewCOL: Collection[Union[SessionInfoDict, NotSetupSessionInfoDict]] = usersDB["sessionsNEW"].with_options(
    codec_options=CodecOptions(
        tz_aware=True,
        tzinfo=datetime.timezone.utc
    )
)
refreshTokensNewCOL: Collection[RefreshTokenInfoDict] = usersDB["refreshTokensNEW"].with_options(
    codec_options=CodecOptions(
        tz_aware=True,
        tzinfo=datetime.timezone.utc
    )
)
usersNewCOL = usersDB["userNEW"]


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

def create_users_collection():
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
                    'courses': {
                        'bsonType': 'object',  # painful to validate properly :/
                    },
                    'planner': {
                        'bsonType': 'object',
                        'required': ['unplanned', 'startYear', 'isSummerEnabled', 'years'],
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
                            "isSummerEnabled": {
                                'bsonType': 'bool'
                            },
                            "years": {
                                'bsonType': 'array',
                                'items': {
                                    'bsonType': 'object',
                                    'properties': {
                                        "T0": {
                                            'bsonType': 'array',
                                            'items': {
                                                'bsonType': 'string'
                                            }
                                        },

                                        "T1": {
                                            'bsonType': 'array',
                                            'items': {
                                                'bsonType': 'string'
                                            }
                                        },

                                        "T2": {
                                            'bsonType': 'array',
                                            'items': {
                                                'bsonType': 'string'
                                            }
                                        },

                                        "T3": {
                                            'bsonType': 'array',
                                            'items': {
                                                'bsonType': 'string'
                                            }
                                        }
                                    }
                                },
                            }
                        }
                    }
                }
            }
        })

def create_tokens_collection():
    usersDB.create_collection('tokens', validator={
        '$jsonSchema': {
            'bsonType': 'object',
            'required': ['token', 'objectId'],
            'properties': {
                'token': {
                    'description': 'token given by FE',
                    'bsonType': 'string'
                },
                'objectId': {
                    'description': 'objectId for the user object we are storing',
                    'bsonType': 'objectId'
                }
            }
        }
    })

# TODO: add no extra keys, and ttls, and indexes
def create_new_users_collection():
    # users {
    #     uid! string,     // unique indexed, the uid we get back from the oidc
    #     info! object,    // extra info that we gather from oidc
    #     degree! { ... },
    #     courses! { ... },
    #     planner! { ... },
    # }
    usersDB.create_collection('usersNEW', validator={
        '$jsonSchema': {
            # 'oneOf': [
            #     {
                    'bsonType': 'object',
                    'required': ['uid', 'info', 'degree', 'planner', 'courses'],
                    'additionalProperties': False,
                    'properties': {
                        '_id': { 'bsonType': 'objectId' },
                        'uid': {
                            'bsonType': 'string',
                            'description': 'unique user id of the user'
                        },
                        'info': {
                            'bsonType': 'object',  # placeholder for future, not sure what this shape will be
                            'description': 'Any extra information gathered about the user, such as name'
                        },
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
                        'courses': {
                            'bsonType': 'object',  # painful to validate properly :/
                        },
                        'planner': {
                            'bsonType': 'object',
                            'required': ['unplanned', 'startYear', 'isSummerEnabled', 'years'],
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
                                "isSummerEnabled": {
                                    'bsonType': 'bool'
                                },
                                "years": {
                                    'bsonType': 'array',
                                    'items': {
                                        'bsonType': 'object',
                                        'properties': {
                                            "T0": {
                                                'bsonType': 'array',
                                                'items': {
                                                    'bsonType': 'string'
                                                }
                                            },

                                            "T1": {
                                                'bsonType': 'array',
                                                'items': {
                                                    'bsonType': 'string'
                                                }
                                            },

                                            "T2": {
                                                'bsonType': 'array',
                                                'items': {
                                                    'bsonType': 'string'
                                                }
                                            },

                                            "T3": {
                                                'bsonType': 'array',
                                                'items': {
                                                    'bsonType': 'string'
                                                }
                                            }
                                        }
                                    },
                                }
                            }
                        }
                    }
            #     }
            # ]
        }
    })

def create_new_refresh_tokens_collection():
    # refreshTokens {
    #     tok! string,     // unique indexed
    #     sid! uuid,       // indexed
    #     expiresAt! Date, // ttl indexed // TODO: make this proper with a ttl
    # }
    usersDB.create_collection('refreshTokensNEW', validator={
        '$jsonSchema': {
            'bsonType': 'object',
            'required': ['token', 'sid', 'expiresAt'],
            'additionalProperties': False,
            'properties': {
                '_id': { 'bsonType': 'objectId' },
                'token': {
                    'description': 'The refresh token associated with a user session',
                    'bsonType': 'string',
                },
                'sid': {
                    'description': 'Session ID',
                    'bsonType': 'string', # TODO: make into a UUID
                },
                'expiresAt': {
                    'description': 'Expiry time of this refresh token document',
                    'bsonType': 'date',
                },
            }
        }
    })

    usersDB['refreshTokensNEW'].create_index("expiresAt", expireAfterSeconds=0)
    usersDB['refreshTokensNEW'].create_index("token", unique=True)
    usersDB['refreshTokensNEW'].create_index("sid")

def create_new_sessions_collection():
    # sessions {
    #     sid! uuid,       // unique indexed
    #     uid! string,     // index on if we dont have the reverse lookup
    #     oidcInfo? {
    #         access_token string         # most recent access token
    #         raw_id_token string         # most recent id token string
    #         refresh_token string        # most recent refresh token
    #         validated_id_token: object  # most recent valid id token object,
    #     },
    #     currRefTok? string,
    #     expiresAt! Date, // ttl indexed (should be same as the currRefTok expiry time, or +1 day)
    # }
    usersDB.create_collection('sessionsNEW', validator={
        '$jsonSchema': {
            'oneOf': [
                {
                    'bsonType': 'object',
                    'required': ['sid', 'uid', 'currRefreshToken', 'oidcInfo', 'expiresAt'],
                    'additionalProperties': False,
                    'properties': {
                        '_id': { 'bsonType': 'objectId' },
                        'sid': {
                            'description': 'Session ID',
                            'bsonType': 'string', # TODO: make into a UUID
                        },
                        'uid': {
                            'description': 'User ID',
                            'bsonType': 'string',
                        },
                        'currRefreshToken': {
                            'description': 'For protection against replay attacks',
                            'bsonType': 'string',
                        },
                        'oidcInfo': {
                            'description': 'The required oidc tokens for refreshing',
                            'bsonType': 'object',
                            'required': ['accessToken', 'refreshToken', 'rawIdToken', 'validatedIdToken'],
                            'additionalProperties': False,
                            'properties': {
                                'accessToken': { 'bsonType': 'string' },
                                'refreshToken': { 'bsonType': 'string' },
                                'rawIdToken': { 'bsonType': 'string' },
                                'validatedIdToken': { 'bsonType': 'object' },
                            },
                        },
                        'expiresAt': {
                            'description': 'Expiry time of this session document',
                            'bsonType': 'date',  # TODO: make an actual ttl
                        },
                    },
                },
                {
                    'bsonType': 'object',
                    'required': ['sid', 'uid', 'expiresAt'],
                    'additionalProperties': False,
                    'properties': {
                        '_id': { 'bsonType': 'objectId' },
                        'sid': {
                            'description': 'Session ID',
                            'bsonType': 'string', # TODO: make into a UUID
                        },
                        'uid': {
                            'description': 'User ID',
                            'bsonType': 'string',
                        },
                        'expiresAt': {
                            'description': 'Expiry time of this session document',
                            'bsonType': 'date',  # TODO: make an actual ttl
                        },
                    },
                },
            ]
        }
    })

    usersDB['sessionsNEW'].create_index("expiresAt", expireAfterSeconds=0)
    usersDB['sessionsNEW'].create_index("sid", unique=0)
    usersDB['sessionsNEW'].create_index("uid")

def create_dynamic_db(drop_old: bool):
    if drop_old:
        print("Dropping user collections")
        usersDB.drop_collection('users')
        usersDB.drop_collection('tokens')
        usersDB.drop_collection('usersNEW')
        usersDB.drop_collection('refreshTokensNEW')
        usersDB.drop_collection('sessionsNEW')

    create_users_collection()
    create_tokens_collection()
    create_new_users_collection()
    create_new_refresh_tokens_collection()
    create_new_sessions_collection()
    print("Finished creating user database")
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
    # TODO: DO NOT DROP OLD COLLECTIONS IN PROD
    create_dynamic_db(drop_old=True)
