"""Contains all the database and collection instances which can be exported to
other files. Also contains helper functions to read and write from db upon
initialisation.

NOTE: The helper functions must be run from the backend directory due to their paths
"""

import json

from server.config import ARCHIVED_DATA_PATH, FINAL_DATA_PATH
from data.config import ARCHIVED_YEARS

from .conn import db, archivesDB, usersDB

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
            'oneOf': [
                {
                    'bsonType': 'object',
                    'required': ['uid', 'setup', 'guest'],
                    'additionalProperties': False,
                    'properties': {
                        '_id': { 'bsonType': 'objectId' },
                        'uid': {
                            'bsonType': 'string',
                            'description': 'unique user id of the user'
                        },
                        'setup': { 'enum': [False] },
                        'guest': { 'bsonType': 'bool' },
                    }
                },
                {
                    'bsonType': 'object',
                    'required': ['uid', 'setup', 'guest', 'degree', 'planner', 'courses'],
                    'additionalProperties': False,
                    'properties': {
                        '_id': { 'bsonType': 'objectId' },
                        'uid': {
                            'bsonType': 'string',
                            'description': 'unique user id of the user'
                        },
                        'setup': { 'enum': [True] },
                        'guest': { 'bsonType': 'bool' },
                        'degree': {
                            'bsonType': 'object',
                            'required': ['programCode', 'specs', 'isComplete'],
                            'additionalProperties': False,
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
                                'isComplete': {
                                    'bsonType': 'bool',
                                    'description': 'Whether their degree is complete',
                                }
                            }
                        },
                        'courses': {
                            'bsonType': 'object',
                            'description': 'an object of CourseCode -> CourseInformation mapping',
                            'properties': {},
                            'additionalProperties': {
                                'bsonType': 'object',
                                'required': ['code', 'suppressed', 'mark', 'uoc', 'ignoreFromProgression'],
                                'additionalProperties': False,
                                'properties': {
                                    'code': {
                                        'bsonType': 'string',
                                        'description': 'Course code repeated',
                                    },
                                    'suppressed': {
                                        'bsonType': 'bool',
                                        'description': 'Whether or not the warnings are suppressed',
                                    },
                                    'mark': {
                                        'oneOf': [
                                            { 'enum': ['SY', 'FL', 'PS', 'CR', 'DN', 'HD'] },
                                            { 'bsonType': ['int', 'null'] },
                                        ],
                                        'description': 'Mark entered for this course'
                                    },
                                    'uoc': {
                                        'bsonType': 'int',
                                        'description': 'UOC of this course',
                                    },
                                    'ignoreFromProgression': {
                                        'bsonType': 'bool',
                                        'description': 'Whether the course is ignored from progression checking',
                                    }
                                }
                            }
                        },
                        'planner': {
                            'bsonType': 'object',
                            'required': ['unplanned', 'startYear', 'isSummerEnabled', 'mostRecentPastTerm', 'years', 'lockedTerms'],
                            'additionalProperties': False,
                            'properties': {
                                'lockedTerms': {
                                    'bsonType': 'object',
                                    'properties': {},
                                    'additionalProperties': { 'bsonType': 'bool' },
                                    'description': 'A map of <YEAR><TERM> -> boolean of which terms are locked. Example: 2024T1 -> True',
                                },
                                'mostRecentPastTerm': {
                                    'bsonType': 'object',
                                    'required': ['Y', 'T'],
                                    'additionalProperties': False,
                                    'properties': {
                                        'Y': { 'bsonType': 'int' },
                                        'T': { 'bsonType': 'int' },
                                    },
                                    'description': 'Used for planner validation?!'
                                },
                                'unplanned': {
                                    'bsonType': 'array',
                                    'items': {
                                        'bsonType': 'string'
                                    }
                                },
                                'startYear': {
                                    'bsonType': 'int'
                                },
                                'isSummerEnabled': {
                                    'bsonType': 'bool'
                                },
                                'years': {
                                    'bsonType': 'array',
                                    'items': {
                                        'bsonType': 'object',
                                        'required': ['T0', 'T1', 'T2', 'T3'],
                                        'additionalProperties': False,
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
                                    },
                                }
                            }
                        }
                    }
                }
            ]
        }
    })

    usersDB['usersNEW'].create_index("uid", unique=True, name="uidIndex")

    # TODO: add later when we actually have a use for it, otherwise right now its just added pain
    # 'info': {
    #     'bsonType': 'object',  # placeholder for future, not sure what this shape will be
    #     'description': 'Any extra information gathered about the user, such as name'
    # },

