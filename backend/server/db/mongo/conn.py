import os

import datetime
from typing import Union

from bson import CodecOptions
from bson.binary import UuidRepresentation

from pymongo import MongoClient
from pymongo.collection import Collection

from .col_types import GuestSessionInfoDict, NotSetupSessionInfoDict, NotSetupUserInfoDict, RefreshTokenInfoDict, SessionInfoDict, UserInfoDict

# Export these as needed
try:
    client: MongoClient = MongoClient(f'mongodb://{os.environ["MONGODB_USERNAME"]}:{os.environ["MONGODB_PASSWORD"]}@{os.environ["MONGODB_SERVICE_HOSTNAME"]}:27017')
    print('Connected to database.')
except:  # pylint: disable=bare-except
    print("Unable to connect to database.")
    exit(1)

db = client["Main"]
archivesDB = client["Archives"]
usersDB = client["Users"]

programsCOL = db["Programs"]
specialisationsCOL = db["Specialisations"]
coursesCOL = db["Courses"]

sessionsNewCOL: Collection[Union[NotSetupSessionInfoDict, SessionInfoDict, GuestSessionInfoDict]] = usersDB["sessionsNEW"].with_options(
    codec_options=CodecOptions(
        tz_aware=True,
        tzinfo=datetime.timezone.utc,
        uuid_representation=UuidRepresentation.STANDARD,
    ),
)

refreshTokensNewCOL: Collection[RefreshTokenInfoDict] = usersDB["refreshTokensNEW"].with_options(
    codec_options=CodecOptions(
        tz_aware=True,
        tzinfo=datetime.timezone.utc,
        uuid_representation=UuidRepresentation.STANDARD,
    )
)

usersNewCOL: Collection[Union[NotSetupUserInfoDict, UserInfoDict]] = usersDB["usersNEW"]
