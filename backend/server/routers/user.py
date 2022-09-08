from fastapi import APIRouter, HTTPException
from server.database import usersDB
from bson.objectid import ObjectId
import pydantic 
pydantic.json.ENCODERS_BY_TYPE[ObjectId]=str

router = APIRouter(
    prefix="/user",
    tags=["user"],
)

@router.get("/data/{token}")
def get_user(token = ""):
    data = usersDB['tokens'].find_one({'token': token})
    if data is None:
        raise HTTPException(400,f"Invalid token: {token}")
    else:
        return usersDB['users'].find_one({'_id': ObjectId(data['objectId'])})

