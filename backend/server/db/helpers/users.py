from typing import Optional, Union

import pymongo
import pymongo.errors

from server.database import usersNewCOL
from .models import NotSetupUserStorage, UserCoursesStorage, UserDegreeStorage, UserPlannerStorage, UserStorage, YearTerm

# TODO: remove type ignores by constructing dictionaries properly

def get_user(uid: str) -> Optional[Union[NotSetupUserStorage, UserStorage]]:
    res = usersNewCOL.find_one({ 'uid': uid })
    if res is None:
        return res

    return UserStorage.parse_obj(res) if res["setup"] else NotSetupUserStorage.parse_obj(res)

def get_user_degree(uid: str) -> Optional[UserDegreeStorage]:
    # TODO: mayb do osmething funky with aggregate
    # TODO: figure out some error raising for when storage is not setup
    res = get_user(uid)
    return res.degree if res is not None and res.setup is True else None

def get_user_courses(uid: str) -> Optional[UserCoursesStorage]:
    # TODO: https://stackoverflow.com/questions/55762673/how-to-parse-list-of-models-with-pydantic
    res = get_user(uid)
    return res.courses if res is not None and res.setup is True else None

def get_user_planner(uid: str) -> Optional[UserPlannerStorage]:
    res = get_user(uid)
    return res.planner if res is not None and res.setup is True else None

def insert_new_user(uid: str, data: NotSetupUserStorage) -> bool:
    try:
        usersNewCOL.insert_one({
            "uid": uid,
            "guest": data.guest,
            "setup": False,
        })
        return True
    except pymongo.errors.DuplicateKeyError:
        # uid already existed
        return False

def reset_user(uid: str) -> bool:
    res = usersNewCOL.update_one(
        { "uid": uid },
        {
            "$unset": {
                "degree": "",
                "courses": "",
                "planner": "",
            },
            "$set": {
                "setup": False,
            },
        },
        upsert=False,
        hint="uidIndex",
    )

    return res.modified_count == 1

def set_user(uid: str, data: UserStorage, overwrite: bool = False) -> bool:
    if overwrite:
        # update/upsert
        res = usersNewCOL.update_one(
            { "uid": uid },
            {
                "$set": data.dict(include={ "degree", "courses", "planner", "setup" }),
                "$setOnInsert": {
                    # The fields that are usually immutable
                    "uid": uid,
                    "guest": data.guest,
                },
            },
            upsert=True,
            hint="uidIndex",
        )

        return res.modified_count == 1

    # just try insert
    try:
        usersNewCOL.insert_one(data.dict()) # type: ignore
        return True
    except pymongo.errors.DuplicateKeyError:
        # uid already existed
        return False

def update_user_degree(uid: str, data: UserDegreeStorage) -> bool:
    res = usersNewCOL.update_one(
        { "uid": uid, "setup": True },
        {
            "$set": {
                "degree": data.dict(),
            },
        },
        upsert=False,
        hint="uidIndex",
    )

    return res.modified_count == 1

def update_user_courses(uid: str, data: UserCoursesStorage) -> bool:
    res = usersNewCOL.update_one(
        { "uid": uid, "setup": True },
        {
            "$set": {
                "courses": { code: info.dict() for code, info in data.items() },
            },
        },
        upsert=False,
        hint="uidIndex",
    )

    return res.modified_count == 1

def update_user_planner(uid: str, data: UserPlannerStorage) -> bool:
    res = usersNewCOL.update_one(
        { "uid": uid, "setup": True },
        {
            "$set": {
                "planner": data.dict(),
            },
        },
        upsert=False,
        hint="uidIndex",
    )

    return res.modified_count == 1

def default_cs_user(_uid: str, guest: bool, start_year: int) -> UserStorage:
    # TODO: remove this later
    return UserStorage(
        guest=guest,
        courses={},
        planner=UserPlannerStorage(
            isSummerEnabled=False,
            lockedTerms={},
            mostRecentPastTerm=YearTerm(Y=0, T=0),
            startYear=start_year,
            unplanned=[],
            years=[]
        ),
        degree=UserDegreeStorage(
            isComplete=False,
            programCode="3778",
            specs=["COMPA1"],
        )
    )
