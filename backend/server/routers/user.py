from typing import cast
from fastapi import APIRouter, HTTPException
from server.database import usersDB
from bson.objectid import ObjectId
from server.routers.model import LocalStorage, Storage
import pydantic
from server.config import DUMMY_TOKEN
pydantic.json.ENCODERS_BY_TYPE[ObjectId]=str

router = APIRouter(
    prefix="/user",
    tags=["user"],
)

# keep this private
def set_user(token: str, item: Storage, overwrite: bool = False):
    data = usersDB['tokens'].find_one({'token': token})
    if data:
        if not overwrite:
            return
        objectID = data['objectId']
        usersDB['users'].update_one({'_id': ObjectId(objectID)}, {'$set': item})
    else:
        objectID = usersDB['users'].insert_one(dict(item)).inserted_id
        usersDB['tokens'].insert_one({'token': token, 'objectId': objectID})


@router.post("/saveLocalStorage/")
def save_local_storage(localStorage: LocalStorage, token: str = DUMMY_TOKEN):
    # TODO: turn giving no token into an error
    # THINK: this is wierd security wise, because we are setting it to what we are given no ma
    item = {
        'degree': localStorage.degree,
        'planner': localStorage.planner
    }
    set_user(token, cast(Storage, item), True) # TODO: turn to false

@router.get("/data/{token}")
def get_user(token: str) -> Storage:
    data = usersDB['tokens'].find_one({'token': token})
    if data is None:
        raise HTTPException(400,f"Invalid token: {token}")
    else:
        return cast(Storage, usersDB['users'].find_one({'_id': ObjectId(data['objectId'])}))

@router.post("/toggleSummerTerm")
def toggle_summer_term(token: str = DUMMY_TOKEN):
    user = get_user(token)
    user['planner']['isSummerEnabled'] = not user['planner']['isSummerEnabled']
    set_user(token, user, True)
