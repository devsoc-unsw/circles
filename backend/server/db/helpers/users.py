from typing import Optional, Union

import pymongo
import pymongo.errors

from server.db.mongo.conn import usersNewCOL

from .models import NotSetupUserStorage, PartialUserStorage, UserCoursesStorage, UserDegreeStorage, UserPlannerStorage, UserStorage, YearTerm

# TODO-OLLI: remove type ignores by constructing dictionaries properly

def get_user(uid: str) -> Optional[Union[NotSetupUserStorage, UserStorage]]:
    res = usersNewCOL.find_one({ 'uid': uid })
    if res is None:
        return res

    return UserStorage.model_validate(res) if res["setup"] else NotSetupUserStorage.model_validate(res)

def get_user_degree(uid: str) -> Optional[UserDegreeStorage]:
    res = get_user(uid)
    return res.degree if res is not None and res.setup is True else None

def get_user_courses(uid: str) -> Optional[UserCoursesStorage]:
    res = get_user(uid)
    return res.courses if res is not None and res.setup is True else None

def get_user_planner(uid: str) -> Optional[UserPlannerStorage]:
    res = get_user(uid)
    return res.planner if res is not None and res.setup is True else None

def user_is_setup(uid: str) -> bool:
    res = usersNewCOL.find_one({ 'uid': uid, 'setup': { "$eq": True } })
    return res is not None

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

    return res.matched_count == 1

def set_user(uid: str, data: UserStorage, overwrite: bool = False) -> bool:
    if overwrite:
        # update/upsert
        res = usersNewCOL.update_one(
            { "uid": uid },
            {
                "$set": data.model_dump(include={ "degree", "courses", "planner", "setup" }),
                "$setOnInsert": {
                    # The fields that are usually immutable
                    "uid": uid,
                    "guest": data.guest,
                },
            },
            upsert=True,
            hint="uidIndex",
        )

        return res.matched_count == 1

    # just try insert
    try:
        usersNewCOL.insert_one(data.model_dump()) # type: ignore
        return True
    except pymongo.errors.DuplicateKeyError:
        # uid already existed
        return False

def update_user_degree(uid: str, data: UserDegreeStorage) -> bool:
    res = usersNewCOL.update_one(
        { "uid": uid, "setup": True },
        {
            "$set": {
                "degree": data.model_dump(),
            },
        },
        upsert=False,
        hint="uidIndex",
    )

    return res.matched_count == 1

def update_user_courses(uid: str, data: UserCoursesStorage) -> bool:
    res = usersNewCOL.update_one(
        { "uid": uid, "setup": True },
        {
            "$set": {
                "courses": { code: info.model_dump() for code, info in data.items() },
            },
        },
        upsert=False,
        hint="uidIndex",
    )

    return res.matched_count == 1

def update_user_planner(uid: str, data: UserPlannerStorage) -> bool:
    res = usersNewCOL.update_one(
        { "uid": uid, "setup": True },
        {
            "$set": {
                "planner": data.model_dump(),
            },
        },
        upsert=False,
        hint="uidIndex",
    )

    return res.matched_count == 1

def update_user(uid: str, data: PartialUserStorage) -> bool:
    # updates certain properties of the user
    # if enough are given, declares it as setup
    payload = {
        k: v
        for k, v
        in data.model_dump(
            include={ "courses", "degree", "planner" }, 
            exclude_unset=True,
        ).items()
        if v is not None  # cannot exclude_none since subclasses use None
    }

    if len(payload) == 0:
        # most semantically correct
        # print("++ empty update payload")
        return user_is_setup(uid)

    if "courses" in payload and "degree" in payload and "planner" in payload:
        # enough to declare user as setup
        # print("++ full payload")
        payload["setup"] = True

    res = usersNewCOL.update_one(
        { "uid": uid, "setup": True } if "setup" not in payload else { "uid": uid },
        { "$set": payload },
        upsert=False,
        hint="uidIndex",
    )

    return res.matched_count == 1

def delete_user(uid: str) -> bool:
    res = usersNewCOL.delete_one(
        { "uid": uid },
        hint="uidIndex",
    )

    return res.deleted_count == 1

def _default_cs_user(guest: bool, start_year: int) -> UserStorage:
    # TODO-OLLI(pm): remove this later
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
            programCode="3778",
            specs=["COMPA1"],
        )
    )
