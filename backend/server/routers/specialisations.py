from fastapi import APIRouter
from server.database import specialisationsCOL
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder

router = APIRouter(
    prefix='/specialisations',
    tags=['specialisations'],
    responses={404: {"description": "Not found"}}
)

@router.get("/")
def specialisations_index():
    return "Index of specialisations"

@router.get("/getSpecialisation/{code}")
def getSpecialisation(code):
    query = { "code" : code }
    result = specialisationsCOL.find_one(query)
    del result["_id"]

    return result

@router.get("/getProgramCode/{code}")
def getCode(code):
    query = { "code" : code }
    result = specialisationsCOL.find_one(query)
    return { "programs" : result["programs"] }

@router.get("/getUOC/{code}")
def getUOC(code):
    query = { "code" : code }
    result = specialisationsCOL.find_one(query)
    return { "UOC" : result["UOC"] }