def create_new_refresh_tokens_collection():
    # refreshTokens {
    #     tok! string,     // unique indexed
    #     sid! uuid,       // indexed
    #     expiresAt! Date, // ttl indexed
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
                    'description': 'Session ID - UUID',
                    'bsonType': 'binData',
                },
                'expiresAt': {
                    'description': 'Expiry time of this refresh token document',
                    'bsonType': 'date',
                },
            }
        }
    })

    usersDB['refreshTokensNEW'].create_index("expiresAt", expireAfterSeconds=0)
    usersDB['refreshTokensNEW'].create_index("token", unique=True, name="tokenIndex")
    usersDB['refreshTokensNEW'].create_index("sid", name="sidIndex")

def create_new_sessions_collection():
    # sessions {
    #     sid! uuid,       // unique indexed
    #     uid! string,     // index on if we dont have the reverse lookup
    #     expiresAt! Date, // ttl indexed (should be same as the currRefTok expiry time, or +1 day)
    #     type! notsetup | csesoc | guest,
    #     currRefTok? string,
    #     oidcInfo? {
    #         access_token string         # most recent access token
    #         raw_id_token string         # most recent id token string
    #         refresh_token string        # most recent refresh token
    #         validated_id_token: object  # most recent valid id token object,
    #     },
    # }
    usersDB.create_collection('sessionsNEW', validator={
        '$jsonSchema': {
            'oneOf': [
                {
                    'bsonType': 'object',
                    'required': ['sid', 'uid', 'currRefreshToken', 'oidcInfo', 'expiresAt', 'type'],
                    'additionalProperties': False,
                    'properties': {
                        '_id': { 'bsonType': 'objectId' },
                        'sid': {
                            'description': 'Session ID - UUID',
                            'bsonType': 'binData',
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
                            'bsonType': 'date',
                        },
                        'type': { 'enum': ['csesoc'] },
                    },
                },
                {
                    'bsonType': 'object',
                    'required': ['sid', 'uid', 'currRefreshToken', 'expiresAt', 'type'],
                    'additionalProperties': False,
                    'properties': {
                        '_id': { 'bsonType': 'objectId' },
                        'sid': {
                            'description': 'Session ID - UUID',
                            'bsonType': 'binData',
                        },
                        'uid': {
                            'description': 'User ID',
                            'bsonType': 'string',
                        },
                        'currRefreshToken': {
                            'description': 'For protection against replay attacks',
                            'bsonType': 'string',
                        },
                        'expiresAt': {
                            'description': 'Expiry time of this session document',
                            'bsonType': 'date',
                        },
                        'type': { 'enum': ['guest'] },
                    },
                },
                {
                    'bsonType': 'object',
                    'required': ['sid', 'uid', 'expiresAt', 'type'],
                    'additionalProperties': False,
                    'properties': {
                        '_id': { 'bsonType': 'objectId' },
                        'sid': {
                            'description': 'Session ID - UUID',
                            'bsonType': 'binData',
                        },
                        'uid': {
                            'description': 'User ID',
                            'bsonType': 'string',
                        },
                        'expiresAt': {
                            'description': 'Expiry time of this session document',
                            'bsonType': 'date',
                        },
                        'type': { 'enum': ['notsetup'] },
                    },
                },
            ]
        }
    })

    usersDB['sessionsNEW'].create_index("expiresAt", expireAfterSeconds=0)
    usersDB['sessionsNEW'].create_index("sid", unique=True, name="sidIndex")
    usersDB['sessionsNEW'].create_index("uid", name="uidIndex")

def overwrite_main_collection(collection_name):
    """Overwrites the specific core database via reading from the json files.
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
    """Singular execution point to overwrite the entire main database including the archives"""
    overwrite_main_collection("Courses")
    overwrite_main_collection("Specialisations")
    overwrite_main_collection("Programs")
    overwrite_archives()

def optionally_create_new_data():
    # TODO: DO NOT DROP OLD COLLECTIONS IN PROD
    create_dynamic_db(drop_old=True)
