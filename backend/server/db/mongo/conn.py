import os

import datetime
from typing import Union

from bson import CodecOptions
from bson.binary import UuidRepresentation

from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.database import Database

from .col_types import GuestSessionInfoDict, NotSetupSessionInfoDict, NotSetupUserInfoDict, RefreshTokenInfoDict, SessionInfoDict, UserInfoDict

db: Database
archivesDB: Database
usersDB: Database

programsCOL: Collection
specialisationsCOL: Collection
coursesCOL: Collection

sessionsNewCOL: Collection[Union[NotSetupSessionInfoDict, SessionInfoDict, GuestSessionInfoDict]]
refreshTokensNewCOL: Collection[RefreshTokenInfoDict]
usersNewCOL: Collection[Union[NotSetupUserInfoDict, UserInfoDict]]

def connect():
    try:
        client: MongoClient = MongoClient(f'mongodb://{os.environ["MONGODB_USERNAME"]}:{os.environ["MONGODB_PASSWORD"]}@{os.environ["MONGODB_SERVICE_HOSTNAME"]}:27017')
        print('Connected to mongo database.', client["Main"].command("ping"))

        # setup global variables
        global db, archivesDB, usersDB, programsCOL, specialisationsCOL, coursesCOL, sessionsNewCOL, refreshTokensNewCOL, usersNewCOL
        db = client["Main"]
        archivesDB = client["Archives"]
        usersDB = client["Users"]

        programsCOL = db["Programs"]
        specialisationsCOL = db["Specialisations"]
        coursesCOL = db["Courses"]

        sessionsNewCOL = usersDB["sessionsNEW"].with_options(
            codec_options=CodecOptions(
                tz_aware=True,
                tzinfo=datetime.timezone.utc,
                uuid_representation=UuidRepresentation.STANDARD,
            ),
        )

        refreshTokensNewCOL = usersDB["refreshTokensNEW"].with_options(
            codec_options=CodecOptions(
                tz_aware=True,
                tzinfo=datetime.timezone.utc,
                uuid_representation=UuidRepresentation.STANDARD,
            )
        )

        usersNewCOL = usersDB["usersNEW"]
    except:  # pylint: disable=bare-except
        print("Unable to connect to mongo database.")
        exit(1)

connect()
