from itertools import chain
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
    planned: list[str] = sum((sum(year.values(), []) for year in localStorage.planner['years']), [])
    unplanned: list[str] = localStorage.planner['unplanned']
    courses = [
        {
            'code': course,
            'suppressed': localStorage.planner['courses'][course]['supressed'], # this is peter's fault for sucking at spelling
            'mark': localStorage.planner['courses'][course].get('mark', None)
        }
        for course in chain(planned, unplanned)
    ]
    # cancer, but the FE inspired this cancer
    real_planner = localStorage.planner.copy()
    real_planner.pop('courses') # type: ignore
    item = {
        'degree': localStorage.degree,
        'planner': real_planner,
        'courses': courses
    }
    set_user(token, cast(Storage, item))

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

@router.post("/toggleWarnings")
def toggle_warnings(courses: list[str], token: str = DUMMY_TOKEN):
    user = get_user(token)
    for course in courses:
        user['planner']['courses'][course]['suppress'] = not user['planner']['courses'][course]['suppress']
    set_user(token, user, True)

@router.post("/updateCourseMark")
def update_course_mark(course: str, mark: int, token: str = DUMMY_TOKEN):
    user = get_user(token)
    user['planner']['courses'][course]['mark'] = mark
    set_user(token, user, True)
